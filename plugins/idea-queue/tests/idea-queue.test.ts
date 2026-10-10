import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

import { formatIdeas, parseIdea } from '../hooks/register'

const IDLE = 2 * 60 * 1000

// Stands in for the engine: records what the mod submits and answers the box.
function world(on: On, draft = { text: '' }) {
  const sent: string[] = []
  on('prompt.submit', (_$, e) => {
    sent.push(e.text)
    return { text: e.text }
  })
  on('prompt.read', () => ({ value: { text: draft.text, cursor: 0 } }))
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: false as const, reason: 'test' } }))
  on('ui.status', () => ({ value: undefined }))
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('turn.complete', (_$, e) => ({ text: e.answer }))
  const clock = mock.clock(on)
  return { sent, clock, draft }
}

async function finishTurn($: Engine, turnId = 't1') {
  await $.turn.start({ text: '', turnId })
  await $.turn.complete({ answer: 'done', durationMs: 1, isAborted: false, turnId, reason: 'answer' })
}

test('parses type prefixes', () => {
  expect(parseIdea('busy: add tests', 'build')).toEqual({ kind: 'busy', text: 'add tests' })
  expect(parseIdea('broad: tidy settings', 'build')).toEqual({ kind: 'broader', text: 'tidy settings' })
  expect(parseIdea('new: billing', 'build')).toEqual({ kind: 'manual', text: 'billing' })
  expect(parseIdea('plain idea: with colon later', 'busy')).toEqual({ kind: 'busy', text: 'plain idea: with colon later' })
})

test('broader busy work asks for a plan first', () => {
  expect(formatIdeas([{ id: '1', kind: 'broader', text: 'tidy settings' }])).toContain('wait for my go-ahead')
})

test('build-on ideas go at turn end; busy work waits for 2 idle minutes, one at a time; new concepts wait', async ($, on) => {
  const { sent, clock } = world(on)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.turn.start({ text: 'build it', turnId: 't1' })
  await $.command.run({ command: 'idea', args: 'busy: add tests' } as never)
  await $.command.run({ command: 'idea', args: 'busy: fix lint' } as never)
  await $.command.run({ command: 'idea', args: 'build: also mobile' } as never)
  await $.command.run({ command: 'idea', args: 'new: billing' } as never)
  expect(sent).toHaveLength(0)

  await $.turn.complete({ answer: 'done', durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer' })
  await clock.advance(0)
  expect(sent).toHaveLength(1)
  expect(sent[0]).toContain('also mobile')

  await finishTurn($, 't2')
  await clock.advance(IDLE - 1000)
  expect(sent).toHaveLength(1)
  await clock.advance(1000)
  expect(sent).toHaveLength(2)
  expect(sent[1]).toContain('add tests')
  expect(sent[1]).not.toContain('fix lint')

  await finishTurn($, 't3')
  await clock.advance(IDLE)
  expect(sent).toHaveLength(3)
  expect(sent[2]).toContain('fix lint')

  await finishTurn($, 't4')
  await clock.advance(IDLE * 3)
  expect(sent).toHaveLength(3)

  await $.command.run({ command: 'ideas', args: 'send' } as never)
  await clock.advance(0)
  expect(sent[3]).toContain('billing')
})

test('paused sends nothing by itself; typing in the box holds busy work', async ($, on) => {
  const { sent, clock, draft } = world(on)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'ideas', args: 'pause' } as never)
  await $.command.run({ command: 'idea', args: 'build: x' } as never)
  await $.command.run({ command: 'idea', args: 'busy: y' } as never)
  await finishTurn($)
  await clock.advance(IDLE * 2)
  expect(sent).toHaveLength(0)

  draft.text = 'half-typed'
  await $.command.run({ command: 'ideas', args: 'auto' } as never)
  await finishTurn($, 't2')
  await clock.advance(0)
  expect(sent).toHaveLength(1)
  // the build-on idea runs as its own turn; idle counts from its end
  await finishTurn($, 't3')
  await clock.advance(IDLE)
  expect(sent).toHaveLength(1)
  draft.text = ''
  await clock.advance(IDLE)
  expect(sent).toHaveLength(2)
  expect(sent[1]).toContain('y')
})

test('the keys menu opens and its hotkey buttons work on every surface', async ($, on) => {
  const { sent, clock } = world(on)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ plugin: 'idea-queue', surface, component: 'Pane', requestId: 'idea-queue', props: {} as never })
    expect(await ui.find({ type: 'Text', text: /jump into this pane/ })).toBeUndefined()
    await ui.press({ key: 'help' })
    expect(await ui.find({ type: 'Text', text: /jump into this pane/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /in herdr/ })).toBeUndefined()
    await ui.press({ key: 'help' })
    expect(await ui.find({ type: 'Text', text: /jump into this pane/ })).toBeUndefined()
    await ui.unmount()
  }

  const ui = await $.ui.mount({ plugin: 'idea-queue', surface: 'terminal', component: 'Pane', requestId: 'idea-queue', props: {} as never })
  expect((await ui.find({ key: 'kind-key' }))?.text).toContain('build')
  await ui.press({ key: 'kind-key' })
  expect((await ui.find({ key: 'kind-key' }))?.text).toContain('busy')
  await ui.input({ key: 'new', text: 'write docs' })
  await ui.press({ key: 'mode-key' })
  expect((await ui.find({ key: 'mode-key' }))?.text).toBe('auto')
  await ui.press({ key: 'send-all-key' })
  await clock.advance(0)
  expect(sent).toEqual([expect.stringContaining('write docs')])
  await ui.unmount()
})

test('ideas from the herdr popup land in the queue of the matching pane', async ($, on) => {
  const { clock } = world(on)
  mock.env(on, { HERDR_PANE_ID: 'w1:p1', HOME: '/home/me' })
  const dir = '/home/me/.local/state/idea-queue/w1_p1'
  const files = new Map<string, string>([
    [`${dir}/1-1.json`, JSON.stringify({ kind: 'busy', text: 'add tests' })],
    [`${dir}/.2-1.json`, JSON.stringify({ kind: 'build', text: 'half written' })],
  ])
  on('fs.list', () => ({
    value: [...files].map(([path, text]) => ({
      name: path.slice(dir.length + 1), kind: 'file' as const, size: text.length, mtimeMs: 0, isLink: false,
    })),
  }))
  on('fs.read', (_$, e) => ({ value: files.get(e.path) ?? '' }) as never)
  on('fs.write', (_$, e) => {
    files.set(e.path, e.text)
    return { value: undefined }
  })

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await clock.advance(1000)
  expect(files.get(`${dir}/1-1.json`)).toBe('')
  expect(files.get(`${dir}/.2-1.json`)).toContain('half written')
  expect(files.get(`${dir}.pill`)).toBe('1 auto\n')

  const ui = await $.ui.mount({ plugin: 'idea-queue', surface: 'terminal', component: 'Pane', requestId: 'idea-queue', props: {} as never })
  expect(await ui.find({ type: 'Text', text: /add tests/ })).toBeDefined()
  await ui.press({ key: 'help' })
  expect(await ui.find({ type: 'Text', text: /in herdr: add an idea/ })).toBeDefined()
  await ui.unmount()
})
