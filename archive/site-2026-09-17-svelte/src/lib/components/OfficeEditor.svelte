<script lang="ts">
  import BuildingHero from './BuildingHero.svelte'

  let progress = $state(0)
</script>

<div class="editor">
  <aside aria-label="Illustration preview controls">
    <a href="/">← Back to site</a>
    <h1>Office illustration</h1>
    <p>Preview the existing exterior image layers and their reveal.</p>
    <label>
      Reveal · {Math.round(progress * 100)}%
      <input type="range" min="0" max="1" step="0.01" bind:value={progress} />
    </label>
    <p>The separate vector source remains available with <code>npm run art:edit</code>. This preview uses the exterior WebP images.</p>
  </aside>
  <div class="preview">
    <BuildingHero progressOverride={progress} />
  </div>
</div>

<style>
  .editor { display: grid; grid-template-columns: 290px minmax(0, 1fr); min-height: 100svh; }
  aside { padding: 1.5rem; border-right: 1px solid #c9c9b6; font-size: .875rem; }
  h1 { font: 2rem Georgia, serif; margin: 1.5rem 0; }
  p { margin: 1.2rem 0; line-height: 1.5; }
  label { display: grid; gap: .65rem; margin-top: 1.5rem; }
  input { accent-color: var(--ink); }
  a { text-decoration: underline; text-underline-offset: 3px; }
  code { font-size: .8rem; overflow-wrap: anywhere; }
  .preview { min-width: 0; }
  @media (max-width: 800px) {
    .editor { grid-template-columns: 1fr; }
    aside { border-right: 0; border-bottom: 1px solid #c9c9b6; }
  }
</style>
