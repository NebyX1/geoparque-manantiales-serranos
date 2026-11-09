/** Geometry builders use bounded lookup tables. Fail explicitly if one is inconsistent. */
export function required<T>(value: T | undefined): T {
  if (value === undefined) throw new RangeError('Invalid miniature geometry lookup');
  return value;
}
