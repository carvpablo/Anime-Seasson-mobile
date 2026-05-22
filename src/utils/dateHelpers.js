/**
 * Convert a broadcast time string from JST (UTC+9) to Brasília time (UTC-3).
 *
 * Jikan returns broadcast times like "Fridays at 00:00 (JST)"
 * We parse hours/minutes and shift by -12 hours (9 + 3 = 12).
 *
 * @param {string|null} broadcastTime - e.g. "Fridays at 00:00 (JST)"
 * @returns {string} Formatted local time or "—" if unavailable
 */
export const convertJSTtoBrasilia = (broadcastTime) => {
  if (!broadcastTime || broadcastTime === 'Unknown') return '—';

  // Match "HH:MM" from the broadcast string
  const match = broadcastTime.match(/(\d{1,2}):(\d{2})/);
  if (!match) return '—';

  let hours = parseInt(match[1], 10);
  let minutes = parseInt(match[2], 10);

  // JST is UTC+9, Brasília is UTC-3 → difference = -12 hours
  hours = hours - 12;

  // Handle day rollover
  if (hours < 0) hours += 24;
  if (hours >= 24) hours -= 24;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return `${hh}:${mm}`;
};

/**
 * Format a broadcast string for display.
 * Returns something like "Fri 23:30 BRT"
 *
 * @param {string|null} broadcastString
 * @returns {string}
 */
export const formatBroadcast = (broadcastString) => {
  if (!broadcastString || broadcastString === 'Unknown') return 'TBA';

  const timeStr = convertJSTtoBrasilia(broadcastString);
  if (timeStr === '—') return 'TBA';

  // Extract the day abbreviation if present
  const dayMatch = broadcastString.match(/^(\w+)s?\s+at/i);
  if (dayMatch) {
    const day = dayMatch[1].slice(0, 3);
    return `${day} ${timeStr} BRT`;
  }

  return `${timeStr} BRT`;
};
