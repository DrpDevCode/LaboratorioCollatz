export type Parity = 'par' | 'impar'

/** Estado de uma execução. */
export type RunStatus = 'idle' | 'running' | 'converged' | 'limit' | 'cancelled'
export type FinalStatus = Exclude<RunStatus, 'idle' | 'running'>

/** Uma linha da tabela: a operação aplicada a sequence[step]. */
export interface StepRow {
  step: number
  value: bigint
  parity: Parity
  operation: string
  result: bigint | null
}

export interface CollatzStats {
  start: bigint
  steps: number
  max: bigint
  min: bigint
  maxIndex: number
  evenOps: number
  oddOps: number
  maxDigits: number
}

export interface CollatzResult {
  sequence: bigint[]
  stats: CollatzStats
  status: FinalStatus
  limit: number
}

/** Registro persistido (BigInt serializado como string). */
export interface HistoryEntry {
  id: string
  start: string
  limit: number
  steps: number
  max: string
  status: FinalStatus
  createdAt: number
}
