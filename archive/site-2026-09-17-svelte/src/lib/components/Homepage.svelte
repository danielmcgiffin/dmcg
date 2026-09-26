<script lang="ts">
  import { bookingUrl, fieldNotes, followUrl } from '$lib/content'

  const situations = [
    'A system already in flight that does not fit how the business actually works.',
    'A strategy the company cannot deliver with the incentives and ownership it has.',
    'Work that still lands on the owner, even with a capable team.',
    'A process everyone works around, and nobody owns.',
    'Something labeled technology or AI that is actually a decision problem.',
  ]
</script>

<div class="business-home">
  <section class="opening" aria-labelledby="worldview">
    <h1 id="worldview">I solve the messy business problems<br class="desktop-break" /> no one wants to own.</h1>
    <div class="opening-copy">
      <p>For owners of small and mid-size companies. Sometimes for a P&amp;L leader at a larger firm, when I can actually bring leverage.</p>
      <p>I don’t bring a framework, a PowerPoint, or a packaged solution.</p>
      <p class="opening-turn">I solve the problem in front of me with the tools that are actually there.</p>
    </div>
    <a class="talk-button" href={bookingUrl}>Talk to Danny <span aria-hidden="true">→</span></a>
    <a class="down-link" href="#why" aria-label="See what that work looks like">↓</a>
  </section>

  <section class="chapter friction" id="why" aria-labelledby="why-title">
    <p class="eyebrow">The work</p>
    <h2 id="why-title">It usually arrives<br />wearing the wrong name.</h2>
    <ul class="friction-list">{#each situations as situation}<li>{situation}</li>{/each}</ul>
    <p class="chapter-end">If it were clean and obvious, someone inside would already have it.</p>
  </section>

  <section class="chapter designed" aria-labelledby="designed-title">
    <p class="eyebrow">Under the label</p>
    <h2 id="designed-title">The visible problem<br />is rarely the real one.</h2>
    <figure class="experience-drawing">
      <svg viewBox="0 0 1000 390" role="img" aria-labelledby="drawing-title drawing-desc">
        <title id="drawing-title">What it looks like, and what is underneath</title>
        <desc id="drawing-desc">An architectural arcade shifts from a solid facade into a construction drawing, showing the visible situation and the structure underneath it.</desc>
        <defs><linearGradient id="facade"><stop stop-color="#d7cdb4"/><stop offset="1" stop-color="#9e957e"/></linearGradient><pattern id="plan-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#b2a17c" stroke-opacity=".13"/></pattern></defs>
        <rect x="500" y="20" width="480" height="335" fill="url(#plan-grid)"/>
        <path d="M65 320V100H500V320H445V205A55 55 0 0 0 335 205V320H290V205A55 55 0 0 0 180 205V320Z" fill="url(#facade)"/>
        <path d="M50 100V80H500V100M65 125H500M65 305H180M290 305H335M445 305H500" fill="none" stroke="#eee5cf" stroke-width="2"/>
        <g fill="none" stroke="#b2a17c" stroke-width="1.5">
          <path d="M500 80H935V100H500M500 125H920M500 320H535V205A55 55 0 0 1 645 205V320H690V205A55 55 0 0 1 800 205V320H845V100M920 100V320H845M500 100H935M35 335H955"/>
          <path d="M535 205V145H645V205M690 205V145H800V205M535 305H645M690 305H800M845 305H920" stroke-opacity=".5"/>
          <path d="M590 45V350M745 45V350M500 205H950M500 260H950" stroke-dasharray="4 7" stroke-opacity=".45"/>
          <path d="M535 55H800M535 48V62M645 48V62M690 48V62M800 48V62M955 100V320M948 100H962M948 320H962"/>
          <circle cx="590" cy="205" r="55" stroke-opacity=".35"/><circle cx="745" cy="205" r="55" stroke-opacity=".35"/>
        </g>
      </svg>
      <figcaption><div><strong>The label</strong><span>What it was called</span></div><span class="relationship" aria-hidden="true">←⟶</span><div><strong>The work</strong><span>What was actually going on</span></div></figcaption>
    </figure>
    <div class="designed-copy"><p>It arrives as technology, operations, or strategy.</p><p>Follow it far enough and you find decisions, incentives, and work that do not fit together. That is the part I take on.</p></div>
  </section>

  <section class="chapter evidence" id="work" aria-labelledby="evidence-title">
    <p class="eyebrow">From the work</p>
    <h2 id="evidence-title">Messy problems.<br />Real consequences.</h2>
    <div class="evidence-intro"><p>Sometimes as an internal leader. Sometimes brought in because something important needed figuring out.</p></div>
    <article class="case"><h3>Enterprise ERP</h3><p>Dug into how the business actually worked, concluded the proposed operating model didn’t fit, and helped leadership stop the implementation</p><p class="case-result">before millions more were spent.</p></article>
    <article class="case"><h3>Professional services</h3><p>Designed a cross-practice operating model that produced</p><div class="metrics"><p><strong>70%</strong> less rework</p><p><strong>50%</strong> faster coordination</p><p><strong>60%</strong> faster delivery</p></div></article>
    <article class="case"><h3>Federal contractor</h3><p>Built the delivery machinery beneath rapid growth:</p><div class="metrics"><p><strong>1 → 15</strong> people</p><p><strong>$200K → $2M</strong></p><p><strong>100%</strong> retention</p></div></article>
    <article class="case"><h3>Global technology program</h3><p>Brought in to hold together a $64M classified global deployment.</p><p class="case-result">Planned scope complete in four months.</p></article>
    <a class="meeting-link" href="/about">More about Danny <span aria-hidden="true">→</span></a>
  </section>

  <section class="chapter how" aria-labelledby="how-title">
    <p class="eyebrow">How I work</p>
    <h2 id="how-title">No framework.<br />No deck. No package.</h2>
    <div class="how-copy">
      <p>I come look at the problem in front of us. I use the people, systems, and tools that are already there.</p>
      <p>The answer might be a system, a different way of working, or clearer ownership. Sometimes the highest-value work is stopping something that should not be built.</p>
      <p class="how-turn">Then we check whether it actually works.</p>
    </div>
  </section>

  <section class="chapter closing" aria-labelledby="closing-title">
    <h2 id="closing-title">Bring me the problem<br />nobody wants.</h2>
    <p>You don’t need a brief. Tell me what’s going on.</p>
    <a class="talk-button" href={bookingUrl}>Talk to Danny <span aria-hidden="true">→</span></a>
    <div id="field-notes" class="field-notes"><p>Not ready for that yet?</p><h3>Field notes</h3><p>On the work, when I write it down.</p>
      {#if fieldNotes.length}<ul>{#each fieldNotes as note}<li><a class="meeting-link" href={note.href}>{note.title} <span aria-hidden="true">→</span></a></li>{/each}</ul>{/if}
      <a class="meeting-link" href={followUrl}>Follow on LinkedIn <span aria-hidden="true">↗</span></a>
    </div>
  </section>
</div>
