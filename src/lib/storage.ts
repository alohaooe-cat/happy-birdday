import type { GuestResponse } from '../types'

export const STORAGE_KEY = 'happy-birdday-response-v2'

const endpoint = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ?? '').trim()
// Пропуск для скрипта: отсекает случайный мусор, если кто-то найдёт адрес endpoint.
const formToken = (import.meta.env.VITE_FORM_TOKEN ?? '').trim()

export const hasRemoteEndpoint = Boolean(endpoint)

export function createResponseId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `bird-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function loadResponse(): GuestResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as GuestResponse
    if (!parsed.responseId || !parsed.guestName || !['lark', 'pigeon', 'owl'].includes(parsed.testResult)) return null

    if (parsed.dressPledge === undefined) {
      parsed.dressPledge = false
    }

    if (parsed.attendance === undefined) {
      parsed.attendance = parsed.excursionConfirmed === null
        ? null
        : parsed.excursionConfirmed ? 'walk' : 'later'
    }

    return parsed
  } catch {
    return null
  }
}

export function saveResponse(response: GuestResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(response))
}

// Отправки выстраиваются в очередь. Apps Script отвечает 4-6 секунд, и если
// гость успевает отметиться в стае, пока летит первая отправка (страховка
// после теста), скрипт получает два запроса одновременно, оба не находят
// строку по responseId и оба добавляют новую — в таблице появляется дубль.
let queue: Promise<unknown> = Promise.resolve()

export function sendResponse(response: GuestResponse) {
  const run = queue.then(
    () => postResponse(response),
    () => postResponse(response),
  )
  // хвост очереди не должен падать, иначе следующая отправка не начнётся
  queue = run.catch(() => undefined)
  return run
}

async function postResponse(response: GuestResponse) {
  if (!endpoint) return

  const result = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...response, token: formToken }),
    redirect: 'follow',
  })

  if (!result.ok) {
    throw new Error(`Google Apps Script returned ${result.status}`)
  }

  // Тело ответа читается не всегда — если прочиталось, ловим отказ скрипта.
  let payload: { ok?: boolean; error?: string } | null = null
  try {
    payload = await result.json()
  } catch {
    payload = null
  }

  if (payload && payload.ok === false) {
    throw new Error(`Google Apps Script rejected the request: ${payload.error ?? 'unknown'}`)
  }
}
