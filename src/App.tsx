import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bird,
  Check,
  CloudRain,
  ExternalLink,
  Feather,
  Gift,
  Minus,
  Plus,
  RefreshCcw,
  Sparkles,
  Umbrella,
  Users,
} from 'lucide-react'
import { BirdMark } from './BirdMark'
import { siteContent } from './data/content'
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

const ui = siteContent.ui

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(initialResponse ? 'demo' : 'idle')
  const [notice, setNotice] = useState('')
  const personalRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>([
      '.content-grid > *',
      '.quiz-shell > *',
      '.personal-result > *',
      '.route-recommendation > *',
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

  const currentQuestion = siteContent.questions[questionIndex]
  const currentAnswerId = quizAnswers[questionIndex]
  const progress = ((questionIndex + 1) / siteContent.questions.length) * 100

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

  const confirmRoute = async () => {
    if (!response || attendance === null) return

    const confirmedFlock: Flock = attendance === 'walk' ? 'lark' : 'owl'
    setSelectedFlock(confirmedFlock)

    const nextResponse: GuestResponse = {
      ...response,
      selectedFlock: confirmedFlock,
      attendance,
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

      <main id="main">
        <section className="cover" id="cover">
          <div className="cover-grid">
            <div className="cover-copy">
              <p className="eyebrow">{siteContent.event.coverLine}</p>
              <h1 className="birdday-lockup" aria-label="Happy Birdday">
                <span className="happy-word" aria-hidden="true">HAPPY</span>
                <span className="birdday-word" aria-hidden="true">
                  <span className="bird-root">BIR<span className="correction-th">th</span></span>
                  <span className="bird-letter">D</span>
                  <span className="day-part">DAY</span>
                </span>
              </h1>
              <Countdown />
            </div>

            <div className="bird-scene">
              <img
                className="hero-birds"
                src="/hero-bird-friends.webp"
                alt={ui.heroAlt}
                fetchPriority="high"
              />
            </div>
          </div>
          <a className="cover-next" href="#test-intro">
            {siteContent.event.coverScrollCue} <ArrowDown size={18} aria-hidden="true" />
          </a>
        </section>

        <div className="flight-marquee" aria-hidden="true">
          <div className="flight-marquee-track">
            {[0, 1].map((group) => (
              <div className="flight-marquee-group" key={group}>
                {ui.marquee.map((word) => (
                  <span key={word}>{word}<i>✦</i></span>
                ))}
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
                  <Bird size={44} strokeWidth={1.4} aria-hidden="true" />
                  <p className="eyebrow">{ui.name.eyebrow}</p>
                  <h2>{ui.name.title}</h2>
                  <p>{ui.name.hint}</p>
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

              <div className="route-recommendation">
                <span>{ui.result.recommended}</span>
                <strong>{result.recommendationTitle}</strong>
                <p>{result.recommendationText}</p>
                {selectedFlock !== result.defaultRoute && <em>{ui.result.keptOriginal}</em>}
              </div>
            </section>

            <section className="personal-plan" aria-labelledby="plan-title">
              <div className="plan-heading">
                <p className="eyebrow">{ui.result.planEyebrow}</p>
                <h2 id="plan-title">{route.label}</h2>
              </div>
              <ol className="route-list">
                {route.items.map((item, index) => (
                  <li key={item}>
                    <span>0{index + 1}</span>
                    <p><RichText text={item} /></p>
                  </li>
                ))}
              </ol>
              {route.items.some((item) => item.includes('Ричард')) && (
                <p className="guide-note"><RichText text={ui.result.guideNote} /></p>
              )}
            </section>

            <CommonSections />

            <section className="confirmation content-grid" id="confirmation" aria-labelledby="confirmation-title">
              <div className="confirmation-intro">
                <p className="eyebrow">{siteContent.confirmation.eyebrow}</p>
                <h2 id="confirmation-title">{siteContent.confirmation.title}</h2>
                <p className="section-lead">{siteContent.confirmation.lead}</p>
              </div>
              <div className="choice-panel">
                <div className="route-options" role="group" aria-label="Участие в прогулке с орнитологом">
                  {siteContent.confirmation.options.map((option, index) => (
                    <button
                      key={String(option.value)}
                      className={`choice-button ${attendance === option.value ? 'is-selected' : ''} ${option.value === 'no' ? 'is-decline' : ''}`}
                      type="button"
                      aria-pressed={attendance === option.value}
                      onClick={() => setAttendance(option.value)}
                    >
                      <span className="choice-index">0{index + 1}</span>
                      <Check size={20} aria-hidden="true" />
                      <span className="choice-hint">{option.hint}</span>
                      <span className="choice-label">{option.label}</span>
                    </button>
                  ))}
                </div>

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

                <div className="guest-message">
                  <label htmlFor="guest-message">{siteContent.confirmation.messageLabel}</label>
                  <p>{siteContent.confirmation.messageHint}</p>
                  <textarea
                    id="guest-message"
                    name="guest-message"
                    rows={4}
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
          <p className="day-note">{ui.dayPlan.note}</p>
        </div>
        <ol className="day-timeline">
          {siteContent.dayPlan.map((item, index) => (
            <li key={item.title}>
              <span className="timeline-index">0{index + 1}</span>
              <div className="timeline-title">
                <h3>{item.title}</h3>
                {'time' in item && <time>{item.time}</time>}
              </div>
              <div>
                <p><RichText text={item.text} /></p>
                {'address' in item && <p className="timeline-address">{item.address}</p>}
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
                <Umbrella size={22} aria-hidden="true" />
                <h3>{scenario.title}</h3>
              </div>
              <ol>
                {scenario.items.map((item) => <li key={item}>{item}</li>)}
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
          <Feather size={40} strokeWidth={1.3} aria-hidden="true" />
          <p className="eyebrow">{ui.dressEyebrow}</p>
          <h2 id="dress-code-title">{siteContent.dressCode.title}</h2>
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
                    src={product.image}
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
              <span className="product-link">
                {'image' in product
                  ? product.url.includes('ozon.ru') ? 'Ozon' : 'AliExpress'
                  : 'AliExpress · ссылка-заглушка'} <ExternalLink size={14} aria-hidden="true" />
              </span>
            </a>
          ))}
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
          {siteContent.gifts.instructions.map((item, index) => (
            <li key={item}><span>0{index + 1}</span><p>{item}</p></li>
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
          <span className="happy-word" aria-hidden="true">HAPPY</span>
          <span className="birdday-word" aria-hidden="true">
            <span className="bird-root">BIR<span className="correction-th">th</span></span>
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
