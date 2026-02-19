/**
 * Форматує кількість хвилин для відображення: "X год" або "X год Y хв" або "Y хв".
 */
export function formatEstimateMinutes(minutes: number): string {
  if (minutes <= 0) return '0 хв'
  if (minutes < 60) return `${minutes} хв`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} год`
  return `${h} год ${m} хв`
}
