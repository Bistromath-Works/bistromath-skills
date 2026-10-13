import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import type { Idea, IdeaKind } from '../types'

const PANE = 'idea-queue'
const IDLE_MS = 2 * 60 * 1000

const ideas = atom({ plugin: 'idea-queue', key: 'ideas' } as const, [])
const isAuto = atom({ plugin: 'idea-queue', key: 'isAuto' } as const, true)
const draftKind = atom({ plugin: 'idea-queue', key: 'draftKind' } as const, 'build')
const isHelpOpen = atom({ plugin: 'idea-queue', key: 'isHelpOpen' } as const, false)

// The keys menu, in plain words: [keys, what they do, inside herdr only?].
const HELP: [string, string, 'herdr'?][] = [
  ['ctrl+x tab', 'jump into this pane (or click it); Esc jumps back out'],
  ['Tab / arrows', 'move between the boxes and buttons'],
  ['Enter', 'queue the idea you typed, or press the highlighted button'],
  ['h', 'show / hide this keys menu'],
  ['s', 'send every waiting idea now'],
  ['p', 'switch between Auto and Paused'],
  ['t', 'change the type for your next idea'],
  ['[type]', 'press the [build] / [busy] … tag on a waiting idea to change its type'],
  ['', 'letter keys work when a button is highlighted, not while typing an idea'],
  ['/idea busy: …', 'queue from the normal prompt (build: busy: broad: new:)'],
  ['/ideas send', 'send all · /ideas auto · /ideas pause · /ideas opens this pane'],
  ['Ctrl+B, i', 'in herdr: add an idea from a popup, even mid-build', 'herdr'],
  ['Ctrl+B, I', 'in herdr: open this pane (Shift+I)', 'herdr'],
  ['build', 'sends right after Claude finishes a turn'],
  ['busy', 'sends after Claude sits idle 2 minutes, one at a time'],
  ['broad', 'like busy, but Claude plans first and waits for your OK'],
  ['new', 'waits until you send it yourself'],
]

// Colors are theme keys, so they follow the person's light or dark theme.
const KINDS: { value: IdeaKind; label: string; tag: string; color: string; when: string }[] = [
  { value: 'build', label: 'Build-on (sends at turn end)', tag: 'build', color: 'suggestion', when: 'next turn' },
  { value: 'busy', label: 'Busy work (sends when idle)', tag: 'busy', color: 'success', when: 'when idle' },
  { value: 'broader', label: 'Broader busy work (idle, plan first)', tag: 'broad', color: 'warning', when: 'idle, plans first' },
  { value: 'manual', label: 'New concept (only on Send)', tag: 'new', color: 'merged', when: 'waits for you' },
]
const tagOf = (kind: IdeaKind) => KINDS.find(k => k.value === kind)?.tag ?? kind
const colorOf = (kind: IdeaKind) => KINDS.find(k => k.value === kind)?.color

// `/idea busy: text` picks the type by prefix; no prefix uses the pane's choice.
const PREFIXES: Record<string, IdeaKind> = {
  build: 'build',
  busy: 'busy',
  broad: 'broader',
  broader: 'broader',
  new: 'manual',
  manual: 'manual',
}

export function parseIdea(args: string, fallback: IdeaKind): { text: string; kind: IdeaKind } {
  const match = /^\s*(\w+)\s*:\s*([\s\S]*)$/.exec(args)
  const kind = match ? PREFIXES[match[1]!.toLowerCase()] : undefined
  return kind ? { kind, text: match![2]!.trim() } : { kind: fallback, text: args.trim() }
}

export function formatIdeas(list: Idea[]): string {
  if (list.length === 1) {
    return formatOne(list[0]!)
  }
  return [
    'Ideas from my queue:',
    ...list.map((idea, i) => `${i + 1}. [${tagOf(idea.kind)}] ${idea.text}`),
    ...(list.some(idea => idea.kind === 'broader')
      ? ['', 'For the [broad] ones: propose a short plan first and wait for my go-ahead before building.']
      : []),
  ].join('\n')
}

function formatOne(idea: Idea): string {
  switch (idea.kind) {
    case 'build':
      return `Idea I had while you were working, building on what you just did:\n${idea.text}`
    case 'busy':
      return `Busy work from my idea queue:\n${idea.text}`
    case 'broader':
      return `Idea from my queue:\n${idea.text}\n\nPropose a short plan first and wait for my go-ahead before building.`
    case 'manual':
      return `New idea:\n${idea.text}`
  }
}

let isRunning = false
let idleTimer: Timer | undefined
let inboxTimer: Timer | undefined
// Inside herdr: the one-line file herdr's status pill (herdr/idea-pill.sh) reads.
let pillPath: string | undefined

// herdr's popup (herdr/idea-popup.sh) drops one JSON file per idea into
// ~/.local/state/idea-queue/<pane>/, named the way the script names it.
export function inboxDir(home: string, paneId: string): string {
  return `${home}/.local/state/idea-queue/${paneId.replace(/[^A-Za-z0-9_-]/g, '_')}`
}

// Takes each new file in the inbox: emptied once read, so it is taken once
// (the popup clears empty ones). Dot-files are still being written.
async function pollInbox($: EngineInterface, dir: string) {
  const entries = await $.fs.list(dir).catch(() => [])
  for (const entry of entries) {
    if (entry.kind !== 'file' || entry.size === 0 || entry.name.startsWith('.')) continue
    const path = `${dir}/${entry.name}`
    const raw = await $.fs.read(path).catch(() => '')
    await $.fs.write(path, '')
    try {
      const drop = JSON.parse(raw) as { action?: string; kind?: IdeaKind; text?: string }
      if (drop.action === 'open') {
        await $.ui.open({ id: PANE, title: 'Idea queue', focus: true })
      } else if (drop.text && KINDS.some(k => k.value === drop.kind)) {
        await addIdea($, drop.text, drop.kind!)
        $.ui.toast(`Queued from herdr (${tagOf(drop.kind!)}): ${drop.text}`)
      }
    } catch {
      $.ui.toast('Idea queue: skipped an unreadable idea from herdr')
    }
  }
}

function stopIdle() {
  idleTimer?.cancel()
  idleTimer = undefined
}

async function refreshStatus($: EngineInterface) {
  const list = await read($, ideas)
  const mode = (await read($, isAuto)) ? 'auto' : 'paused'
  $.ui.status(list.length ? `💡 ${list.length} idea${list.length === 1 ? '' : 's'} (${mode})` : undefined)
  if (pillPath) await $.fs.write(pillPath, `${list.length} ${mode}\n`).catch(() => undefined)
}

// Takes the given ideas off the queue and sends them as one message.
async function send($: EngineInterface, chosen: Idea[]) {
  if (chosen.length === 0) return
  const ids = new Set(chosen.map(idea => idea.id))
  await update($, ideas, list => list.filter(idea => !ids.has(idea.id)))
  await refreshStatus($)
  // Deferred a tick: a command can't submit while it holds the turn itself.
  $.clock.after(0, () => {
    $.prompt.submit({ text: formatIdeas(chosen), asUser: true }).catch(error => {
      $.ui.toast(`Idea queue couldn't send: ${error}`)
    })
  })
}

// Arms the idle timer when Claude is idle, auto is on and busy work waits.
async function armIdle($: EngineInterface) {
  if (idleTimer || isRunning || !(await read($, isAuto))) return
  const list = await read($, ideas)
  if (!list.some(idea => idea.kind === 'busy' || idea.kind === 'broader')) return
  idleTimer = $.clock.after(IDLE_MS, () => {
    idleTimer = undefined
    void (async () => {
      if (isRunning || !(await read($, isAuto))) return
      // You've started typing: give you another idle window instead.
      if ((await $.prompt.read()).text.trim()) return armIdle($)
      const next = (await read($, ideas)).find(idea => idea.kind === 'busy' || idea.kind === 'broader')
      if (next) await send($, [next])
    })()
  })
}

async function addIdea($: EngineInterface, text: string, kind: IdeaKind) {
  if (!text.trim()) return
  const idea: Idea = { id: `${await $.clock.now()}-${Math.random()}`, text: text.trim(), kind }
  await update($, ideas, list => [...list, idea])
  await refreshStatus($)
  await armIdle($)
}

// Moves a waiting idea to the next type; it then sends the way its new type does.
async function cycleKind($: EngineInterface, id: string) {
  await update($, ideas, list =>
    list.map(idea =>
      idea.id === id ? { ...idea, kind: KINDS[(KINDS.findIndex(k => k.value === idea.kind) + 1) % KINDS.length]!.value } : idea,
    ),
  )
  await armIdle($)
}

async function setAuto($: EngineInterface, value: boolean) {
  await update($, isAuto, () => value)
  if (value) await armIdle($)
  else stopIdle()
  await refreshStatus($)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const paneId = await $.env.get('HERDR_PANE_ID')
    const home = await $.env.get('HOME')
    pillPath = paneId && home ? `${inboxDir(home, paneId)}.pill` : undefined
    await $.command.register({
      name: 'idea',
      description: 'Queue an idea: /idea [build|busy|broad|new:] text',
    })
    await $.command.register({
      name: 'ideas',
      description: 'Idea queue: /ideas (open pane), /ideas send, /ideas auto, /ideas pause',
    })
    void $.ui.open({ id: PANE, title: 'Idea queue' })
    await refreshStatus($)
    await armIdle($)

    // Inside a herdr pane: take ideas from herdr's add-idea popup.
    inboxTimer?.cancel()
    if (paneId && home) {
      const dir = inboxDir(home, paneId)
      inboxTimer = $.clock.every(1000, () => void pollInbox($, dir))
    }

    return next(e)
  })

  // Claude is leaving this pane: the pill goes back to the bare hint.
  on('session.end', async ($, e, next) => {
    if (pillPath) await $.fs.write(pillPath, '').catch(() => undefined)

    return next(e)
  })

  on('command.run', { command: 'idea' }, async ($, e) => {
    const { text, kind } = parseIdea(e.args, await read($, draftKind))
    if (!text) return { text: 'Usage: /idea [build|busy|broad|new:] your idea' }
    await addIdea($, text, kind)

    return { text: `Queued (${tagOf(kind)}): ${text}` }
  })

  on('command.run', { command: 'ideas' }, async ($, e) => {
    const word = e.args.trim().toLowerCase()
    if (word === 'send') {
      const list = await read($, ideas)
      await send($, list)
      return { text: list.length ? `Sent ${list.length} idea(s).` : 'No ideas waiting.' }
    }
    if (word === 'auto' || word === 'pause') {
      await setAuto($, word === 'auto')
      return { text: word === 'auto' ? 'Idea queue: auto.' : 'Idea queue: paused.' }
    }
    await $.ui.open({ id: PANE, title: 'Idea queue', focus: true })

    return { text: 'Idea queue pane opened.' }
  })

  on('prompt.submit', ($, e, next) => {
    stopIdle()

    return next(e)
  })

  on('turn.start', ($, e, next) => {
    isRunning = true
    stopIdle()

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId) return result
    isRunning = false
    // An interrupt means you're here and steering: send nothing by itself.
    if (e.reason !== 'answer' || !(await read($, isAuto))) return result

    const builds = (await read($, ideas)).filter(idea => idea.kind === 'build')
    if (builds.length) await send($, builds)
    else await armIdle($)

    return result
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const table = $.ui.resolve(e)
    const { Box, Button, Text } = table
    // The mobile app draws no fields: there the pane lists and sends, /idea adds.
    const fields = 'Input' in table ? table : undefined
    const list = await read($, ideas)
    const auto = await read($, isAuto)
    const kind = await read($, draftKind)
    const isHelp = await read($, isHelpOpen)
    const help = HELP.filter(([, , only]) => !only || pillPath)
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 13 - (isHelp ? help.length + 1 : 0))
    const nextKind = KINDS[(KINDS.findIndex(k => k.value === kind) + 1) % KINDS.length]!.value

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Button key="help" hotkey="h" plain label={isHelp ? 'hide keys' : 'keys'} onPress={() => void update($, isHelpOpen, open => !open)} />
          <Text> </Text>
          <Button key="send-all-key" hotkey="s" plain label="send all" onPress={() => void read($, ideas).then(all => send($, all))} />
          <Text> </Text>
          <Button key="mode-key" hotkey="p" plain label={auto ? 'pause' : 'auto'} onPress={() => void setAuto($, !auto)} />
          <Text> </Text>
          <Button key="kind-key" hotkey="t" plain onPress={() => void update($, draftKind, () => nextKind)}>
            <Text color={colorOf(kind)}>type: {tagOf(kind)}</Text>
          </Button>
        </Box>
        {isHelp && (
          <Box flexDirection="column" borderStyle="round" paddingX={1}>
            {help.map(([keys, what]) => (
              <Text>
                <Text bold>{keys.padEnd(14)}</Text>
                <Text dimColor>{what}</Text>
              </Text>
            ))}
          </Box>
        )}
        {fields && (
          <Box flexDirection="column">
            <fields.Select
              key="mode"
              label="Mode "
              value={auto ? 'auto' : 'paused'}
              options={[
                { value: 'auto', label: 'Auto (types send by themselves)' },
                { value: 'paused', label: 'Paused (only Send sends)' },
              ]}
              onSelect={(value: string) => void setAuto($, value === 'auto')}
            />
            <fields.Select
              key="kind"
              label="Type "
              value={kind}
              options={KINDS.map(({ value, label }) => ({ value, label }))}
              onSelect={(value: string) => void update($, draftKind, () => value as IdeaKind)}
            />
            <fields.Input
              key="new"
              label="Idea "
              placeholder="type an idea, Enter to queue"
              value=""
              submitLabel="queue"
              autoFocus
              onSubmit={(text: string) => void addIdea($, text, kind)}
            />
          </Box>
        )}
        <Box marginTop={1}>
          <Text dimColor>
            {list.length ? `Waiting (${list.length})` : 'No ideas waiting.'}
            {list.length > 0 && !auto && ' (paused: nothing sends by itself)'}
          </Text>
        </Box>
        {list.length > 0 && (
          <Text key="legend">
            {KINDS.map(k => (
              <Text color={k.color}>
                {k.tag} = {k.when}
                {'   '}
              </Text>
            ))}
          </Text>
        )}
        {list.slice(0, room).map(idea => (
          <Box key={idea.id}>
            <Button key={`send-${idea.id}`} label="send" onPress={() => void send($, [idea])} />
            <Button key={`drop-${idea.id}`} label="x" onPress={() => void update($, ideas, all => all.filter(one => one.id !== idea.id)).then(() => refreshStatus($))} />
            <Button key={`kind-${idea.id}`} plain onPress={() => void cycleKind($, idea.id)}>
              <Text color={colorOf(idea.kind)} bold>
                [{tagOf(idea.kind)}]
              </Text>
            </Button>
            <Text color={colorOf(idea.kind)} dimColor={!auto}>
              {' '}
              {idea.text}
            </Text>
          </Box>
        ))}
        {list.length > room && <Text dimColor>…and {list.length - room} more</Text>}
      </Box>
    )
  })
}
