export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function formatRupees(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}
