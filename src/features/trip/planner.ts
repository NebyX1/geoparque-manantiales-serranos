import type { TripItem } from '../../types/geopark';
export const planOptions = {
  nature: [
    [31, 39, 44],
    [1, 51, 53],
    [24, 26],
  ],
  geology: [[1], [17, 31], [23]],
  culture: [
    [39, 42, 40],
    [54, 11],
    [60, 44, 45],
  ],
  family: [[31, 60], [17], [53, 1]],
  adventure: [[14], [55, 54], [56]],
} as const;
export function planTrip(interest: string, days: number): TripItem[] {
  const selection = planOptions[interest as keyof typeof planOptions] || planOptions.nature;
  return selection
    .slice(0, Math.max(1, Math.min(3, Math.trunc(days) || 1)))
    .flatMap((ids, index) => ids.map((id) => ({ id, day: index + 1 })));
}
