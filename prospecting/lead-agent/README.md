# Hermes + n8n SystemsCraft Lead Agent

This starter kit turns the lead-research prompt into a Hermes skill and gives the agent a safe local state/delivery layer.

## Architecture

- Hermes skill: research procedure and qualification judgment
- Hermes cron: one bounded scheduled run
- Local SQLite: dedupe and run history
- Python submitter: JSON validation and retry-safe POST
- n8n: persistent business workflow, storage, alerts, CRM handoff

The model never marks a lead as sent. The submitter records it only after n8n returns a successful HTTP response.

## 1. Install Hermes

Linux/macOS/WSL:

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes setup --portal
```

Or configure another supported model and web-search provider.

## 2. Install this project

From the extracted starter-kit directory:

```bash
mkdir -p ~/.hermes/skills/research/transitioned-owner-leads
cp skill/SKILL.md ~/.hermes/skills/research/transitioned-owner-leads/SKILL.md

mkdir -p ~/systemscraft-leads
cp -R project/. ~/systemscraft-leads/
chmod +x ~/systemscraft-leads/scripts/submit_batch.py
cp ~/systemscraft-leads/.env.example ~/systemscraft-leads/.env
```

Edit:

```bash
nano ~/systemscraft-leads/.env
```

Leave `DRY_RUN=true` for initial testing.

Verify the skill:

```bash
hermes skills list | grep transitioned-owner-leads
```

## 3. Configure Hermes tools

Run:

```bash
hermes tools
```

For the `cron` platform, enable:
- web
- file
- terminal

Enable browser only if you actually need interactive/dynamic pages. Search and extraction are cheaper and more reliable for most sources.

## 4. Start the Hermes gateway

```bash
hermes gateway install
hermes gateway start
hermes gateway status
```

The gateway must remain running because it owns cron execution.

## 5. Test one manual run

```bash
cd ~/systemscraft-leads
hermes chat -q "/transitioned-owner-leads Run one small test cycle. Inspect no more than 20 sources, qualify no more than 5 leads, write out/latest.json, then run python3 scripts/submit_batch.py out/latest.json."
```

Inspect:

```bash
cat ~/systemscraft-leads/out/latest.json | python3 -m json.tool
sqlite3 ~/systemscraft-leads/state/leads.db '.tables'
```

Because `DRY_RUN=true`, nothing is posted and no lead is marked sent.

## 6. Build the n8n workflow

Create this node chain:

1. Webhook
   - Method: POST
   - Path: `systemscraft-owner-leads`
   - Authentication: Header auth, or validate `X-SystemsCraft-Token`
2. IF or Code
   - Reject requests with an invalid token
3. Code
   - Expand `body.leads` into one n8n item per lead
4. Data Table, Airtable, HubSpot, or Google Sheets
   - Insert/upsert using `dedupe_key`
5. Email/Slack/Telegram
   - Alert only for `lead_priority = high`
6. Respond to Webhook
   - Return HTTP 200 only after storage succeeds

Useful Code-node expression to fan out leads:

```javascript
const payload = $json.body ?? $json;
const leads = Array.isArray(payload.leads) ? payload.leads : [];
return leads.map((lead) => ({ json: lead }));
```

Activate the workflow and copy its production webhook URL into `.env`.

Set the same long random secret in n8n and `N8N_WEBHOOK_TOKEN`.

## 7. Turn on delivery

Edit `.env`:

```env
DRY_RUN=false
```

Then rerun the manual test. Confirm that:
- n8n receives the batch
- the destination stores each lead
- n8n returns 2xx
- the local SQLite database records the leads

## 8. Create the scheduled job

Start conservatively with one run per day:

```bash
hermes cron create "every 1d" \
  "Run one bounded transitioned-owner research cycle. Use varied queries, inspect no more than 100 sources, write out/latest.json, then run python3 scripts/submit_batch.py out/latest.json. Return only counts and errors." \
  --skill transitioned-owner-leads \
  --workdir "$HOME/systemscraft-leads" \
  --name "SystemsCraft owner leads"
```

Test it immediately:

```bash
hermes cron list
hermes cron run "SystemsCraft owner leads"
hermes cron status
```

Do not start at every six hours. Acquisition and succession events are not stock ticks. Daily is plenty until you prove the lead quality.

## 9. Operate it

Weekly:
- Review false positives and false negatives
- Update the skill's search terms and exclusions
- Inspect cost per accepted lead
- Check failed runs and source blocks
- Archive old output files
- Back up `state/leads.db`

Measure:
- Candidates reviewed
- Qualified leads
- Accepted leads after human review
- Contactable leads
- Replies
- Calls
- Paid engagements

Do not optimize for scraped rows. Optimize for owners worth contacting.
