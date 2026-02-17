<template>
  <div class="landing min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16 text-center">
    <div class="landing__bg" aria-hidden="true" />
    <div class="landing__drops" aria-hidden="true">
      <div
        v-for="(drop, i) in randomDrops"
        :key="'r-' + i"
        class="landing__drop landing__drop--random"
        :style="{ left: drop.x + '%', top: drop.y + '%', width: drop.size + 'px', height: drop.size + 'px' }"
      />
    </div>
    <div class="landing__content relative z-0 mx-auto max-w-2xl">
      <div class="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-xl shadow-indigo-500/30">
        T
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        TaskLog
      </h1>
      <p class="mt-4 text-lg text-slate-600 sm:text-xl">
        Створюйте задачі, логуйте час та переглядайте прогрес — все в одному місці.
      </p>
      <div class="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
          @click="openAuth('register')"
        >
          Реєстрація
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
          @click="openAuth('login')"
        >
          Увійти
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { openAuth } = useAuth()

const randomDrops = ref<{ x: number; y: number; size: number }[]>([])

function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function initRandomDrops() {
  if (typeof window === 'undefined') return
  const count = 4
  const drops: { x: number; y: number; size: number }[] = []
  for (let i = 0; i < count; i++) {
    drops.push({
      x: getRandom(8, 88),
      y: getRandom(12, 85),
      size: Math.round(getRandom(60, 140))
    })
  }
  randomDrops.value = drops
}

onMounted(() => {
  initRandomDrops()
})
</script>

<style scoped>
.landing {
  position: relative;
  overflow: hidden;
}

.landing__bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.18), transparent),
    radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.1), transparent);
}

.landing__drops {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.landing__drop {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%);
  filter: blur(8px);
  transform: translate(-50%, -50%);
  transition: opacity 0.6s ease-out;
}

.landing__drop--random {
  animation: landing-drop-pulse 8s ease-in-out infinite;
}

:root[data-theme='dark'] .landing__bg {
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.22), transparent),
    radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.14), transparent);
}

:root[data-theme='dark'] .landing__drop {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%);
}

@keyframes landing-drop-pulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
}

:root[data-theme='dark'] .landing__card {
  background-color: color-mix(in srgb, var(--surface-elev) 85%, transparent);
  border-color: var(--border);
}
</style>
