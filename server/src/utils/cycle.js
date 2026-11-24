import { addDays, daysBetween, startOfDay } from './dates.js';

/**
 * Human-friendly, non-prescriptive suggestions per cycle phase.
 * These are OPTIONAL ideas only — people experience cycles very differently.
 */
export const PHASE_SUGGESTIONS = {
  Menstrual: [
    'If you feel tired, consider a lighter workload and extra rest.',
    'Gentle movement and hydration can help some people — skip if you feel fine.',
  ],
  Follicular: [
    'Energy often rises gradually; this can be a good window to start new tasks.',
    'Optional: schedule demanding workouts or deep-focus study if you feel up to it.',
  ],
  Ovulation: [
    'Some people feel most energetic here — others do not. Adjust to how you feel.',
    'Consider tackling high-priority goals if your energy allows.',
  ],
  Luteal: [
    'Energy may dip for some — plan lighter sessions and more rest days.',
    'Prioritize sleep, hydration and self-care as needed.',
  ],
};

/**
 * Estimate the current cycle day and phase for a single cycle record.
 * `cycleDay` is derived from the most recent period start date.
 */
export const estimateCycle = (record, today = new Date()) => {
  const cycleLength = record.cycleLength || 28;
  const periodDuration = record.periodDuration || 5;
  const periodStart = startOfDay(record.periodStart);
  const diff = daysBetween(periodStart, today);
  const cycleDay = (((diff % cycleLength) + cycleLength) % cycleLength) + 1;

  const ovulationDay = Math.max(periodDuration + 1, cycleLength - 14);
  let phase = 'Luteal';
  if (cycleDay <= periodDuration) phase = 'Menstrual';
  else if (cycleDay < ovulationDay - 1) phase = 'Follicular';
  else if (cycleDay <= ovulationDay + 1) phase = 'Ovulation';

  const currentPeriodStart = addDays(periodStart, Math.floor(diff / cycleLength) * cycleLength);
  const nextPeriod = addDays(currentPeriodStart, cycleLength);
  const daysUntilNextPeriod = daysBetween(today, nextPeriod);

  const upcomingPeriods = [0, 1, 2].map((i) => {
    const s = addDays(nextPeriod, i * cycleLength);
    return { start: s, end: addDays(s, periodDuration - 1) };
  });

  return {
    cycleDay,
    phase,
    cycleLength,
    periodDuration,
    currentPeriodStart,
    nextPeriod,
    daysUntilNextPeriod,
    upcomingPeriods,
    suggestions: PHASE_SUGGESTIONS[phase] || [],
  };
};

export default estimateCycle;
