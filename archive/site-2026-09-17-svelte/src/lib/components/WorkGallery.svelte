<script lang="ts">
  import type { Work } from '$lib/content'
  let { entries }: { entries: Work[] } = $props()
</script>

<div class="work-gallery">
  {#each entries as entry, index}
    <article class="work-piece" aria-labelledby={`work-${entry.slug}`}>
      <figure>
        {#if entry.video}
          <video controls preload="none" poster={entry.image.src} aria-label={entry.title}>
            <source src={entry.video.src} type={entry.video.type} />
            <track kind="captions" src={entry.video.captions} srclang="en" label="English" default />
          </video>
        {:else}
          <img src={entry.image.src} alt={entry.image.alt} width={entry.image.width} height={entry.image.height} loading="lazy" decoding="async" />
        {/if}
        <figcaption><span>Fig. {String(index + 1).padStart(2, '0')}</span><span>{entry.context}</span></figcaption>
      </figure>
      <div class="work-documentation">
        <h3 id={`work-${entry.slug}`}>{#if entry.href}<a href={entry.href}>{entry.title}</a>{:else}{entry.title}{/if}</h3>
        <div class="work-specification">
          <dl>{#each entry.specifications as spec}<div><dt>{spec.label}</dt><dd>{spec.value}</dd></div>{/each}</dl>
          {#if entry.outcome}<p>{entry.outcome}</p>{/if}
        </div>
      </div>
    </article>
  {/each}
</div>
