/** Illustrative example only; never client results. */
export const aiExample = {
  "heading": "Opportunity map",
  "disclosure": "Fictional business. Assumed figures. This shows the format of the assessment, not client findings or promised results.",
  "samples": [
    {
      "label": "Opportunity 07 / Sales",
      "title": "Proposal development",
      "status": "Test now",
      "tone": "go",
      "open": true,
      "introLead": true,
      "intro": "Senior staff reconstruct proposals from prior work. Test an AI-assisted first draft using approved material, with a person responsible for every final proposal.",
      "economics": [
        [
          "Current annual labor cost",
          "~$87K",
          "20 hrs/week × $87/hr × 50 weeks"
        ],
        [
          "Capacity hypothesis",
          "8 hrs/week",
          "~$34.8K/year of staff time, if the test supports it"
        ]
      ],
      "record": [
        ["Value mechanism", "Senior capacity and faster proposal turnaround. Freed time only creates value if the business can use it."],
        ["AI fit / difficulty", "High / medium, subject to a test of draft quality and review effort."],
        ["Dependencies", "Clean past proposals, approved qualifications and language, and a named reviewer."],
        ["Costs to establish", "Tool licenses, content cleanup, setup, human review, and ongoing maintenance. Obtain a quote before committing to production."],
        ["Main risk", "Invented qualifications or pricing. Keep pricing outside the draft generator and check every factual claim."],
        ["Build or buy", "Test an existing tool with approved source material before considering custom software."],
        ["First experiment", "20 historical proposals, then a 30-day pilot. Compare total drafting and review time, factual errors, and approval rates against the current process."],
        ["Decision gate", "Proceed only if total effort falls without worse quality. Otherwise revise the approach or stop."]
      ],
      "note": "All figures above are illustrative assumptions. Labor cost is not recoverable savings, and capacity value is before implementation and running costs. The pilot follows the assessment; it is not included in it."
    },
    {
      "label": "Opportunity 12 / Customer service",
      "title": "Answers from internal knowledge",
      "status": "Investigate",
      "tone": "wait",
      "intro": "People spend time finding answers, but the source documents disagree. A faster answer is not useful if it is wrong.",
      "record": [
        ["Before a pilot", "Name the content owner, reconcile conflicting guidance, and measure how often the questions recur."],
        ["Value / costs", "Unquantified until search time, question volume, and content maintenance effort are measured."],
        ["Recommendation", "Investigate the information problem first. Test AI retrieval only after the source material can support reliable answers."]
      ]
    },
    {
      "label": "Opportunity 18 / Finance",
      "title": "An AI agent for approval routing",
      "status": "Don’t bother",
      "tone": "stop",
      "intro": "Approval rules are fixed and already supported by the existing system. The delay comes from missing ownership.",
      "record": [
        ["Better next move", "Assign an owner and configure the existing approval rules."],
        ["AI advantage", "None established. An agent adds ongoing cost and another failure point."],
        ["Recommendation", "Fix the handoff. Measure the resulting turnaround before spending on another tool."]
      ]
    }
  ]
} as const;
