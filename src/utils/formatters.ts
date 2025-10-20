export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export function getGenderColor(gender: string): string {
  switch (gender) {
    case "f":
      return "bg-pink-500";
    case "m":
      return "bg-blue-500";
    case "c":
      return "bg-purple-500";
    case "s":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}
