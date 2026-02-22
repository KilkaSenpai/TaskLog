<template>
  <div class="landing flex flex-col items-center">
    <div class="landing__hero min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16 text-center">
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
      <div class="landing__scroll-hint absolute bottom-6 left-0 right-0 z-10 flex justify-center" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="landing__scroll-hint-arrow h-14 w-14 sm:h-16 sm:w-16">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
    <section class="landing__banner w-full px-4 py-8 sm:px-6 sm:py-10">
      <div class="landing__banner-card relative mx-auto max-w-xl overflow-hidden rounded-3xl px-6 py-8 text-center sm:px-10 sm:py-10">
        <h2 class="relative z-0 flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          TaskLog для Android
        </h2>
        <p class="relative z-0 mx-auto mt-3 max-w-md text-base text-slate-600 sm:text-lg">
          Завантажте додаток на телефон — створюйте задачі та логуйте час у зручному мобільному інтерфейсі.
        </p>
        <div class="landing__banner-video relative z-0 mx-auto mt-6 max-w-xs overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          <video
            src="/apptl.mp4"
            class="landing__banner-video-el w-full select-none"
            playsinline
            muted
            loop
            autoplay
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            aria-label="Демонстрація додатку TaskLog для Android"
          />
        </div>
        <a
          :href="androidApkUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="landing__banner-btn relative z-0 mt-6 inline-flex items-center gap-2 rounded-2xl border-2 border-indigo-500/40 bg-white px-7 py-3.5 text-base font-semibold text-indigo-700 shadow-lg shadow-slate-300/50 transition hover:border-indigo-500 hover:bg-slate-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          Завантажити
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { openAuth } = useAuth()

const androidApkUrl = 'https://expo.dev/artifacts/eas/61sUt3Ej7gcmDjm5eYhsT8.apk'

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

.landing__hero {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.landing__scroll-hint {
  animation: landing-scroll-hint-bounce 2s ease-in-out infinite;
}

.landing__scroll-hint-arrow {
  color: rgb(99 102 241);
  filter: drop-shadow(0 2px 6px rgba(99, 102, 241, 0.4));
}

:root[data-theme='dark'] .landing__scroll-hint-arrow {
  color: var(--primary);
  filter: drop-shadow(0 2px 6px rgba(99, 102, 241, 0.35));
}

@keyframes landing-scroll-hint-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.landing__banner-card {
  background: linear-gradient(135deg, rgb(238 242 255) 0%, rgb(224 231 255) 50%, rgb(233 213 255) 100%);
  border: 2px solid rgb(199 210 254);
  box-shadow: 0 10px 40px -12px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  max-width: 100%;
}

:root[data-theme='dark'] .landing__banner-card {
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, var(--surface)) 0%, color-mix(in srgb, var(--primary) 12%, var(--surface)) 50%, color-mix(in srgb, rgba(139, 92, 246, 0.2), var(--surface)) 100%);
  border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
  box-shadow: 0 10px 40px -12px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}

:root[data-theme='dark'] .landing__banner h2 {
  color: var(--text);
}

:root[data-theme='dark'] .landing__banner p {
  color: var(--muted);
}

:root[data-theme='dark'] .landing__banner-btn {
  background: rgb(248 250 252);
  border-color: color-mix(in srgb, var(--primary) 50%, var(--border));
  color: var(--primary-strong);
  box-shadow: 0 4px 14px -2px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  width: 100%;
  justify-content: center;
}

:root[data-theme='dark'] .landing__banner-btn:hover {
  background: white;
  border-color: var(--primary);
}

.landing__banner-video {
  pointer-events: none;
  user-select: none;
  aspect-ratio: 5/3;
  max-height: 11rem;
}

.landing__banner-video-el {
  pointer-events: none;
  object-fit: cover;
  object-position: top center;
  height: 100%;
  min-height: 100%;
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
