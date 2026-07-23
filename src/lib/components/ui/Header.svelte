<script>
    import Logo from "./Logo.svelte";
</script>

<header class="absolute top-0 z-30 w-full bg-ink text-cream">
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
            <div>
                <Logo />
            </div>
            <ul class="flex items-center gap-6">
                <li>
                    <a
                        href="#how-it-works"
                        class="hidden text-xs font-medium tracking-[0.1em] text-white/60 uppercase transition hover:text-white sm:block"
                    >
                        How it works
                    </a>
                </li>
                <li><a href="https://cal.com/danny-cursus/90min-constraint" class="text-xs font-semibold tracking-[0.1em] text-fern uppercase transition hover:text-white">Book a session ↗</a></li>
            </ul>
    </div>
</header>
