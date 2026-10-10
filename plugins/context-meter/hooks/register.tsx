import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Exact, Row } from '../types'

const PANE = 'context-meter'
const WARN_AT = 80

// The estimate behind the line under the prompt, refreshed after each turn.
const rows = atom({ plugin: 'context-meter', key: 'rows' } as const, [])
// The exact count /tokens asks for, kept until the next one.
const exact = atom({ plugin: 'context-meter', key: 'exact' } as const, null)
const isCounting = atom({ plugin: 'context-meter', key: 'isCounting' } as const, false)
const hasWarned = atom({ plugin: 'context-meter', key: 'hasWarned' } as const, false)

// Short labels for /context's rows, for display only; any other row is lowercased.
const SHORT: Record<string, string> = {
  'System prompt': 'sys',
  'System tools': 'tools',
  'MCP tools': 'mcp',
  'Memory files': 'memory',
  'Custom agents': 'agents',
  'Slash commands': 'commands',
  Skills: 'skills',
  Messages: 'chat',
}
const shortName = (name: string) => SHORT[name] ?? name.toLowerCase()

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export function statusText(tokens: number | undefined, window: number, percent: number | undefined): string {
  if (tokens === undefined) return `🧠 — / ${formatTokens(window)}`
  const dot = (percent ?? 0) >= WARN_AT ? '🔴' : (percent ?? 0) >= 50 ? '🟡' : '🟢'
  return `${dot} 🧠 ${formatTokens(tokens)} / ${formatTokens(window)} · ${percent ?? 0}%`
}

// Biggest first, so the part a narrow terminal cuts off is the least of it.
export function tailText(list: Row[]): string | undefined {
  if (list.length === 0) return undefined
  return `≈ ${[...list].sort((a, b) => b.tokens - a.tokens).map(row => `${shortName(row.name)} ${formatTokens(row.tokens)}`).join(' · ')}`
}

const usedRows = (categories: readonly { name: string; tokens: number; color: string; kind: string }[]): Row[] =>
  categories.filter(row => row.kind === 'used' && row.tokens > 0).map(({ name, tokens, color }) => ({ name, tokens, color }))

// The status line, the line under the prompt, and the one-time warning.
async function refresh($: EngineInterface) {
  const { context } = await $.session.usage({ breakdown: 'summary' })
  $.ui.status(statusText(context.tokens, context.window, context.percent))
  await update($, rows, () => usedRows(context.breakdown?.categories ?? []))

  const percent = context.percent ?? 0
  if (percent >= WARN_AT && !(await read($, hasWarned))) {
    await update($, hasWarned, () => true)
    $.ui.toast(`Context is ${percent}% full. Consider /compact before it fills.`)
  } else if (percent < WARN_AT) {
    await update($, hasWarned, () => false)
  }
}

// The exact count, as /context does it: one token-count call per category.
async function countExactly($: EngineInterface) {
  if (await read($, isCounting)) return
  await update($, isCounting, () => true)
  try {
    const { context } = await $.session.usage({ breakdown: 'full' })
    const breakdown = context.breakdown
    if (breakdown) {
      const counted: Exact = {
        rows: usedRows(breakdown.categories),
        total: breakdown.totalTokens,
        window: breakdown.rawMaxTokens,
        percent: breakdown.percentage,
        at: await $.clock.now(),
      }
      await update($, exact, () => counted)
    }
  } catch (error) {
    $.ui.toast(`Couldn't count the context exactly: ${error}`)
  } finally {
    await update($, isCounting, () => false)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'tokens',
      description: 'Show exactly what is using the context window',
    })
    const started = await next(e)
    await refresh($).catch(() => undefined)

    return started
  })

  on('command.run', { command: 'tokens' }, async $ => {
    void $.ui.open({ id: PANE, title: 'Context', focus: true })
    await countExactly($)
    const counted = await read($, exact)

    return {
      text: counted
        ? `Context: ${formatTokens(counted.total)} / ${formatTokens(counted.window)} (${counted.percent}%), counted exactly. Details in the Context pane.`
        : "Couldn't count the context.",
    }
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (!e.agentId) await refresh($).catch(() => undefined)

    return result
  })

  // The breakdown, dim at the end of the hint line under the prompt.
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const tail = tailText(await read($, rows))
    if (!tail) return next(e)

    return next({ ...e, props: { ...e.props, tail: e.props.tail ? `${e.props.tail}  ${tail}` : tail } })
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const counted = await read($, exact)
    const counting = await read($, isCounting)
    const width = 20
    const biggest = Math.max(1, ...(counted?.rows ?? []).map(row => row.tokens))

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Button key="refresh" hotkey="r" plain label={counting ? 'counting…' : 'refresh'} onPress={() => void countExactly($)} />
        </Box>
        {!counted && <Text dimColor>{counting ? 'Counting exactly…' : 'Press r to count.'}</Text>}
        {counted && (
          <Box flexDirection="column">
            <Text bold>
              {formatTokens(counted.total)} / {formatTokens(counted.window)} · {counted.percent}% used (exact)
            </Text>
            {[...counted.rows]
              .sort((a, b) => b.tokens - a.tokens)
              .map(row => (
                <Text>
                  <Text color={row.color}>{'█'.repeat(Math.max(1, Math.round((row.tokens / biggest) * width))).padEnd(width, ' ')}</Text>
                  {'  '}
                  {formatTokens(row.tokens).padStart(6)}
                  {'  '}
                  {row.name}
                  <Text dimColor> {Math.round((row.tokens / counted.window) * 100)}%</Text>
                </Text>
              ))}
            <Text dimColor>
              {formatTokens(Math.max(0, counted.window - counted.total))} free{counting ? ' · recounting…' : ''}
            </Text>
          </Box>
        )}
      </Box>
    )
  })
}
