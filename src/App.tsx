import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bird,
  Check,
  CloudLightning,
  CloudRain,
  ExternalLink,
  Feather,
  Gift,
  Minus,
  Plus,
  RefreshCcw,
  Sparkles,
  Sun,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { BirdMark } from './BirdMark'
import { siteContent as rawContent } from './data/content'
import { typoDeep } from './lib/typography'
import { createResponseId, hasRemoteEndpoint, loadResponse, saveResponse, sendResponse } from './lib/storage'
import type { Attendance, BirdType, Flock, GuestResponse, SaveStatus } from './types'
import './App.css'

type Stage = 'intro' | 'quiz' | 'name' | 'result'

function plural(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

// Неразрывные пробелы после коротких предлогов ставятся один раз на старте:
// в Google Sheet уходят только id и score, тексты туда не попадают.
const siteContent = typoDeep(rawContent)

const ui = siteContent.ui

// Искра рядом с HAPPY: четырёхлучевая звезда с вогнутыми лучами.
function Spark() {
  return (
    <svg className="spark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 0c2 6.4 5.6 10 12 12-6.4 2-10 5.6-12 12-2-6.4-5.6-10-12-12C6.4 10 10 6.4 12 0Z" />
    </svg>
  )
}

// Буквы заголовка приземляются по одной — каждой свой сдвиг старта.
function letters(word: string, offset: number) {
  return [...word].map((char, index) => (
    <span className="ltr" key={index} style={{ animationDelay: `${0.5 + (offset + index) * 0.06}s` }}>
      {char}
    </span>
  ))
}

// Конфетти заданы списком, а не случайными числами: раскладка не прыгает между рендерами.
const CONFETTI = [
  { left: 6, size: 7, round: true, color: 'var(--lime)', opacity: 0.7, duration: 19, delay: -3 },
  { left: 14, size: 5, round: false, color: 'var(--coral)', opacity: 0.6, duration: 24, delay: -11 },
  { left: 23, size: 9, round: true, color: 'var(--white)', opacity: 0.45, duration: 16, delay: -7 },
  { left: 31, size: 6, round: false, color: 'var(--lime)', opacity: 0.55, duration: 27, delay: -18 },
  { left: 39, size: 4, round: true, color: 'var(--coral)', opacity: 0.75, duration: 21, delay: -2 },
  { left: 47, size: 8, round: false, color: 'var(--white)', opacity: 0.4, duration: 25, delay: -14 },
  { left: 55, size: 5, round: true, color: 'var(--lime)', opacity: 0.65, duration: 18, delay: -9 },
  { left: 62, size: 7, round: false, color: 'var(--coral)', opacity: 0.5, duration: 23, delay: -20 },
  { left: 69, size: 4, round: true, color: 'var(--white)', opacity: 0.6, duration: 29, delay: -5 },
  { left: 76, size: 9, round: false, color: 'var(--lime)', opacity: 0.45, duration: 17, delay: -13 },
  { left: 83, size: 6, round: true, color: 'var(--coral)', opacity: 0.7, duration: 26, delay: -1 },
  { left: 89, size: 5, round: false, color: 'var(--white)', opacity: 0.5, duration: 20, delay: -16 },
  { left: 94, size: 8, round: true, color: 'var(--lime)', opacity: 0.55, duration: 22, delay: -8 },
  { left: 2, size: 4, round: false, color: 'var(--coral)', opacity: 0.6, duration: 28, delay: -22 },
]

function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

// Фоновая запись птичьих голосов. Никогда не включается сама — только по клику,
// громкость выводится плавно, чтобы не пугать открывшего страницу.
function BirdSong() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const fadeRef = useRef(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => () => {
    cancelAnimationFrame(fadeRef.current)
    audioRef.current?.pause()
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    cancelAnimationFrame(fadeRef.current)

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    audio.volume = 0
    audio.play().then(() => {
      setPlaying(true)
      const started = performance.now()
      const fade = (now: number) => {
        const ratio = Math.min(1, (now - started) / 900)
        audio.volume = ratio * 0.32
        if (ratio < 1) fadeRef.current = requestAnimationFrame(fade)
      }
      fadeRef.current = requestAnimationFrame(fade)
    }).catch(() => setPlaying(false))
  }

  return (
    <>
      <audio ref={audioRef} src={asset('/bird-song.mp3')} loop preload="none" />
      <button
        className={`bird-song ${playing ? 'is-playing' : ''}`}
        type="button"
        aria-pressed={playing}
        aria-label={playing ? ui.soundPause : ui.soundPlay}
        title={playing ? ui.soundPause : ui.soundPlay}
        onClick={toggle}
      >
        {playing
          ? <Volume2 size={16} strokeWidth={1.9} aria-hidden="true" />
          : <VolumeX size={16} strokeWidth={1.9} aria-hidden="true" />}
        <span className="bird-song-label" aria-hidden="true">{ui.soundLabel}</span>
        {playing && <span className="bird-song-eq" aria-hidden="true"><i /><i /><i /></span>}
      </button>
    </>
  )
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|~[^~]+~|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <mark className="accent-date" key={index}>{part.slice(2, -2)}</mark>
        }
        if (part.startsWith('__') && part.endsWith('__')) {
          return <mark className="accent-date is-alt" key={index}>{part.slice(2, -2)}</mark>
        }
        if (part.startsWith('~') && part.endsWith('~')) {
          return <span className="accent-word" key={index}>{part.slice(1, -1)}</span>
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em className="accent-name" key={index}>{part.slice(1, -1)}</em>
        }
        return part
      })}
    </>
  )
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
}

const COUNTDOWN_TARGET = new Date(siteContent.event.countdownTarget).getTime()

function Countdown() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const left = Math.max(0, COUNTDOWN_TARGET - now)

  if (left === 0) {
    return (
      <div className="countdown is-done">
        <p className="countdown-label">{siteContent.event.countdownDone}</p>
      </div>
    )
  }

  const days = Math.floor(left / 86400000)
  const hours = Math.floor((left % 86400000) / 3600000)
  const minutes = Math.floor((left % 3600000) / 60000)
  const seconds = Math.floor((left % 60000) / 1000)

  const units = [
    { key: 'd', value: days, label: plural(days, 'день', 'дня', 'дней') },
    { key: 'h', value: hours, label: plural(hours, 'час', 'часа', 'часов') },
    { key: 'm', value: minutes, label: plural(minutes, 'минута', 'минуты', 'минут') },
    { key: 's', value: seconds, label: plural(seconds, 'секунда', 'секунды', 'секунд') },
  ]

  return (
    <div className="countdown">
      <p className="countdown-label">{siteContent.event.countdownLabel}</p>
      <ol className="countdown-units">
        {units.map((unit) => (
          <li key={unit.key}>
            <strong>{String(unit.value).padStart(2, '0')}</strong>
            <span>{unit.label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function App() {
  const [initialResponse] = useState(() => loadResponse())
  const [stage, setStage] = useState<Stage>(initialResponse ? 'result' : 'intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(() =>
    siteContent.questions.map((question) =>
      initialResponse?.answers.find((answer) => answer.questionId === question.id)?.answerId ?? null,
    ),
  )
  const [guestName, setGuestName] = useState(initialResponse?.guestName ?? '')
  const [response, setResponse] = useState<GuestResponse | null>(initialResponse)
  const [selectedFlock, setSelectedFlock] = useState<Flock>(initialResponse?.selectedFlock ?? 'owl')
  const [attendance, setAttendance] = useState<Attendance | null>(
    initialResponse?.attendance ?? null,
  )
  const [partySize, setPartySize] = useState(Math.max(1, initialResponse?.excursionPartySize ?? 1))
  const [guestMessage, setGuestMessage] = useState(initialResponse?.guestMessage ?? '')
  const [dressPledge, setDressPledge] = useState(initialResponse?.dressPledge ?? false)
  const [pledgeError, setPledgeError] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(initialResponse ? 'demo' : 'idle')
  const [notice, setNotice] = useState('')
  const personalRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>([
      '.content-grid > *',
      '.quiz-shell > *',
      '.personal-result > *',
      '.plan-heading',
      '.route-list li',
      '.section-heading-row > *',
      '.day-timeline li',
      '.weather-title-block',
      '.weather-scenarios > *',
      '.dress-copy > *',
      '.inspiration-note',
      '.product',
      '.gift-title',
      '.gift-steps li',
      '.final-summary > *',
      '.final-note',
      '.final-actions',
      '.final-invitation',
    ].join(',')))

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    targets.forEach((target, index) => {
      target.classList.add('reveal-target')
      target.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`)
    })

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [stage, response?.testResult])

  // Параллакс обложки: каждый план смещается со своей скоростью.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover)').matches) return

    const layers = Array.from(document.querySelectorAll<HTMLElement>('.cover .px'))
    if (!layers.length) return

    const onMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth) || 10
        layer.style.translate = `${-x * depth}px ${-y * depth * 0.6}px`
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      layers.forEach((layer) => { layer.style.translate = '' })
    }
  }, [])

  const currentQuestion = siteContent.questions[questionIndex]
  const currentAnswerId = quizAnswers[questionIndex]
  // Счётчик считает отвеченные вопросы, а не открытые: до первого выбора он 0%.
  const answeredCount = quizAnswers.filter((answer) => answer !== null).length
  const progress = (answeredCount / siteContent.questions.length) * 100

  const calculatedResult = useMemo(() => {
    const score = siteContent.questions.reduce((sum, question, index) => {
      const answer = question.answers.find((item) => item.id === quizAnswers[index])
      return sum + (answer?.score ?? 0)
    }, 0)
    const bird: BirdType = score >= 2 ? 'lark' : score <= -2 ? 'owl' : 'pigeon'
    return { score, bird }
  }, [quizAnswers])

  const scrollTo = (id: string) => {
    window.setTimeout(() => {
      if (id === 'cover') {
        window.scrollTo({ top: 0, behavior: 'auto' })
        return
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const startTest = () => {
    if (response) {
      setStage('result')
      scrollTo('personal')
      return
    }

    setStage('quiz')
    scrollTo('quiz')
  }

  const selectAnswer = (answerId: string) => {
    setQuizAnswers((answers) => answers.map((answer, index) => (index === questionIndex ? answerId : answer)))
  }

  const nextQuestion = () => {
    if (!currentAnswerId) return
    if (questionIndex < siteContent.questions.length - 1) {
      setQuestionIndex((index) => index + 1)
    } else {
      setStage('name')
    }
  }

  const previousQuestion = () => {
    if (questionIndex === 0) return
    setQuestionIndex((index) => index - 1)
  }

  const submitName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = guestName.trim()
    if (!cleanName) return

    const now = new Date().toISOString()
    const nextResponse: GuestResponse = {
      responseId: response?.responseId ?? createResponseId(),
      guestName: cleanName,
      answers: siteContent.questions.map((question, index) => {
        const answer = question.answers.find((item) => item.id === quizAnswers[index]) ?? question.answers[1]
        return { questionId: question.id, answerId: answer.id, score: answer.score }
      }),
      score: calculatedResult.score,
      testResult: calculatedResult.bird,
      selectedFlock: siteContent.results[calculatedResult.bird].defaultRoute,
      attendance: null,
      dressPledge: false,
      excursionConfirmed: null,
      excursionPartySize: 0,
      guestMessage: response?.guestMessage ?? guestMessage,
      createdAt: response?.createdAt ?? now,
      updatedAt: now,
    }

    saveResponse(nextResponse)
    setResponse(nextResponse)
    setSelectedFlock(nextResponse.selectedFlock)
    setAttendance(null)
    setPartySize(1)
    setSaveStatus('demo')
    setStage('result')
    scrollTo('personal')
  }

  const persistResponse = async (nextResponse: GuestResponse) => {
    saveResponse(nextResponse)
    setResponse(nextResponse)

    if (!hasRemoteEndpoint) {
      setSaveStatus('demo')
      return
    }

    setSaveStatus('saving')
    try {
      await sendResponse(nextResponse)
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    }
  }

  const dressPledgeRequired = attendance !== 'no'
  const effectiveDressPledge = dressPledgeRequired && dressPledge

  const confirmRoute = async () => {
    if (!response || attendance === null) return

    if (dressPledgeRequired && !dressPledge) {
      setPledgeError(true)
      return
    }

    setPledgeError(false)

    const confirmedFlock: Flock = attendance === 'walk' ? 'lark' : 'owl'
    setSelectedFlock(confirmedFlock)

    const nextResponse: GuestResponse = {
      ...response,
      selectedFlock: confirmedFlock,
      attendance,
      dressPledge: effectiveDressPledge,
      excursionConfirmed: attendance === 'walk',
      excursionPartySize: attendance === 'walk' ? Math.max(1, partySize) : 0,
      guestMessage: guestMessage.trim(),
      updatedAt: new Date().toISOString(),
    }
    await persistResponse(nextResponse)
    setNotice(
      attendance === 'walk'
        ? ui.notices.walkConfirmed
        : attendance === 'later'
          ? ui.notices.walkSkipped
          : ui.notices.declined,
    )
    window.setTimeout(() => setNotice(''), 3200)
  }

  const openConfirmation = () => scrollTo('confirmation')

  const restartTest = () => {
    setStage('quiz')
    setQuestionIndex(0)
    setQuizAnswers(siteContent.questions.map(() => null))
    setAttendance(null)
    setNotice(ui.notices.restarted)
    window.setTimeout(() => setNotice(''), 4200)
    scrollTo('quiz')
  }

  const retrySave = async () => {
    if (response) await persistResponse(response)
  }

  const result = response ? siteContent.results[response.testResult] : null
  const route = response ? siteContent.routes[response.testResult] : siteContent.routes.owl
  const isConfirmed = response?.attendance != null
    && response.attendance === attendance
    && response.dressPledge === effectiveDressPledge
    && (response.guestMessage ?? '') === guestMessage.trim()
    && (attendance !== 'walk' || response.excursionPartySize === Math.max(1, partySize))

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">{ui.skipLink}</a>

      <header className="masthead" aria-label="Навигация">
        <button
          className="wordmark"
          aria-label="HAPPY BIRDDAY — на обложку"
          type="button"
          onClick={() => window.scrollTo(0, 0)}
        >
          HB<span>{ui.wordmarkBadge}</span>
        </button>
        <p>{ui.mastheadIssue}</p>
        <a
          className="masthead-link"
          href={response ? '#personal' : '#test-intro'}
          onClick={(event) => { event.preventDefault(); scrollTo(response ? 'personal' : 'test-intro') }}
        >
          {response ? ui.navRoute : ui.navStart} <ArrowRight size={16} aria-hidden="true" />
        </a>
      </header>

      <BirdSong />

      <main id="main">
        <section className="cover" id="cover">
          {/* задний план: пятно-эхо лаймового круга внутри иллюстрации и коралловый клин */}
          <span className="cover-blob px" data-depth="14" aria-hidden="true" />
          <span className="cover-wedge px" data-depth="6" aria-hidden="true" />
          <span className="cover-halftone" aria-hidden="true" />

          <div className="cover-grid">
            <div className="cover-copy px" data-depth="10">
              {/* дата — отдельный стикер над локапом, дублируется в aria-label h1 */}
              <span className="cover-date" aria-hidden="true">{siteContent.event.coverLine}</span>
              <h1 className="birdday-lockup" aria-label={`Happy Birdday. ${siteContent.event.coverLine}`}>
                <span className="cover-tags" aria-hidden="true">
                  <span className="happy-word">HAPPY<Spark /></span>
                </span>
                <span className="birdday-word" aria-hidden="true">
                  <span className="bird-root">{letters('BIR', 0)}</span>
                  <span className="bird-letter">{letters('D', 3)}</span>
                  <span className="day-part">{letters('DAY', 4)}</span>
                </span>
              </h1>
              <Countdown />
              <a className="cover-next" href="#test-intro">
                {siteContent.event.coverScrollCue} <ArrowDown size={18} aria-hidden="true" />
              </a>
              <Feather className="cover-feather px" data-depth="30" size={104} strokeWidth={1.3} aria-hidden="true" />
            </div>

            <div className="bird-scene px" data-depth="22">
              {/* вторая карточка выглядывает сзади — сразу даёт глубину */}
              <span className="scene-back" aria-hidden="true" />
              <div className="scene-card">
                <img
                  className="hero-birds"
                  src={asset('/hero-bird-friends.webp')}
                  alt={ui.heroAlt}
                  fetchPriority="high"
                />
                <span className="scene-caption" aria-hidden="true">{ui.coverCardCaption}</span>
              </div>
              {/* передний план: птица вылетает за рамку открытки */}
              <Bird className="scene-escapee" size={116} strokeWidth={1.5} aria-hidden="true" />
            </div>
          </div>

          <Bird className="cover-flyby" size={64} strokeWidth={1.6} aria-hidden="true" />

          <div className="cover-confetti" aria-hidden="true">
            {CONFETTI.map((bit, index) => (
              <i
                key={index}
                style={{
                  left: `${bit.left}%`,
                  width: `${bit.size}px`,
                  height: `${bit.size * (bit.round ? 1 : 1.7)}px`,
                  background: bit.color,
                  borderRadius: bit.round ? '50%' : '0',
                  opacity: bit.opacity,
                  animationDuration: `${bit.duration}s`,
                  animationDelay: `${bit.delay}s`,
                }}
              />
            ))}
          </div>

          <span className="cover-frame" aria-hidden="true" />
          <span className="cover-grain" aria-hidden="true" />
        </section>

        <div className="flight-marquee" aria-hidden="true">
          <div className="flight-marquee-track">
            {[0, 1].map((group) => (
              <div className="flight-marquee-group" key={group}>
                {[0, 1, 2, 3, 4].map((pass) => ui.marquee.map((word) => (
                  <span key={`${pass}-${word}`}>{word}<i>✦</i></span>
                )))}
              </div>
            ))}
          </div>
        </div>

        <section className="test-intro content-grid" id="test-intro">
          <div>
            <p className="eyebrow">{ui.introEyebrow}</p>
            <h2>{siteContent.intro.title}</h2>
          </div>
          <div className="intro-copy">
            <p><RichText text={siteContent.intro.text} /></p>
            <button className="button button-primary" type="button" onClick={startTest}>
              {response ? ui.introReturn : siteContent.intro.button}
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
        </section>

        {(stage === 'quiz' || stage === 'name') && (
          <section className="quiz-section" id="quiz" aria-labelledby="quiz-heading">
            <div className="quiz-shell">
              {stage === 'quiz' ? (
                <>
                  <div className="quiz-meta">
                    <p id="quiz-heading">{fill(ui.quiz.progress, { n: questionIndex + 1, total: siteContent.questions.length })}</p>
                    <p>{Math.round(progress)}%</p>
                  </div>
                  <div className="progress-track" aria-hidden="true">
                    <div style={{ width: `${progress}%` }} />
                  </div>
                  <fieldset className="question-fieldset">
                    <legend>{currentQuestion.prompt}</legend>
                    <div className="answer-list">
                      {currentQuestion.answers.map((answer) => (
                        <button
                          key={answer.id}
                          className={`answer-button ${currentAnswerId === answer.id ? 'is-selected' : ''}`}
                          type="button"
                          aria-pressed={currentAnswerId === answer.id}
                          onClick={() => selectAnswer(answer.id)}
                        >
                          <Check size={18} aria-hidden="true" />
                          <span className="answer-label">{answer.label}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="quiz-actions">
                    <button className="button button-ghost" type="button" onClick={previousQuestion} disabled={questionIndex === 0}>
                      <ArrowLeft size={18} aria-hidden="true" /> {ui.quiz.back}
                    </button>
                    <button className="button button-dark" type="button" onClick={nextQuestion} disabled={!currentAnswerId}>
                      {questionIndex === siteContent.questions.length - 1 ? ui.quiz.finish : ui.quiz.next}
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : (
                <form className="name-form" onSubmit={submitName}>
                  <div className="name-kicker">
                    <Bird size={38} strokeWidth={1.5} aria-hidden="true" />
                    <p className="eyebrow">{ui.name.eyebrow}</p>
                  </div>
                  <h2>{ui.name.title}</h2>
                  <p className="name-hint">{ui.name.hint}</p>
                  <div className="name-field">
                    <label htmlFor="guest-name">{ui.name.label}</label>
                    <input
                    id="guest-name"
                    name="guest-name"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    autoComplete="name"
                    autoFocus
                    required
                    maxLength={80}
                    placeholder={ui.name.placeholder}
                    />
                  </div>
                  <div className="quiz-actions">
                    <button className="button button-ghost" type="button" onClick={() => setStage('quiz')}>
                      <ArrowLeft size={18} aria-hidden="true" /> {ui.name.back}
                    </button>
                    <button className="button button-primary" type="submit">
                      {ui.name.submit} <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        )}

        {stage === 'result' && response && result && (
          <>
            <section className={`personal personal-${response.testResult}`} id="personal" ref={personalRef}>
              <div className="personal-result">
                <div className="result-mark" aria-hidden="true">
                  <BirdMark bird={response.testResult} />
                </div>
                <div>
                  <p className="eyebrow">{fill(ui.result.eyebrow, { name: response.guestName })}</p>
                  <h2>{fill(ui.result.title, { bird: result.title })}</h2>
                  <p className="result-text"><RichText text={result.description} /></p>
                </div>
              </div>
            </section>

            <section className="personal-plan" aria-labelledby="plan-title">
              <div className="plan-heading">
                <p className="eyebrow">{ui.result.recommended}</p>
                <h2 id="plan-title">{route.label}</h2>
                <p className="plan-lead">{result.recommendationText}</p>
                {selectedFlock !== result.defaultRoute && (
                  <em className="plan-kept">{ui.result.keptOriginal}</em>
                )}
              </div>
              <div className="plan-list">
                <p className="eyebrow">{ui.result.planEyebrow}</p>
                <ol className="route-list">
                  {route.items.map((item) => (
                    <li key={item}>
                      <span className="list-mark" aria-hidden="true"><Feather size={19} strokeWidth={1.7} /></span>
                      <p><RichText text={item} /></p>
                    </li>
                  ))}
                </ol>
                {route.items.some((item) => item.includes('Ричард')) && (
                  <p className="guide-note"><RichText text={ui.result.guideNote} /></p>
                )}
              </div>
            </section>

            <CommonSections />

            <section className="confirmation content-grid" id="confirmation" aria-labelledby="confirmation-title">
              <div className="confirmation-intro">
                <p className="eyebrow">{siteContent.confirmation.eyebrow}</p>
                <h2 id="confirmation-title">{siteContent.confirmation.title}</h2>
                <p className="section-lead">{siteContent.confirmation.lead}</p>
              </div>
              <div className="choice-panel">
                <span className="panel-sticker" aria-hidden="true">{siteContent.confirmation.panelSticker}</span>
                <div className="route-options" role="group" aria-label="Участие в прогулке с орнитологом">
                  {siteContent.confirmation.options.map((option) => (
                    <button
                      key={String(option.value)}
                      className={`choice-button ${attendance === option.value ? 'is-selected' : ''} ${option.value === 'no' ? 'is-decline' : ''}`}
                      type="button"
                      aria-pressed={attendance === option.value}
                      onClick={() => {
                        setAttendance(option.value)
                        if (option.value === 'no') setPledgeError(false)
                      }}
                    >
                      <Check size={20} aria-hidden="true" />
                      <span className="choice-hint">{option.hint}</span>
                      <span className="choice-label">{option.label}</span>
                    </button>
                  ))}
                </div>

                <div className="panel-row">
                  {attendance === 'walk' && (
                  <div className="party-size">
                    <div>
                      <label htmlFor="party-size">{siteContent.confirmation.partyLabel}</label>
                      <p>{siteContent.confirmation.partyHint}</p>
                    </div>
                    <div className="stepper">
                      <button type="button" aria-label="Уменьшить количество" onClick={() => setPartySize((value) => Math.max(1, value - 1))}>
                        <Minus size={18} aria-hidden="true" />
                      </button>
                      <input
                        id="party-size"
                        type="number"
                        min="1"
                        max="20"
                        inputMode="numeric"
                        value={partySize}
                        onChange={(event) => setPartySize(Math.max(1, Number(event.target.value) || 1))}
                      />
                      <button type="button" aria-label="Увеличить количество" onClick={() => setPartySize((value) => Math.min(20, value + 1))}>
                        <Plus size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  )}

                <div className={`dress-pledge ${pledgeError ? 'has-error' : ''} ${dressPledgeRequired ? '' : 'is-muted'}`}>
                  <label>
                    <input
                      type="checkbox"
                      disabled={!dressPledgeRequired}
                      checked={effectiveDressPledge}
                      onChange={(event) => {
                        setDressPledge(event.target.checked)
                        if (event.target.checked) setPledgeError(false)
                      }}
                    />
                    <Check size={18} aria-hidden="true" />
                    <span>
                      <strong>{siteContent.confirmation.dressPledgeLabel}</strong>
                      <em>{siteContent.confirmation.dressPledgeHint}</em>
                    </span>
                  </label>
                  {pledgeError && (
                    <p className="pledge-error" role="alert">{siteContent.confirmation.dressPledgeError}</p>
                  )}
                </div>
                </div>

                <div className="guest-message">
                  <div className="field-head">
                    <label htmlFor="guest-message">{siteContent.confirmation.messageLabel}</label>
                    <p>{siteContent.confirmation.messageHint}</p>
                  </div>
                  <textarea
                    id="guest-message"
                    name="guest-message"
                    rows={2}
                    maxLength={500}
                    value={guestMessage}
                    onChange={(event) => setGuestMessage(event.target.value)}
                    placeholder={siteContent.confirmation.messagePlaceholder}
                  />
                </div>

                <button className="button button-dark confirm-button" type="button" onClick={confirmRoute} disabled={attendance === null || saveStatus === 'saving'}>
                  {saveStatus === 'saving' ? siteContent.confirmation.saving : siteContent.confirmation.submit} <Feather size={18} aria-hidden="true" />
                </button>

                {isConfirmed && (
                  <div className={`saved-state ${response.attendance === 'no' ? 'is-decline' : ''}`}>
                    <Check size={20} aria-hidden="true" />
                    <div>
                      <strong>
                        {response.attendance === 'no' ? ui.saved.declinedTitle : siteContent.confirmation.savedTitle}
                      </strong>
                      <p>
                        {response.attendance === 'walk'
                          ? fill(ui.saved.walk, { count: `${response.excursionPartySize} ${plural(response.excursionPartySize, 'птица', 'птицы', 'птиц')}` })
                          : response.attendance === 'later'
                            ? ui.saved.later
                            : siteContent.confirmation.savedNo}
                      </p>
                    </div>
                  </div>
                )}

                <SaveMessage status={saveStatus} onRetry={retrySave} />
              </div>
            </section>

            <Finale
              guestName={response.guestName}
              selectedFlock={selectedFlock}
              attendance={response.attendance}
              partySize={response.excursionPartySize}
              onEditRoute={openConfirmation}
              onRestart={restartTest}
            />
          </>
        )}
      </main>

      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  )
}

function SaveMessage({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status === 'idle') return null

  if (status === 'saving') {
    return <p className="save-message" role="status">{ui.save.sending}</p>
  }

  if (status === 'success') {
    return <p className="save-message is-success" role="status">{ui.save.success}</p>
  }

  if (status === 'error') {
    return (
      <div className="save-message is-error" role="alert">
        <p>{ui.save.error}</p>
        <button className="text-button" type="button" onClick={onRetry}>{ui.save.retry}</button>
      </div>
    )
  }

  return (
    <p className="save-message" role="status">{ui.save.demo}</p>
  )
}

function CommonSections() {
  return (
    <div className="common-sections">
      <section className="day-plan" id="day-plan" aria-labelledby="day-plan-title">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">{ui.dayPlan.eyebrow}</p>
            <h2 id="day-plan-title">{ui.dayPlan.title}</h2>
          </div>
        </div>
        <ol className="day-timeline">
          {siteContent.dayPlan.map((item) => (
            <li key={item.title}>
              <span className="timeline-index" aria-hidden="true"><Feather size={22} strokeWidth={1.8} /></span>
              <div className="timeline-title">
                <h3>{item.title}</h3>
                {'time' in item && <time>{item.time}</time>}
              </div>
              <div>
                <p><RichText text={item.text} /></p>
                {'links' in item && (
                  <div className="timeline-links">
                    {item.links.map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                        {link.label} <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="weather" aria-labelledby="weather-title">
        <div className="weather-title-block">
          <CloudRain size={36} strokeWidth={1.4} aria-hidden="true" />
          <p className="eyebrow">{ui.weather.eyebrow}</p>
          <h2 id="weather-title">{ui.weather.titleTop}<br />{ui.weather.titleBottom}</h2>
        </div>
        <div className="weather-scenarios">
          {siteContent.weatherScenarios.map((scenario) => (
            <article key={scenario.id}>
              <div>
                {scenario.icon === 'sun'
                  ? <Sun size={24} aria-hidden="true" />
                  : <CloudLightning size={24} aria-hidden="true" />}
                <h3>{scenario.title}</h3>
              </div>
              <ol>
                {scenario.items.map((item) => (
                  <li key={item}>
                    <span className="list-mark" aria-hidden="true"><Feather size={16} strokeWidth={1.8} /></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
          <aside className="walk-clothing">
            <p className="eyebrow">{ui.weather.walkEyebrow}</p>
            <h3>{siteContent.walkClothing.title}</h3>
            <p>{siteContent.walkClothing.text}</p>
          </aside>
        </div>
      </section>

      <section className="dress-code" id="dress-code" aria-labelledby="dress-code-title">
        <div className="dress-copy">
          <div className="dress-heading">
            <Feather size={40} strokeWidth={1.3} aria-hidden="true" />
            <p className="eyebrow">{ui.dressEyebrow}</p>
            <h2 id="dress-code-title">{siteContent.dressCode.title}</h2>
          </div>
          <div className="dress-details">
            <p>{siteContent.dressCode.text}</p>
          </div>
        </div>
        <p className="inspiration-note">{siteContent.dressCode.inspirationText}</p>
        <div className="product-grid" aria-label="Подборка аксессуаров">
          {siteContent.products.map((product) => (
            <a key={product.id} className="product" href={product.url} target="_blank" rel="noreferrer">
              <div className={`product-placeholder accent-${product.accent} ${'image' in product ? 'has-image' : ''}`}>
                {'image' in product ? (
                  <img
                    src={asset(product.image)}
                    alt={product.name}
                    width={product.imageWidth}
                    height={product.imageHeight}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <>
                    <Feather aria-hidden="true" />
                    <span>изображение позже</span>
                  </>
                )}
              </div>
              <strong>{product.name}</strong>

            </a>
          ))}
          {/* выемка сердца: перья сыпятся в ложбинку между долями.
              Стоит последним ребёнком, чтобы не сбить nth-child у карточек. */}
          <span className="heart-nook" aria-hidden="true">
            <Feather size={54} strokeWidth={1.35} />
            <Feather size={41} strokeWidth={1.5} />
            <Feather size={30} strokeWidth={1.7} />
          </span>
        </div>
      </section>

      <section className="gifts" id="gifts" aria-labelledby="gifts-title">
        <div className="gift-title">
          <Gift size={42} strokeWidth={1.3} aria-hidden="true" />
          <p className="eyebrow">{ui.giftsEyebrow}</p>
          <h2 id="gifts-title">{siteContent.gifts.title}</h2>
          <p>{siteContent.gifts.text}</p>
          <a className="button button-dark" href={siteContent.gifts.wishlistUrl} target="_blank" rel="noreferrer">
            {ui.giftsButton} <ExternalLink size={18} aria-hidden="true" />
          </a>
        </div>
        <ol className="gift-steps">
          {siteContent.gifts.instructions.map((item) => (
            <li key={item}>
              <span className="list-mark" aria-hidden="true"><Feather size={19} strokeWidth={1.7} /></span>
              <p>{item}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function Finale({
  guestName,
  selectedFlock,
  attendance,
  partySize,
  onEditRoute,
  onRestart,
}: {
  guestName: string
  selectedFlock: Flock
  attendance: Attendance | null
  partySize: number
  onEditRoute: () => void
  onRestart: () => void
}) {
  const declined = attendance === 'no'
  return (
      <footer className="finale">
        <div className="finale-topline"><Sparkles size={22} aria-hidden="true" /><span>{ui.finale.topline}</span></div>
        <h2 className="birdday-lockup" aria-label="Happy Birdday">
          <span className="happy-word" aria-hidden="true">HAPPY<Spark /></span>
          <span className="birdday-word" aria-hidden="true">
            <span className="bird-root">BIR</span>
            <span className="bird-letter">D</span>
            <span className="day-part">DAY</span>
          </span>
        </h2>
        <p className="finale-subtitle">{siteContent.event.eventDate} {siteContent.event.year} · {ui.finale.city}</p>
        <div className="final-summary">
          <div>
            <span>{ui.finale.routeLabel}</span>
            <strong>{declined ? ui.finale.routeDeclined : siteContent.routes[selectedFlock].label}</strong>
          </div>
          <div>
            <span>{ui.finale.walkLabel}</span>
            <strong>
              {attendance === 'walk'
                ? fill(ui.finale.walkConfirmed, { count: `${partySize} ${plural(partySize, 'птица', 'птицы', 'птиц')}` })
                : attendance === 'later'
                  ? ui.finale.walkLater
                  : declined
                    ? ui.finale.walkDeclined
                    : ui.finale.walkPending}
            </strong>
          </div>
        </div>
        <p className="final-note">
          {declined ? ui.finale.noteDeclined : ui.finale.note}
        </p>
        <div className="final-actions">
          <button className="button button-light" type="button" onClick={onEditRoute}>
            <Users size={18} aria-hidden="true" /> {ui.finale.editRoute}
          </button>
          <button className="button button-outline-light" type="button" onClick={onRestart}>
            <RefreshCcw size={18} aria-hidden="true" /> {ui.finale.restart}
          </button>
        </div>
        <p className="final-invitation">
          {fill(declined ? ui.finale.invitationDeclined : ui.finale.invitation, { name: guestName })}
        </p>
      </footer>
  )
}

export default App
