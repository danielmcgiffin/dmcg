<script lang="ts">
  import Site from '$lib/components/Site.svelte'
  const editing = import.meta.env.DEV && new URLSearchParams(window.location.search).get('edit') === 'office'
</script>

{#if editing}
  <main>
    {#await import('$lib/components/OfficeEditor.svelte') then module}
      <module.default />
    {/await}
  </main>
{:else}
  <Site />
{/if}
