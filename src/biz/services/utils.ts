export function idsMapValue(ids: string) {
  return ids
    .split(",")
    .filter(Boolean)
    .map(Number)
    .map((id) => {
      const v = Number(id);
      if (Number.isNaN(v)) {
        return null;
      }
      return { id: v };
    })
    .filter((v) => {
      return v !== null;
    });
}
