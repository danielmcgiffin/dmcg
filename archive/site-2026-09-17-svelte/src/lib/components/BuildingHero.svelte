
<script lang="ts">
  import { onMount } from 'svelte'
  import exteriorLeft from '../../assets/exterior-left.webp'
  import exteriorRight from '../../assets/exterior-right.webp'
  import exteriorRoof from '../../assets/exterior-roof.webp'

  let { progressOverride } = $props<{ progressOverride?: number }>()

  let section: HTMLElement
  let stage: HTMLDivElement

  let targetProgress = $state(0)
  let smoothProgress = $state(0)
  let reducedMotion = $state(false)

  const clamp = (n: number) => Math.min(1, Math.max(0, n))
  const mix = (a: number, b: number, t: number) => a + (b - a) * t
  const ease = (t: number) => t * t * (3 - 2 * t)
  const phase = (p: number, start: number, end: number) =>
    ease(clamp((p - start) / (end - start)))

  let progress = $derived(
    clamp(progressOverride ?? (reducedMotion ? 1 : smoothProgress))
  )

  let open = $derived(phase(progress, 0.08, 0.52))

  let sceneScale = $derived(mix(1, 0.78, open))

  let roofLeft = $derived(mix(21.875, 21.875, open))
  let roofTop = $derived(mix(-18, -20, open))

  let leftLeft = $derived(mix(10, -12, open))
  let leftTop = $derived(mix(23, 35, open))

  let rightLeft = $derived(mix(45, 67, open))
  let rightTop = $derived(mix(23, 35, open))

  onMount(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

    let measureFrame = 0
    let animationFrame = 0
    let lastTime = performance.now()

    const FOLLOW_SPEED = 4.5

    const animate = (now: number) => {
      animationFrame = 0

      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const difference = targetProgress - smoothProgress

      if (Math.abs(difference) < 0.0001) {
        smoothProgress = targetProgress
        return
      }

      const amount = 1 - Math.exp(-FOLLOW_SPEED * dt)
      smoothProgress += difference * amount

      animationFrame = requestAnimationFrame(animate)
    }

    const startAnimation = () => {
      if (!animationFrame) {
        lastTime = performance.now()
        animationFrame = requestAnimationFrame(animate)
      }
    }

    const measure = () => {
      measureFrame = 0
      reducedMotion = motion.matches

      const travel = section.offsetHeight - stage.offsetHeight
      targetProgress =
        travel > 0
          ? clamp(-section.getBoundingClientRect().top / travel)
          : 0

      startAnimation()
    }

    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure)
    }

    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(section)
    observer.observe(stage)

    measure()

    window.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)
    motion.addEventListener('change', scheduleMeasure)

    return () => {
      cancelAnimationFrame(measureFrame)
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      window.removeEventListener('scroll', scheduleMeasure)
      window.removeEventListener('resize', scheduleMeasure)
      motion.removeEventListener('change', scheduleMeasure)
    }
  })
</script>

<section
  bind:this={section}
  class="shell-hero"
  class:still={progressOverride !== undefined || reducedMotion}
  aria-label="Office building exterior animation"
>
  <div bind:this={stage} class="stage">
    <div class="scene" style:transform={`scale(${sceneScale})`}>
      <img
        class="piece left"
        src={exteriorLeft}
        alt=""
        draggable="false"
        style:left={`${leftLeft}%`}
        style:top={`${leftTop}%`}
      />

      <img
        class="piece right"
        src={exteriorRight}
        alt=""
        draggable="false"
        style:left={`${rightLeft}%`}
        style:top={`${rightTop}%`}
      />

      <img
        class="piece roof"
        src={exteriorRoof}
        alt=""
        draggable="false"
        style:left={`${roofLeft}%`}
        style:top={`${roofTop}%`}
      />
    </div>
  </div>
</section>

<style>
  .shell-hero {
    --paper: var(--paper, #f5f3e9);
    height: 240svh;
    background: var(--paper);
  }

  .stage {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
    display: grid;
    place-items: center;
  }

  .scene {
    position: relative;
    width: min(100vw, 1600px);
    aspect-ratio: 8 / 5;
    transform-origin: 50% 50%;
    will-change: transform;
  }

  .piece {
    position: absolute;
    display: block;
    height: auto;
    user-select: none;
    pointer-events: none;
    will-change: left, top;
  }

  .left,
  .right {
    width: 45%;
    z-index: 2;
  }

  .roof {
    width: 56.25%;
    z-index: 3;
  }

  .still {
    height: auto;
  }

  .still .stage {
    position: relative;
  }

  @media (max-width: 700px) {
    .shell-hero {
      height: 200svh;
    }

    .shell-hero.still {
      height: auto;
    }

    .scene {
      width: 125vw;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-hero {
      height: auto;
    }

    .stage {
      position: relative;
    }
  }
</style>
