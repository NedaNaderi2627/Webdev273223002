import { listBookingsByWorkstationAndDate } from '../data/bookings.js';

const DEFAULT_SLOTS = [
  { startTime: '09:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '13:00' },
  { startTime: '14:00', endTime: '16:00' },
];

function overlaps(slot, row) {
  return slot.startTime < row.end_time && slot.endTime > row.start_time;
}

export function getFallbackSlots({ workstationId, date }) {
  const existing = listBookingsByWorkstationAndDate(workstationId, date);
  return DEFAULT_SLOTS.filter(
    (slot) => !existing.some((row) => overlaps(slot, row))
  );
}

export async function recommendTimeSlots(
  {
    userId,
    workstationId,
    date,
    serviceType = 'lab_session',
    preferredRange = '09:00-17:00',
  },
  client = null,
  timeoutMs = 3000
) {
  const fallback = getFallbackSlots({ workstationId, date });
  const apiKey = process.env.GEMINI_API_KEY;

  if (!client && !apiKey) {
    return {
      source: 'fallback',
      recommendedSlot: fallback[0] ?? null,
      slots: fallback,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const prompt = `Suggest optimal available lab slot for service "${serviceType}" on date ${date} within preferred range ${preferredRange} (user ${userId}, workstation ${workstationId}).`;

    const response = client
      ? await client.generate({ prompt, signal: controller.signal })
      : await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
            signal: controller.signal,
          }
        );

    if (!response) {
      return {
        source: 'fallback',
        recommendedSlot: fallback[0] ?? null,
        slots: fallback,
      };
    }

    if (typeof response.ok === 'boolean' && !response.ok) {
      return {
        source: 'fallback',
        recommendedSlot: fallback[0] ?? null,
        slots: fallback,
      };
    }

    if (Array.isArray(response.slots) && response.slots.length > 0) {
      return {
        source: 'model',
        recommendedSlot: response.slots[0],
        slots: response.slots,
      };
    }

    return {
      source: 'fallback',
      recommendedSlot: fallback[0] ?? null,
      slots: fallback,
    };
  } catch (_err) {
    return {
      source: 'fallback',
      recommendedSlot: fallback[0] ?? null,
      slots: fallback,
    };
  } finally {
    clearTimeout(timer);
  }
}