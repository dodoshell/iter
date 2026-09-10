// Design tokens centralizzati: valori di riferimento per chi scrive nuovi componenti,
// non un livello di astrazione sopra Tailwind. Le classi restano Tailwind puro;
// qui si documenta e si nomina la scala così i componenti restano coerenti tra loro.

/** Scala spaziale a 4px. Corrisponde 1:1 alla scala di default di Tailwind (p-1 = 4px, ecc.). */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const

/** Raggi standard: rounded-md per controlli interattivi, rounded-lg per card e superfici. */
export const radius = {
  control: 'rounded-md',
  surface: 'rounded-lg',
  pill: 'rounded-full',
} as const

export const elevation = {
  card: 'shadow-sm',
  raised: 'shadow-md',
  overlay: 'shadow-lg',
} as const

/** Gerarchia tipografica: da usare al posto di combinazioni text/font scelte ad-hoc. */
export const typography = {
  h1: 'text-3xl font-semibold tracking-tight text-foreground',
  h2: 'text-2xl font-semibold tracking-tight text-foreground',
  h3: 'text-xl font-semibold text-foreground',
  h4: 'text-lg font-semibold text-foreground',
  h5: 'text-base font-semibold text-foreground',
  h6: 'text-sm font-semibold text-foreground',
  body: 'text-sm text-foreground',
  bodyMuted: 'text-sm text-muted-foreground',
  label: 'text-sm font-medium text-foreground',
  small: 'text-xs text-muted-foreground',
} as const

/** Durate/curve di transizione condivise, per evitare micro-differenze tra componenti. */
export const motion = {
  fast: 'duration-150 ease-out',
  base: 'duration-200 ease-out',
} as const
