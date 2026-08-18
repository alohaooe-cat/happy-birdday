import type { BirdType } from './types'

// Минималистичные линейные знаки для трёх результатов теста.
// Одна толщина штриха, без заливок — под лаймовым кругом в .result-mark.

function Lark() {
  return (
    <g className="bird-lines">
      {/* силуэт: голова, тело, поднятый хвост */}
      <path d="M50 30 C62 30 70 38 68 50 C82 56 88 68 88 78 L110 84 L86 92 C68 100 48 98 42 84 C36 70 34 52 38 44 C40 36 44 30 50 30 Z" />
      {/* хохолок */}
      <path d="M49 29 L45 17 M58 31 L61 20" />
      {/* клюв */}
      <path d="M38 43 L18 45 L38 54 Z" />
      {/* крыло */}
      <path d="M52 64 Q66 58 80 70" />
      {/* лапы */}
      <path d="M56 96 L54 106 M72 94 L72 104" />
      <path d="M47 106 L54 106 L61 110 M65 104 L72 104 L79 108" />
      <circle cx="48" cy="45" r="2.6" className="bird-eye" />
    </g>
  )
}

function Pigeon() {
  return (
    <g className="bird-lines">
      {/* веерный хвост */}
      <path d="M86 68 L116 62 L116 90 L86 84 Z" />
      {/* силуэт: маленькая голова на плотном теле */}
      <path d="M38 44 C34 30 46 22 56 28 C62 32 62 40 60 44 C78 48 92 62 92 76 C92 90 76 100 58 100 C40 100 30 86 30 70 C30 58 33 48 38 44 Z" />
      {/* клюв */}
      <path d="M34 30 L18 32 L34 40 Z" />
      {/* воротник */}
      <path d="M36 48 Q50 58 62 47" />
      {/* крыло */}
      <path d="M46 70 Q64 64 82 78" />
      {/* лапы */}
      <path d="M52 100 L50 110 M70 100 L70 110" />
      <path d="M43 110 L50 110 L57 114 M63 110 L70 110 L77 114" />
      <circle cx="45" cy="32" r="2.6" className="bird-eye" />
    </g>
  )
}

function Owl() {
  return (
    <g className="bird-lines">
      {/* силуэт: широкая голова, тело книзу уже */}
      <path d="M60 20 C78 20 90 33 90 50 C90 62 94 74 92 85 C90 98 78 106 60 106 C42 106 30 98 28 85 C26 74 30 62 30 50 C30 33 42 20 60 20 Z" />
      {/* перьевые кисточки */}
      <path d="M38 27 L33 14 M43 23 L40 12 M82 27 L87 14 M77 23 L80 12" />
      {/* лицевой диск */}
      <circle cx="46" cy="49" r="14" />
      <circle cx="74" cy="49" r="14" />
      <circle cx="46" cy="49" r="4.6" className="bird-eye" />
      <circle cx="74" cy="49" r="4.6" className="bird-eye" />
      {/* клюв-крючок */}
      <path d="M56 58 L60 70 L64 58" />
      {/* сложенное крыло */}
      <path d="M76 66 C86 76 86 92 78 102" />
      {/* лапы на ветке */}
      <path d="M48 106 L48 113 M50 113 L44 117 M50 113 L54 117 M72 106 L72 113 M70 113 L66 117 M70 113 L76 117" />
      <path d="M16 113 L104 113" />
    </g>
  )
}

const marks = { lark: Lark, pigeon: Pigeon, owl: Owl }

export function BirdMark({ bird }: { bird: BirdType }) {
  const Mark = marks[bird]
  return (
    <svg
      className={`bird-mark bird-mark-${bird}`}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <Mark />
    </svg>
  )
}
