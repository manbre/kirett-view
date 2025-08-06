export function getGraphDelta(
  prevIds: Set<string>,
  currentIds: Set<string>,
): {
  toAdd: string[];
  toRemove: string[];
} {
  const toAdd = Array.from(currentIds).filter((id) => !prevIds.has(id));
  const toRemove = Array.from(prevIds).filter((id) => !currentIds.has(id));
  return { toAdd, toRemove };
}
