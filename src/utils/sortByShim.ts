/**
 * Shim for es-toolkit/compat/sortBy to support bundler resolution in offline/container environments
 */
export function sortBy<T>(arr: T[], iteratees?: any): T[] {
  if (!arr || !Array.isArray(arr)) return [];
  const copy = [...arr];
  if (typeof iteratees === 'function') {
    return copy.sort((a, b) => {
      const va = iteratees(a);
      const vb = iteratees(b);
      return va > vb ? 1 : va < vb ? -1 : 0;
    });
  }
  if (typeof iteratees === 'string') {
    return copy.sort((a: any, b: any) => {
      const va = a?.[iteratees];
      const vb = b?.[iteratees];
      return va > vb ? 1 : va < vb ? -1 : 0;
    });
  }
  return copy.sort();
}

export default sortBy;
