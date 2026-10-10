export type Row = { name: string; tokens: number; color: string }
export type Exact = { rows: Row[]; total: number; window: number; percent: number; at: number }

declare module 'claude-code' {
  interface PluginState {
    'context-meter': { rows: Row[]; exact: Exact | null; isCounting: boolean; hasWarned: boolean }
  }
}
