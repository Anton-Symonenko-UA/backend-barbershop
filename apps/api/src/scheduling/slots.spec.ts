import { computeSlots } from './slots.js';

const hours = { startMin: 10 * 60, endMin: 12 * 60 }; // 10:00–12:00 за Києвом
const past = new Date('2000-01-01T00:00:00Z');

describe('computeSlots', () => {
  it('lays a 15-minute grid inside working hours, in Kyiv time', () => {
    const slots = computeSlots({
      date: '2026-01-15',
      durationMin: 60,
      hours,
      busy: [],
      earliest: past,
    });
    // Взимку Київ = UTC+2: 10:00 місцевого = 08:00 UTC; останній старт 11:00
    expect(slots.map((s) => s.toISOString())).toEqual([
      '2026-01-15T08:00:00.000Z',
      '2026-01-15T08:15:00.000Z',
      '2026-01-15T08:30:00.000Z',
      '2026-01-15T08:45:00.000Z',
      '2026-01-15T09:00:00.000Z',
    ]);
  });

  it('follows summer time (UTC+3)', () => {
    const [first] = computeSlots({
      date: '2026-07-15',
      durationMin: 60,
      hours,
      busy: [],
      earliest: past,
    });
    expect(first.toISOString()).toBe('2026-07-15T07:00:00.000Z');
  });

  it('skips slots that overlap busy time but lets back-to-back slots touch', () => {
    const busy = [
      {
        start: new Date('2026-01-15T08:30:00Z'),
        end: new Date('2026-01-15T09:00:00Z'),
      },
    ];
    const slots = computeSlots({
      date: '2026-01-15',
      durationMin: 30,
      hours,
      busy,
      earliest: past,
    });
    expect(slots.map((s) => s.toISOString().slice(11, 16))).toEqual([
      '08:00',
      '09:00',
      '09:15',
      '09:30',
    ]);
  });

  it('drops slots before the earliest allowed start', () => {
    const slots = computeSlots({
      date: '2026-01-15',
      durationMin: 60,
      hours,
      busy: [],
      earliest: new Date('2026-01-15T08:40:00Z'),
    });
    expect(slots.map((s) => s.toISOString().slice(11, 16))).toEqual([
      '08:45',
      '09:00',
    ]);
  });

  it('returns nothing on a day off or when the service is longer than the shift', () => {
    expect(
      computeSlots({
        date: '2026-01-15',
        durationMin: 30,
        hours: null,
        busy: [],
        earliest: past,
      }),
    ).toEqual([]);
    expect(
      computeSlots({
        date: '2026-01-15',
        durationMin: 180,
        hours,
        busy: [],
        earliest: past,
      }),
    ).toEqual([]);
  });
});
