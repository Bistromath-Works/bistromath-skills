import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Level, Task } from '../types'

const PANE = 'for-you'
const ADD = 'mcp__for-you__add_task'
const LIST = 'mcp__for-you__list_tasks'

// This project's open tasks, mirrored from $.store so they outlive the chat.
const tasks = atom({ plugin: 'for-you', key: 'tasks' } as const, [])

const LEVELS: { value: Level; tag: string; color: string; when: string }[] = [
  { value: 'blocking', tag: 'blocking', color: 'error', when: "Claude's edits and commands wait for this" },
  { value: 'waiting', tag: 'waiting', color: 'warning', when: 'Claude waits for this' },
  { value: 'later', tag: 'later', color: 'suggestion', when: 'whenever you get to it' },
]
const levelOf = (level: Level) => LEVELS.find(l => l.value === level)!

// Tools that only look, so Claude can still read while a blocking task is open.
const LOOK_ONLY = new Set(['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch', 'ToolSearch', 'AskUserQuestion', ADD, LIST])

// Blocking first, then waiting, then later; oldest first within each.
export function sortTasks(list: Task[]): Task[] {
  const rank = (t: Task) => LEVELS.findIndex(l => l.value === t.level)
  return [...list].sort((a, b) => rank(a) - rank(b) || a.addedAt - b.addedAt)
}

export function statusText(list: Task[]): string | undefined {
  if (list.length === 0) return undefined
  const blocking = list.filter(t => t.level === 'blocking').length
  return `📋 ${list.length} for you${blocking ? ` · ${blocking} blocking` : ''}`
}

export function listText(list: Task[]): string {
  if (list.length === 0) return "The user's For-you queue is empty."
  return sortTasks(list)
    .map((t, i) => `${i + 1}. [${t.level}] ${t.title}${t.details ? `\n   ${t.details.replace(/\n/g, '\n   ')}` : ''}`)
    .join('\n')
}

let storeKey: string | undefined
let isRunning = false
// Inside herdr: the one-line file a tab-bar pill reads ("<open> <blocking>").
let pillPath: string | undefined

// The store is shared by every chat open in this project, so each change
// starts from what it holds now.
async function load($: EngineInterface): Promise<Task[]> {
  if (!storeKey) return read($, tasks)
  return ((await $.store.get(storeKey)) as Task[] | undefined) ?? []
}

async function save($: EngineInterface, list: Task[]) {
  if (storeKey) await $.store.set(storeKey, list)
  await update($, tasks, () => list)
  $.ui.status(statusText(list))
  if (pillPath) {
    const blocking = list.filter(t => t.level === 'blocking').length
    await $.fs.write(pillPath, list.length ? `${list.length} ${blocking}\n` : '').catch(() => undefined)
  }
}

async function addTask($: EngineInterface, input: { title?: unknown; details?: unknown; level?: unknown }): Promise<string> {
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const level = LEVELS.some(l => l.value === input.level) ? (input.level as Level) : 'waiting'
  if (!title) return 'Not added: give the task a title.'
  const details = typeof input.details === 'string' && input.details.trim() ? input.details.trim() : undefined
  const task: Task = { id: `${await $.clock.now()}-${Math.random()}`, title, details, level, addedAt: await $.clock.now() }
  await save($, [...(await load($)), task])

  if (level !== 'later') {
    $.ui.toast(`For you (${level}): ${title}`)
    void $.ui.notify(`Claude needs you: ${title}`, { title: 'For you' }).catch(() => undefined)
  }
  switch (level) {
    case 'blocking':
      return "Added to the user's For-you queue as blocking. Your edits and commands are paused until they tick it off; reading still works. Tell them in one line what you need, then end your turn."
    case 'waiting':
      return "Added to the user's For-you queue. Tell them in one line what you need, then end your turn and wait; they'll tell you when it's done."
    case 'later':
      return "Added to the user's For-you queue for later. Carry on."
  }
}

// You ticked a task: Claude hears about it, now if it's idle, or mid-turn as a note.
async function finish($: EngineInterface, id: string, isDone: boolean) {
  const list = await load($)
  const task = list.find(t => t.id === id)
  if (!task) return
  await save($, list.filter(t => t.id !== id))
  if (!isDone || task.level === 'later') return
  const text = `Done from my For-you queue: ${task.title}`
  if (isRunning) {
    await $.session.append({ message: { type: 'user', content: [{ type: 'text', text }] } }).catch(() => undefined)
  } else {
    // Deferred a tick: a command can't submit while it holds the turn itself.
    $.clock.after(0, () => {
      $.prompt.submit({ text, asUser: true }).catch(error => $.ui.toast(`For you couldn't tell Claude: ${error}`))
    })
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    storeKey = `tasks:${e.cwd}`
    const paneId = await $.env.get('HERDR_PANE_ID')
    const home = await $.env.get('HOME')
    pillPath = paneId && home ? `${home}/.local/state/for-you/${paneId.replace(/[^A-Za-z0-9_-]/g, '_')}.pill` : undefined

    await $.tool.register({
      name: 'add_task',
      description:
        "Put something the user has to do into their For-you queue, a list beside the chat, instead of only writing it in your reply where it gets lost. Use it whenever you need the user to act: set a secret, click something in a dashboard, run a command you can't, sign in, approve or review something, decide something. Also for follow-up work to do later. level: 'blocking' when you can't go on without it (your edits and commands are refused until the user ticks it off), 'waiting' when you should stop and wait for it, 'later' for future work that doesn't hold you up. Title: a short instruction. Details: the exact steps, commands or values, and how the user can tell it worked.",
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short instruction, e.g. "Add STRIPE_KEY to Vercel"' },
          details: { type: 'string', description: 'Exact steps, commands or values, and how to tell it worked' },
          level: { type: 'string', enum: ['blocking', 'waiting', 'later'] },
        },
        required: ['title', 'level'],
      },
      isDeferred: false,
    })
    await $.tool.register({
      name: 'list_tasks',
      description: "Lists the open tasks in the user's For-you queue for this project, blocking first. Check it before picking work back up.",
      inputSchema: { type: 'object', properties: {} },
      isDeferred: false,
    })
    await $.command.register({ name: 'foryou', description: 'For-you queue: /foryou (open pane), /foryou done <n>' })

    const list = await load($)
    await save($, list)
    if (list.length) void $.ui.open({ id: PANE, title: 'For you' })

    return next(e)
  })

  on('session.end', async ($, e, next) => {
    if (pillPath) await $.fs.write(pillPath, '').catch(() => undefined)

    return next(e)
  })

  // Serves this mod's two tools, and is the hard stop: while a blocking task
  // is open, only looking is allowed.
  on('tool.call', async ($, e, next) => {
    // Widened: the typed tool list is a snapshot that may not hold this mod's own.
    const tool: string = e.tool
    if (tool === ADD) return { result: await addTask($, e as { title?: unknown; details?: unknown; level?: unknown }) }
    if (tool === LIST) return { result: listText(await load($)) }
    if (LOOK_ONLY.has(tool)) return next(e)
    const blocking = sortTasks(await read($, tasks)).filter(t => t.level === 'blocking')
    if (blocking.length === 0) return next(e)

    return {
      deny: `Waiting on the user: "${blocking[0]!.title}" is a blocking task in their For-you queue${blocking.length > 1 ? ` (and ${blocking.length - 1} more)` : ''}. Don't work around it. Tell them in one line what you're waiting for, then end your turn. Reading still works.`,
    }
    // If this guard itself fails, Claude carries on rather than being stuck.
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'foryou' }, async ($, e) => {
    const [word, n] = e.args.trim().split(/\s+/)
    if (word === 'done') {
      const task = sortTasks(await load($))[Number(n) - 1]
      if (!task) return { text: 'Usage: /foryou done <number from the pane>' }
      await finish($, task.id, true)
      return { text: `Done: ${task.title}` }
    }
    await $.ui.open({ id: PANE, title: 'For you', focus: true })

    return { text: listText(await load($)) }
  })

  on('turn.start', async ($, e, next) => {
    isRunning = true
    // Another chat in this project may have changed the list.
    await save($, await load($))

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (!e.agentId) isRunning = false

    return result
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const list = sortTasks(await read($, tasks))

    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>Nothing waiting on you.</Text>}
        {list.length > 0 && (
          <Box flexDirection="column" marginBottom={1}>
            {LEVELS.map(l => (
              <Text color={l.color}>
                {l.tag.padEnd(9)}
                <Text dimColor>{l.when}</Text>
              </Text>
            ))}
          </Box>
        )}
        {list.map((task, i) => (
          <Box key={task.id} flexDirection="column" marginBottom={1}>
            <Box>
              <Button key={`done-${task.id}`} label="done" onPress={() => void finish($, task.id, true)} />
              <Button key={`drop-${task.id}`} label="x" onPress={() => void finish($, task.id, false)} />
              <Text color={levelOf(task.level).color}>
                {' '}
                {i + 1}. <Text bold>[{levelOf(task.level).tag}]</Text> {task.title}
              </Text>
            </Box>
            {task.details && <Text dimColor>{task.details}</Text>}
          </Box>
        ))}
      </Box>
    )
  })
}
