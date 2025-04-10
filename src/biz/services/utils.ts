export function idsMapValue(ids: string) {
  return ids
    .split(",")
    .filter(Boolean)
    .map(Number)
    .map((id) => {
      return { id };
    });
}
