<script>
    import { goto } from "$app/navigation";
</script>

<button on:click={() => goto("/")} class="inline-flex items-baseline gap-2" aria-label="Daniel McGiffin home">
    <span class="h-2 w-2 rounded-full bg-white"></span>
    <span class="text-sm font-semibold tracking-tight">Daniel McGiffin</span>
</button>
