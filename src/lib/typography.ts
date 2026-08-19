// Русская типографика на этапе рендера: в content.ts тексты остаются
// с обычными пробелами, чтобы их было удобно править руками.

const NBSP = '\u00A0'

// Короткие предлоги и союзы, которые нельзя оставлять в конце строки.
// 1-2 буквы — любые, из трёхбуквенных перечислены только предлоги.
const SHORT_WORD = '(?:[а-яёa-z]{1,2}|для|без|над|под|при|про|изо|обо|ото)'
// Запятая после союза остаётся с ним: «и,» тоже не должно висеть в конце строки.
const HANGING = new RegExp(`(^|[\\s(«"„\\u00A0])(${SHORT_WORD}[,;:]?)[ \t]+`, 'gi')

/** Приклеивает короткие слова к следующему и не даёт тире начинать строку. */
export function typo(text: string): string {
  let out = text
  // Три прохода склеивают цепочки вида «и в этот час»: границу совпадения
  // regexp съедает, поэтому за один проход соседние короткие слова
  // не обрабатываются.
  for (let pass = 0; pass < 3; pass += 1) {
    out = out.replace(HANGING, `$1$2${NBSP}`)
  }
  return out.replace(/ ([—–])/g, `${NBSP}$1`)
}

/**
 * Прогоняет typo по всем строкам дерева. Значения-данные (id, ссылки, даты,
 * литералы вроде 'walk') пробелов не содержат, поэтому не меняются.
 */
export function typoDeep<T>(value: T): T {
  if (typeof value === 'string') return typo(value) as T
  if (Array.isArray(value)) return value.map(typoDeep) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) out[key] = typoDeep(item)
    return out as T
  }
  return value
}
