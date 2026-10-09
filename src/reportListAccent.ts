/**
 * Map report-history list identity to an existing, currently known color.
 * Never match on list titles: two distinct lists can share the same name.
 * Archived or deleted lists may be absent from the Home projection, in
 * which case the caller must render a neutral badge rather than invent one.
 */
export function reportListAccent(
  listId: string,
  currentColors: ReadonlyMap<string, string | null>,
): string | null {
  const color = currentColors.get(listId);
  return color && /^#[0-9a-f]{6}$/i.test(color) ? color : null;
}
