import { expect, mock, test } from 'claude-code/testing'

const PLUGIN = 'savvy-progress'
const BAND = { bodyColumns: 100, hasSurvey: false } as never

const spawn = {
  tool_use_id: 'tu-1',
  prompt: 'work',
  description: 'Test worker A',
  subagentType: 'general-purpose',
  provider: { plugin: 'engine', tier: 'core' },
  parentModel: 'claude-sonnet-5-5',
  background: true,
  fork: false,
} as never

// What sits beneath the mod in a session: a clock, an empty drawing, and the engine's own answers.
const world = (on: Parameters<typeof mock.clock>[0]) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  on('agent.spawn', () => ({ model: 'claude-haiku-5-5', agentId: 'a1' }))
  on('turn.complete', () => ({ answer: '', text: '' }) as never)
  return clock
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`no bar without a flow or a running subagent (${surface})`, async ($, on) => {
    world(on)
    const band = await $.ui.mount({ plugin: PLUGIN, surface, component: 'AbovePrompt', props: BAND })
    expect(await band.find({ key: 'savvy-agents' })).toBeUndefined()
  })

  test(`a running subagent raises the plain bar and lists its name (${surface})`, async ($, on) => {
    world(on)
    await $.agent.spawn(spawn)
    const band = await $.ui.mount({ plugin: PLUGIN, surface, component: 'AbovePrompt', props: BAND })
    expect(await band.find({ key: 'savvy-agents' })).toBeDefined()
    expect(await band.find({ text: /Test worker A/ })).toBeDefined()
  })
}

test('the plain bar clears when the subagent finishes', async ($, on) => {
  world(on)
  await $.agent.spawn(spawn)
  await $.turn.complete({ agentId: 'a1', reason: 'answer' } as never)
  const band = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await band.find({ key: 'savvy-agents' })).toBeUndefined()
})

test('a reported flow shows the bar with its crew button and a dismiss', async ($, on) => {
  world(on)
  await $.tool.call({
    tool: 'mcp__savvy-progress__progress',
    title: 'Release flow',
    total: 2,
    done: 1,
    phase: 'delegate',
  } as never)
  const band = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await band.find({ key: 'savvy-agents' })).toBeDefined()
  expect(await band.find({ key: 'savvy-dismiss' })).toBeDefined()
})

test('the plain bar has no dismiss button', async ($, on) => {
  world(on)
  await $.agent.spawn(spawn)
  const band = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await band.find({ key: 'savvy-dismiss' })).toBeUndefined()
})

test('a finished worker reads as fully done', async ($, on) => {
  world(on)
  await $.agent.spawn(spawn)
  await $.tool.call({ tool: 'mcp__savvy-progress__step', agentId: 'a1', total: 3, done: 2, plan: ['One', 'Two', 'Three'] } as never)
  await $.turn.complete({ agentId: 'a1', reason: 'answer' } as never)
  const pane = await $.ui.mount({
    plugin: PLUGIN,
    surface: 'terminal',
    component: 'Pane',
    requestId: 'savvy-agents',
    props: { bodyColumns: 80 } as never,
  })
  // Tasks start hidden, so the per-agent toggle carries the count.
  expect(await pane.find({ text: /Tasks 3\/3/ })).toBeDefined()
  expect(await pane.find({ text: /Tasks 2\/3/ })).toBeUndefined()
})
