#!/usr/bin/env python3
"""Render the 1200×630 share images in public/og/ from one template.

Run after changing a card below: python3 scripts/og-images.py (after npm ci).
"""
import subprocess
from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(__file__).resolve().parents[1] / "public/og"
HEADER = "DANNY McGIFFIN / INDEPENDENT MANAGEMENT CONSULTANT"

# slug: (headline lines, index of the green line, detail line, footer label, footer path)
CARDS = {
    "case-64m-deployment": (["Leading a $64M", "technology deployment."], 0, "Four Inc. · Program leadership and coordinated delivery", "CASE STUDY", "work/64m-deployment"),
    "case-negotiation-policy": (["A simpler answer to", "a contracting problem."], 0, "A focused advisory conversation", "CASE STUDY", "work/negotiation-policy"),
    "default": (["Danny McGiffin", "Independent management", "consultant."], 0, "Business judgment. Practical design. Experience delivering change.", "DANNY MCGIFFIN", ""),
    "home": (["Danny McGiffin", "Independent management", "consultant."], 0, "Business judgment. Practical design. Experience delivering change.", "DANNY MCGIFFIN", ""),
    "about": (["About Danny.", "Background, work,", "and approach."], 0, "Northern Virginia / Washington, DC", "ABOUT", "about"),
    "tech-audit": (["Find out what your", "technology actually", "costs, and what it’s worth."], 1, "$5,000 fixed fee · 10 business days · Money-back guarantee", "TECH AUDIT", "tech-audit"),
    "second-opinion": (["Before you commit,", "get an independent", "call."], 1, "From $2,500 · Fixed quote · Proceed, change, or stop", "SECOND OPINION", "second-opinion"),
    "ai-opportunity": (["Figure out what AI is", "actually worth doing", "in your business."], 1, "$5,000 fixed fee · 10 business days · A map of what comes next", "AI OPPORTUNITY", "ai-opportunity"),
    "data-connection": (["Connect what you have", "without buying", "a new system."], 1, "From $7,500 · Fixed quote · Typically 3–6 weeks", "DATA CONNECTION", "data-connection"),
    "case-studies": (["What I found,", "what we decided,", "and what happened."], 1, "Decisions, operating models, and delivery", "CASE STUDIES", "work"),
    "case-erp-second-opinion": (["The ERP we decided", "not to implement."], 1, "$2.45M+ projected path → alternative estimated at ~$50K", "CASE STUDY", "work/erp-decision"),
    "case-operating-model": (["Redesigning an operating", "model that made", "collaboration irrational."], 1, "Professional services · Incentives, ownership, decision rights", "CASE STUDY", "work/operating-model"),
    "case-growth": (["Building the company", "underneath", "10× growth."], 2, "Professional services · ~$200K to $2M recognized revenue", "CASE STUDY", "work/growth"),
    "case-navy-improper-payments": (["Making improper", "payments measurable", "and controllable."], 1, "Federal financial management · ~$250M decline in estimated improper payments", "CASE STUDY", "work/navy-improper-payments"),
    "northern-virginia": (["Independent management", "consulting in", "Northern Virginia."], 2, "Based in Herndon · Serving the Washington, DC area", "NORTHERN VIRGINIA", "northern-virginia-ai-workflow-automation"),
}


def svg(lines, green, detail, label, path):
    size = 66 if max(len(line) for line in lines) <= 22 else 58
    y0 = 204 if len(lines) == 3 else 244
    text = "\n".join(
        f'      <text x="72" y="{y0 + i * 79}"{" fill=\"#214d38\"" if i == green else ""}>{escape(line)}</text>'
        for i, line in enumerate(lines)
    )
    url = f"dannymcgiffin.com/{path}".rstrip("/")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f3f2e9"/>
  <rect width="18" height="630" fill="#214d38"/>
  <g font-family="Arial, sans-serif">
    <text x="76" y="82" font-size="19" font-weight="700" letter-spacing="2" fill="#214d38">{HEADER}</text>
    <g font-size="{size}" font-weight="700" letter-spacing="-2" fill="#303a32">
{text}
    </g>
    <path d="M76 420H1124" stroke="#bcc8b9"/>
    <text x="76" y="478" font-size="24" fill="#214d38">{escape(detail)}</text>
    <text x="76" y="559" font-size="19" fill="#596154">{escape(label)}</text>
    <text x="1124" y="559" font-size="19" text-anchor="end" fill="#596154">{escape(url)}</text>
  </g>
</svg>
'''


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, card in CARDS.items():
        source = OUT / f"{slug}.svg"
        source.write_text(svg(*card))
        subprocess.run([
            "node", "--input-type=module", "-e",
            "import sharp from 'sharp'; await sharp(process.argv[1]).png().toFile(process.argv[2]);",
            str(source), str(OUT / f"{slug}.png")
        ], cwd=OUT.parents[1], check=True)
    print(f"Rendered {len(CARDS)} images in {OUT}")


if __name__ == "__main__":
    main()
