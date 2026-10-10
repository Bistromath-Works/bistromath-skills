import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

import { formatTokens, statusText, tailText } from '../hooks/register'

const ROWS = [
  { name: 'System prompt', tokens: 3100, color: 'promptBorder', kind: 'used', isDeferred: false },
  { name: 'MCP tools', tokens: 9800, color: 'permission', kind: 'used', isDeferred: false },
  { name: 'Messages', tokens: 33500, color: 'claude', kind: 'used', isDeferred: false },
  { name: 'Free space', tokens: 138000, color: 'inactive', kind: 'free', isDeferred: false },
]

// Stands in for the engine: answers usage at the given fill, records what the mod shows.
function world(on: On, fill = { tokens: 62000, percent: 31 }) {
  const shown = { status: [] as (string | undefined)[], toasts: [] as string[], fullCounts: 0 }
  on('session.usage', (_$, e) => {
    if (e.breakdown === 'full') shown.fullCounts += 1
    const breakdown = e.breakdown
      ? { categories: ROWS, totalTokens: 46400, maxTokens: 200000, rawMaxTokens: 200000, percentage: 23 }
      : undefined
    return { value: { startedAt: 0, rateLimits: [], context: { tokens: fill.tokens, window: 200000, percent: fill.percent, breakdown } } } as never
  })
  on('ui.status', (_$, e) => {
    shown.status.push((e as { text?: string }).text)
    return { value: undefined }
  })
  on('ui.toast', (_$, e) => {
    shown.toasts.push((e as { text: string }).text)
    return { value: undefined }
  })
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: false as const, reason: 'test' } }))
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('turn.complete', (_$, e) => ({ text: e.answer }))
  mock.clock(on)
  return { shown, fill }
}

const endTurn = ($: Engine) =>
  $.turn.complete({ answer: 'done', durationMs: 1, isAborted: false, turnId: 't', reason: 'answer' })

test('formats token counts compactly', () => {
  expect(formatTokens(950)).toBe('950')
  expect(formatTokens(3100)).toBe('3.1k')
  expect(formatTokens(62000)).toBe('62k')
  expect(formatTokens(1_000_000)).toBe('1M')
  expect(statusText(undefined, 200000, undefined)).toBe('🧠 — / 200k')
  expect(statusText(170000, 200000, 85)).toBe('🔴 🧠 170k / 200k · 85%')
})

test('the breakdown line lists what is used, biggest first, without free space', () => {
  expect(tailText(ROWS.filter(r => r.kind === 'used'))).toBe('≈ chat 34k · mcp 9.8k · sys 3.1k')
  expect(tailText([])).toBeUndefined()
})

test('after a turn: status line shows the total, the hint line carries the breakdown', async ($, on) => {
  const { shown } = world(on)
  let drawnTail: string | undefined
  on('ui.render', { component: 'PromptHint' }, ($, e) => {
    drawnTail = e.props.tail
    const { Text } = $.ui.resolve(e)
    return <Text>{e.props.hint}</Text>
  })
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await endTurn($)
  expect(shown.status.at(-1)).toBe('🟢 🧠 62k / 200k · 31%')
  expect(shown.fullCounts).toBe(0)
  const ui = await $.ui.mount({ plugin: 'context-meter', surface: 'terminal', component: 'PromptHint', props: { isDraft: false, isWorking: false, hint: '? for shortcuts' } })
  expect(drawnTail).toBe('≈ chat 34k · mcp 9.8k · sys 3.1k')
  await ui.unmount()
})

test('warns once past 80%, and again only after dropping back below', async ($, on) => {
  const { shown, fill } = world(on, { tokens: 170000, percent: 85 })
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await endTurn($)
  await endTurn($)
  expect(shown.toasts).toHaveLength(1)
  expect(shown.toasts[0]).toContain('85%')

  fill.tokens = 40000
  fill.percent = 20
  await endTurn($)
  fill.tokens = 165000
  fill.percent = 82
  await endTurn($)
  expect(shown.toasts).toHaveLength(2)
})

test('/tokens counts exactly and draws the table on every surface', async ($, on) => {
  const { shown } = world(on)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  const said = await $.command.run({ command: 'tokens', args: '' } as never)
  expect(shown.fullCounts).toBe(1)
  expect((said as { text: string }).text).toContain('46k / 200k (23%), counted exactly')
  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ plugin: 'context-meter', surface, component: 'Pane', requestId: 'context-meter', props: {} as never })
    expect(await ui.find({ type: 'Text', text: /46k \/ 200k · 23% used \(exact\)/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Messages/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Free space/ })).toBeUndefined()
    await ui.press({ key: 'refresh' })
    await ui.unmount()
  }
  expect(shown.fullCounts).toBe(4)
})
