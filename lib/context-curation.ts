import { estimateTokens } from './chat-utils';

export interface CurationOpts {
  instruction?: string;
  personaLock?: string;
  scenarioAnchor?: string;
  memoryContext?: string;
  otherSystemMessages?: string[]; // already formatted blocks
  rollingSummary?: string;
  recentMessages: any[];
  maxTokens?: number;
}

export function assembleCuratedMessages(opts: CurationOpts): any[] {
  const {
    instruction,
    personaLock,
    scenarioAnchor,
    memoryContext,
    otherSystemMessages = [],
    rollingSummary,
    recentMessages = [],
    maxTokens = 2000
  } = opts;

  const layers: any[] = [];

  if (instruction) layers.push({ role: 'system', content: instruction });
  if (personaLock) layers.push({ role: 'system', content: personaLock });
  if (scenarioAnchor) layers.push({ role: 'system', content: scenarioAnchor });
  if (memoryContext) layers.push({ role: 'system', content: `[Long-term Memory]\n${memoryContext}` });

  otherSystemMessages.forEach(m => layers.push({ role: 'system', content: m }));

  if (rollingSummary) layers.push({ role: 'system', content: `[Conversation Summary]\n${rollingSummary}` });

  // Now we need to append recent messages but respect token budget
  const curated = [...layers];

  // Add recent messages starting from the most recent going backwards until token budget met
  let used = curated.reduce((acc, m) => acc + estimateTokens(m.content || ''), 0);

  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const m = recentMessages[i];
    const t = estimateTokens(typeof m.content === 'string' ? m.content : JSON.stringify(m.content || ''));
    if (used + t > maxTokens) break;
    // Prepend so the ordering remains instruction -> older -> recent
    curated.push({ role: m.role, content: m.content });
    used += t;
  }

  return curated;
}
