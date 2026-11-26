import {
  addDays,
  normalizePhone,
  utcToZoned,
  weekdayOf,
  zonedToUtc,
} from '@barbershop/shared';

describe('shared time helpers', () => {
  it('converts Kyiv local time to UTC across DST changes', () => {
    expect(zonedToUtc('2026-03-28', 9 * 60).toISOString()).toBe(
      '2026-03-28T07:00:00.000Z',
    );
    expect(zonedToUtc('2026-03-29', 9 * 60).toISOString()).toBe(
      '2026-03-29T06:00:00.000Z',
    );
    expect(zonedToUtc('2026-10-25', 9 * 60).toISOString()).toBe(
      '2026-10-25T07:00:00.000Z',
    );
  });

  it('converts UTC back to Kyiv date, minutes and weekday', () => {
    expect(utcToZoned(new Date('2026-01-15T22:30:00Z'))).toEqual({
      date: '2026-01-16',
      minutes: 30,
      weekday: 5,
    });
  });

  it('handles calendar dates', () => {
    expect(weekdayOf('2026-11-29')).toBe(0);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('normalizes Ukrainian phone numbers', () => {
    expect(normalizePhone('067 000 00 00')).toBe('+380670000000');
    expect(normalizePhone('+38 (067) 000-00-00')).toBe('+380670000000');
  });
});
