export function formatRs(price: number): string {
  const n = Number.isFinite(price) ? price : 0;
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
}
