/**
 * Formats minutes for display: "X год" or "X год Y хв" or "Y хв" (Ukrainian units).
 */
export function formatEstimateMinutes(minutes: number): string {
  if (minutes <= 0) return '0 хв'
  if (minutes < 60) return `${minutes} хв`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} год`
  return `${h} год ${m} хв`
}
