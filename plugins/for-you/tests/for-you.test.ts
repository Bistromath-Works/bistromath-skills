import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

import { listText, statusText } from '../hooks/register'

// Stands in for the engine: records what the mod submits, shows and notifies.
function world(on: On) {
  const sent: string[] = []
  const status: (string | undefined)[] = []
  const notified: string[] = []
  on('prompt.submit', (_$, e) => {
    sent.push(e.text)
    return { text: e.text }
  })
  on('tool.register', () => ({ value: undefined }) as never)
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: false as const, reason: 'test' } }))
  on('ui.status', (_$, e) => {
    status.push(e.text)
    return { value: undefined }
  })
  on('ui.notify', (_$, e) => {
    notified.push(e.text)
    return { value: { isSent: true as const, channel: 'test' } } as never
  })
  on('ui.toast', () => ({ value: undefined }) as never)
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('session.end', () => ({ sessionId: 's' }) as never)
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('turn.complete', (_$, e) => ({ text: e.answer }))
  // Every other tool "runs" and answers ok.
  on('tool.call', () => ({ result: 'ok' }) as never)
  const clock = mock.clock(on)
  mock.store(on)
  mock.env(on, {})
  return { sent, status, notified, clock }
}

const start = ($: Engine, cwd = '/proj') => $.session.start({ cwd, surface: 'terminal', isInteractive: true })
const add = ($: Engine, level: string, title: string) =>
  $.tool.call({ tool: 'mcp__for-you__add_task', tool_use_id: `t-${title}`, title, level } as never)
const bash = ($: Engine) => $.tool.call({ tool: 'Bash', tool_use_id: 'b', command: 'ls' } as never)

test('a blocking task stops edits and commands until you tick it, then Claude is told', async ($, on) => {
  const { sent, status, notified, clock } = world(on)
  await start($)
  expect((await bash($)).deny).toBeUndefined()

  const added = await add($, 'blocking', 'Add STRIPE_KEY to Vercel')
  expect(String(added.result)).toContain('blocking')
  expect(notified).toEqual(['Claude needs you: Add STRIPE_KEY to Vercel'])
  expect(status.at(-1)).toBe('📋 1 for you · 1 blocking')

  expect((await bash($)).deny).toContain('Add STRIPE_KEY to Vercel')
  expect((await $.tool.call({ tool: 'Edit', tool_use_id: 'e', file_path: '/proj/a', old_string: 'a', new_string: 'b' } as never)).deny).toBeDefined()
  expect((await $.tool.call({ tool: 'Read', tool_use_id: 'r', file_path: '/proj/a' } as never)).deny).toBeUndefined()

  const ui = await $.ui.mount({ plugin: 'for-you', surface: 'terminal', component: 'Pane', requestId: 'for-you', props: {} as never })
  const done = await ui.find({ type: 'Button', text: 'done' })
  await ui.press({ key: done!.key! })
  await clock.advance(0)
  expect(sent).toEqual(['Done from my For-you queue: Add STRIPE_KEY to Vercel'])
  expect(status.at(-1)).toBeUndefined()
  expect((await bash($)).deny).toBeUndefined()
  await ui.unmount()
})

test('waiting and later tasks never refuse anything; later ones say nothing when ticked', async ($, on) => {
  const { sent, notified, clock } = world(on)
  await start($)
  await add($, 'waiting', 'Approve the design')
  await add($, 'later', 'Rotate the old API key next month')
  expect((await bash($)).deny).toBeUndefined()
  expect(notified).toEqual(['Claude needs you: Approve the design'])

  await $.command.run({ command: 'foryou', args: 'done 2' } as never)
  await clock.advance(0)
  expect(sent).toEqual([])
  const listed = await $.tool.call({ tool: 'mcp__for-you__list_tasks', tool_use_id: 'l' } as never)
  expect(String(listed.result)).toBe('1. [waiting] Approve the design')
})

test('tasks stay with the project folder across chats', async ($, on) => {
  world(on)
  await start($, '/proj')
  await add($, 'blocking', 'Run the migration')
  await $.session.end({ reason: 'exit' } as never)

  await start($, '/other')
  expect((await bash($)).deny).toBeUndefined()
  await start($, '/proj')
  expect((await bash($)).deny).toContain('Run the migration')
})

test('the list puts blocking first and keeps the details', () => {
  const list = [
    { id: '1', title: 'Later thing', level: 'later' as const, addedAt: 1 },
    { id: '2', title: 'Sign in', details: 'Run: gh auth login', level: 'blocking' as const, addedAt: 2 },
  ]
  expect(listText(list)).toBe('1. [blocking] Sign in\n   Run: gh auth login\n2. [later] Later thing')
  expect(statusText(list)).toBe('📋 2 for you · 1 blocking')
  expect(statusText([])).toBeUndefined()
})
