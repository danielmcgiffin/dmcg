<script>
    import Logo from "./Logo.svelte";
</script>

<footer class="bg-[#f5f3ed] text-[#111111]">
    <div class="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo />
        <p>© {new Date().getFullYear()} Daniel McGiffin. All rights reserved.</p>
        <a class="transition hover:text-forest" href="https://www.linkedin.com/in/danny-mcgiffin/">LinkedIn ↗</a>
    </div>
</footer>
