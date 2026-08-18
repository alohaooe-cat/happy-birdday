export type Flock = 'lark' | 'pigeon' | 'owl'
export type Attendance = 'walk' | 'later' | 'no'
export type BirdType = Flock

export type QuizAnswer = {
  id: string
  label: string
  score: -1 | 0 | 1
}

export type QuizQuestion = {
  id: string
  prompt: string
  answers: QuizAnswer[]
}

export type AnswerRecord = {
  questionId: string
  answerId: string
  score: -1 | 0 | 1
}

export type GuestResponse = {
  responseId: string
  guestName: string
  answers: AnswerRecord[]
  score: number
  testResult: BirdType
  selectedFlock: Flock
  attendance: Attendance | null
  excursionConfirmed: boolean | null
  excursionPartySize: number
  guestMessage?: string
  createdAt: string
  updatedAt: string
}

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error' | 'demo'
