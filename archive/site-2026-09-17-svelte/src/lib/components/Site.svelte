<script lang="ts">
  import { onDestroy } from 'svelte'
  import Homepage from './Homepage.svelte'
  import { bookingUrl, followUrl } from '$lib/content'

  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const isHome = path === '/'
  const isAbout = path === '/about'
  const isTeardown = path === '/teardown'
  const title = isHome
    ? 'I solve the messy business problems no one wants to own'
    : isAbout
      ? 'About'
      : isTeardown
        ? 'Start with the actual problem'
        : 'Page not found'
  const description = isHome
    ? 'Danny McGiffin solves the messy business problems no one wants to own. For owners of small and mid-size companies. No framework, no PowerPoint, no packaged solution.'
    : isAbout
      ? 'Danny McGiffin works with owners of small and mid-size companies on the messy problems nobody else wants to own.'
      : isTeardown
        ? 'Start with the actual problem. The first conversation is not a pitch.'
        : 'This page isn’t here.'
  const navigation = [
    { label: 'Home', href: '/' },
    { label: 'The Work', href: '/#work' },
    { label: 'Field Notes', href: '/#field-notes' },
    { label: 'About', href: '/about' },
  ]
  let menu: HTMLDialogElement
  let menuTrigger: HTMLButtonElement
  let menuClose: HTMLButtonElement
  let menuOpen = $state(false)
  let priorOverflow = ''

  function openMenu() {
    priorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menu.showModal()
    menuClose.focus()
    menuOpen = true
  }
  function closeMenu() { menu.close() }
  function trapMenuFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') return
    const targets = menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    const first = targets[0]
    const last = targets[targets.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
  function onMenuClosed() {
    menuOpen = false
    document.body.style.overflow = priorOverflow
    menuTrigger.focus()
  }
  onDestroy(() => { if (menuOpen) document.body.style.overflow = priorOverflow })
</script>

<svelte:head>
  <title>{title} — Danny McGiffin</title>
  <meta name="description" content={description} />
  {#if !isHome && !isAbout && !isTeardown}<meta name="robots" content="noindex" />{/if}
</svelte:head>

<a class="skip-link" href="#main-content">Skip to content</a>
<div class="site-shell">
  <header class="site-header">
    <a class="wordmark" href="/">Danny McGiffin</a>
    <nav class="header-links" aria-label="Primary navigation"><a href="/#field-notes">Field Notes</a><a href="/about">About</a><a href={bookingUrl}>Talk <span aria-hidden="true">→</span></a></nav>
    <button bind:this={menuTrigger} class="menu-trigger" onclick={openMenu} aria-haspopup="dialog" aria-controls="site-menu" aria-expanded={menuOpen}>Menu <span class="menu-lines" aria-hidden="true"></span></button>
  </header>

  <main id="main-content" tabindex="-1">
    {#if isHome}
      <Homepage />
    {:else if isTeardown}
      <article class="prose-page">
        <div class="page-register"><span>Start</span><span>The actual problem</span></div>
        <h1>Come with the problem, not a brief.</h1>
        <div class="prose-body">
          <p>The first conversation is not a pitch, and it is not a packaged engagement. Tell me what is going on, what is at stake, and where you are stuck.</p>
          <p>I will tell you whether I can help, and whether I can actually bring leverage. If I can’t, I will say so.</p>
          <a class="meeting-link" href={bookingUrl}>Talk to Danny <span aria-hidden="true">↗</span></a>
        </div>
        <p class="page-margin">No framework / No deck / No package</p>
      </article>
    {:else if isAbout}
      <article class="prose-page">
        <div class="page-register"><span>About</span><span>Danny McGiffin</span></div>
        <h1>I take the problems nobody wants to own.</h1>
        <div class="prose-body">
          <p>I work with owners of small and mid-size companies. Sometimes with a P&amp;L leader at a larger firm, when I can actually bring leverage to the issue.</p>
          <p>I don’t bring a framework, a PowerPoint, or a packaged solution. I come look at the problem in front of us, and I solve it with the people, systems, and tools that are already there.</p>
          <p>That has meant killing an ERP implementation before millions more were spent, designing an operating model a professional-services firm could actually run, and building delivery machinery under growth. The pattern is the same: messy, cross-functional, and sitting on someone’s desk because nobody else would take it.</p>
          <p>I live in Herndon, Virginia. Notre Dame, former Army logistics officer, internal leadership and consulting. I care about making the business work for the people who depend on it — including the person who owns it.</p>
          <a class="meeting-link" href={bookingUrl}>Talk to Danny <span aria-hidden="true">↗</span></a>
        </div>
        <p class="page-margin">Herndon, Virginia</p>
      </article>
    {:else}
      <article class="prose-page"><div class="page-register"><span>404</span></div><h1>This page isn’t here.</h1><a class="meeting-link" href="/">Return home <span aria-hidden="true">↗</span></a></article>
    {/if}
  </main>

  <footer class="site-footer">
    <a href={followUrl} class="follow-link">Follow on LinkedIn <span aria-hidden="true">↗</span></a>
    <p>© {new Date().getFullYear()} Danny McGiffin</p>
    <a href={bookingUrl} class="footer-conversation">Talk to Danny <span aria-hidden="true">↗</span></a>
  </footer>
</div>

<dialog bind:this={menu} id="site-menu" class="creative-menu" aria-label="Site navigation" onclose={onMenuClosed} onkeydown={trapMenuFocus}>
  <div class="menu-header"><a class="wordmark" href="/">Danny McGiffin</a><button bind:this={menuClose} class="menu-close" onclick={closeMenu}>Close <span aria-hidden="true">×</span></button></div>
  <div class="menu-layout">
    <nav aria-label="Main navigation">
      {#each navigation as item, index}
        <a class="menu-destination" href={item.href} aria-current={item.href === path ? 'page' : undefined} onclick={closeMenu}><span class="menu-number">{String(index + 1).padStart(2, '0')}</span><span>{item.label}</span></a>
      {/each}
    </nav>
    <div class="menu-aside"><p>Messy problems<br />nobody wants to own.</p><p>No framework. No deck.<br />The tools that are already there.</p><a class="meeting-link" href={bookingUrl}>Talk to Danny <span aria-hidden="true">↗</span></a><a class="follow-link" href={followUrl}>Follow on LinkedIn <span aria-hidden="true">↗</span></a></div>
  </div>
  <div class="menu-footer"><span>Danny McGiffin</span><span>Herndon, Virginia</span></div>
</dialog>
