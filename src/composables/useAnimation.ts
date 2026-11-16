import { onBeforeUnmount, ref, type Ref } from 'vue'

/**
 * Percorre as etapas 0..length-1 em ritmo configurável (etapas por segundo).
 * `current` é null quando a animação não está em uso (mostra a sequência completa).
 */
export function useAnimation(length: Ref<number>) {
  const current = ref<number | null>(null)
  const playing = ref(false)
  const speed = ref(6)
  let raf = 0
  let last = 0
  let acc = 0

  const lastIndex = () => Math.max(0, length.value - 1)

  function tick(t: number) {
    if (!playing.value) return
    acc += ((t - last) / 1000) * speed.value
    last = t
    const advance = Math.floor(acc)
    if (advance > 0) {
      acc -= advance
      current.value = Math.min(lastIndex(), (current.value ?? 0) + advance)
      if (current.value >= lastIndex()) {
        playing.value = false
        return
      }
    }
    raf = requestAnimationFrame(tick)
  }

  function startLoop() {
    cancelAnimationFrame(raf)
    last = performance.now()
    acc = 0
    playing.value = true
    raf = requestAnimationFrame(tick)
  }

  /** Inicia do começo. */
  function play() {
    if (length.value === 0) return
    current.value = 0
    startLoop()
  }

  function pause() {
    playing.value = false
    cancelAnimationFrame(raf)
  }

  /** Continua de onde parou (ou do começo, se já terminou). */
  function resume() {
    if (length.value === 0) return
    if (current.value === null || current.value >= lastIndex()) current.value = 0
    startLoop()
  }

  function restart() {
    pause()
    current.value = length.value > 0 ? 0 : null
  }

  function stepForward() {
    pause()
    current.value = Math.min(lastIndex(), (current.value ?? -1) + 1)
  }

  function stepBack() {
    pause()
    current.value = Math.max(0, (current.value ?? lastIndex() + 1) - 1)
  }

  function goTo(i: number) {
    pause()
    current.value = Math.min(lastIndex(), Math.max(0, i))
  }

  function reset() {
    pause()
    current.value = null
  }

  // Quem troca a sequência chama reset() antes; um watch aqui dispararia
  // depois de play() e cancelaria a reprodução automática.
  onBeforeUnmount(pause)

  return { current, playing, speed, play, pause, resume, restart, stepForward, stepBack, goTo, reset }
}

export type AnimationApi = ReturnType<typeof useAnimation>
