<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import 'chart.js/auto'
import { Bar } from 'vue-chartjs'

const props = defineProps<{
  chartData: { labels: string[]; datasets: { label: string; data: number[] }[] }
  isDark: boolean
}>()

/** Форматує хвилини як "1h 22m" або "45m" */
function formatMinutesAsHours(minutes: number): string {
  const m = Math.round(minutes)
  if (m < 60) return `${m} хв`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest === 0 ? `${h} год` : `${h} год ${rest} хв`
}

const chartOptions = computed(() => {
  const textColor = props.isDark ? 'rgba(203, 213, 225, 0.9)' : 'rgba(71, 85, 105, 0.9)'
  const gridColor = props.isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)'
  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw?: number }) => formatMinutesAsHours(ctx.raw ?? 0)
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor, maxRotation: 45 },
        grid: { color: gridColor }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          callback: (value: number | string) => formatMinutesAsHours(Number(value))
        },
        grid: { color: gridColor }
      }
    }
  }
})
</script>
