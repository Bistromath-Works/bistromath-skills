export type IdeaKind = 'build' | 'busy' | 'broader' | 'manual'
export type Idea = { id: string; text: string; kind: IdeaKind }

declare module 'claude-code' {
  interface PluginState {
    'idea-queue': { ideas: Idea[]; isAuto: boolean; draftKind: IdeaKind; isHelpOpen: boolean; editingId: string | null }
  }
}
