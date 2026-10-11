export type Phase = 'plan' | 'design' | 'delegate' | 'review' | 'close'

export type PlannedTask = {
  title: string
  tier: string
  after: number[]
}

export type Flow = {
  title: string
  total: number
  done: number
  running: number
  phase: Phase
  isFinished: boolean
  tasks: PlannedTask[]
}

export type AgentStatus = 'running' | 'done' | 'failed'

export type AgentRun = {
  id: string
  agentId?: string
  type: string
  description: string
  model: string
  effort?: string
  status: AgentStatus
  startedAt: number
  endedAt?: number
  contextTokens: number
  contextMax: number
  tokens: number
  costUsd: number
  steps: number
  round: number
  /** Self-reported by the worker through the `step` tool. */
  stepDone?: number
  stepTotal?: number
  stepNote?: string
  permissionMode?: string
  /** Approval asks the person was put, hook or rule blocks, and the tool awaiting approval now. */
  asks?: number
  denies?: number
  waitingFor?: string
  /** Notes the worker reported, oldest first. */
  stepLog?: { note: string; done: number }[]
  /** The worker's planned steps, in order. */
  stepPlan?: string[]
  /** Every tool call the agent made, oldest first. */
  calls?: { id: string; tool: string; label: string; at: number; isDone?: boolean; isDenied?: boolean }[]
}

export type Panel = {
  isCompact: boolean
  isDoneCollapsed: boolean
  isTasksHidden?: boolean
  /** Per-agent open or closed choice for the Tasks lists; wins over `isTasksHidden`. */
  taskOverrides?: Record<string, boolean>
  view?: 'list' | 'kanban'
  /** Open or closed Plan and Activity sections, keyed `<agent id>:plan` or `<agent id>:activity`; open when absent. */
  sections?: Record<string, boolean>
  activityLimit?: number
  isActivityAll?: boolean
  autoOpenedFor: string
}

declare module 'claude-code' {
  interface PluginState {
    'savvy-progress': {
      flow: Flow | null
      agents: AgentRun[]
      panel: Panel
      now: number
    }
  }
}
