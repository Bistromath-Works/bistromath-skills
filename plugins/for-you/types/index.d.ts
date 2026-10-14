// blocking: Claude's edits and commands are refused until it's done.
// waiting: Claude stops and waits by its own judgment.
// later: future work; Claude carries on.
export type Level = 'blocking' | 'waiting' | 'later'
export type Task = { id: string; title: string; details?: string; level: Level; addedAt: number }

declare module 'claude-code' {
  interface PluginState {
    'for-you': { tasks: Task[] }
  }
}
