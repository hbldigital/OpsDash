/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TenureCalculation {
  days: number;
  weeks: number;
  months: number;
  years: number;
  remainingDays: number;
  text: string;
  summary: string;
}

/**
 * Calculates tenure in years, months, weeks, and days from startDate to endDate (or now).
 */
export function calculateTenureDetails(
  startDate?: string,
  endDate?: string
): TenureCalculation {
  if (!startDate) {
    return {
      days: 0,
      weeks: 0,
      months: 0,
      years: 0,
      remainingDays: 0,
      text: 'Serving (Date not specified)',
      summary: 'Ongoing',
    };
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  if (isNaN(start.getTime())) {
    return {
      days: 0,
      weeks: 0,
      months: 0,
      years: 0,
      remainingDays: 0,
      text: 'Invalid Date',
      summary: 'Invalid Date',
    };
  }

  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);

  // Exact calendar difference
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

  const summary = parts.join(', ');
  const text = `${summary} (${totalDays} days / ${totalWeeks} wks)`;

  return {
    days: totalDays,
    weeks: totalWeeks,
    months,
    years,
    remainingDays: days,
    text,
    summary,
  };
}
