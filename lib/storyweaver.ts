/**
 * StoryWeaver - local RP/context intelligence
 * Lightweight, local-only heuristics to extract persona locks and scenario anchors.
 */

export function detectRPContext(messages: any[]): boolean {
  if (!messages || !Array.isArray(messages)) return false;
  // Heuristics: presence of 'roleplay' tokens, 'rp', 'you are', 'as <character>' or many 'system' persona tags
  const text = messages.map((m: any) => typeof m.content === 'string' ? m.content.toLowerCase() : '').join(' ');
  if (text.includes('roleplay') || text.includes('role-play') || text.includes('rp:') || text.includes('as a character')) return true;
  if (/you are a|you are the|play the role of|as the character|as <character>/i.test(text)) return true;
  // If system contains persona-like blocks frequently, assume RP
  const systemCount = messages.filter((m: any) => m.role === 'system' && (m.content || '').length > 30).length;
  if (systemCount >= 2) return true;
  return false;
}

export async function runStoryWeaver(messages: any[], userId: string, characterId?: string): Promise<{ personaLock: string; scenarioAnchor: string } | null> {
  try {
    // Local lightweight extraction: find named entities and simple facts
    const text = messages.map((m: any) => (typeof m.content === 'string' ? m.content : '')).join('\n');
    // Extract quoted names or capitalized words sequences as characters
    const names = Array.from(new Set((text.match(/\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*)\b/g) || []))).slice(0, 4);

    const personaParts: string[] = [];
    if (names.length) personaParts.push(`Primary characters: ${names.join(', ')}`);

    // Extract simple preferences/traits (heuristic)
    const traits: string[] = [];
    if (/honor|brave|shy|sarcastic|grumpy|cheerful/.test(text)) traits.push('Tone hints detected');
    if (text.includes('prefers to') || text.includes('likes to')) traits.push('Has explicit preferences');
    if (traits.length) personaParts.push(traits.join('; '));

    const personaLock = personaParts.length ? `[Persona Lock]\n${personaParts.join('\n')}` : '';

    // Scenario anchor: try to find location/time cues
    const anchorParts: string[] = [];
    const placeMatch = text.match(/in the (city|village|castle|forest|sea|space|kingdom|town|school)/i);
    if (placeMatch) anchorParts.push(`Location hint: ${placeMatch[0]}`);
    const timeMatch = text.match(/(19|20)\d{2}|present day|modern day|medieval|ancient|futuristic/i);
    if (timeMatch) anchorParts.push(`Timeframe: ${timeMatch[0]}`);

    const scenarioAnchor = anchorParts.length ? `[Scenario Anchor]\n${anchorParts.join('\n')}` : '';

    if (!personaLock && !scenarioAnchor) return null;
    return { personaLock, scenarioAnchor };
  } catch (err) {
    console.warn('[StoryWeaver] Error:', err);
    return null;
  }
}
