<!-- Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 -->

# Content audit

## Ten findings to fix first

1. [The product demo presents invented results, customers, usage, and timing as real activity.](#product-demo-copy)
2. [Three public comparison pages say their copy and evidence are placeholders.](#compare)
3. [The freelancer comparison publishes unsupported speed, price, availability, and retainer claims.](#compare)
4. [Five German product pages open in English before switching to German.](#german-site)
5. [All six German industry pages publish their main sales copy in English.](#german-site)
6. [The German cookie dialog and interactive demo controls remain English.](#german-site)
7. [Scheduled-task pages promise unsupported cadences, delivery points, and exact arrival times.](#product-pages)
8. [The site says every coworker publishes models, hosting, tasks, and samples; the catalog disproves it.](#coworker-profiles)
9. [“In use at” turns a logo strip into an unsupported customer claim across the site.](#shared-components)
10. [The CMS contains two live manual offers with the same `data-deep-dive` slug.](#cms-content)

## Scope checked

The audit covered every template, the English homepage, all 619 German dictionary keys, the German homepage replacements, all 273 sitemap URLs, and localized CMS records for comparisons, coworkers, guides, industries, offers, pages, posts, releases, testimonials, and use cases. The CMS pass covered 54 coworker records, 55 offers, eight use cases, six industries, five testimonials, four product pages, and each published comparison, guide, post, and release. All sitemap URLs returned HTTP 200; the findings below concern what those pages say.

Priorities: **P1** risks trust, accuracy, or publishing the wrong language; **P2** obscures the offer or relies on stock sales copy; **P3** is a smaller wording or consistency defect.

## Shared components

### Unsupported customer claim

- Location: `apps/sokosumi/templates/shell.js:514`
- Current text: “In use at” above BMW, Lufthansa, eBay, and other logos.
- Problem: The label states that every shown brand uses Sokosumi, but the repository and CMS contain no support for that claim.
- Fix: Delete the label and logo strip until each relationship is approved for public use.
- Priority: P1

### Vague AI disclosure

- Location: `apps/sokosumi/templates/shell.js:967`
- Current text: “Some of the content on this site is AI generated.”
- Problem: The disclosure makes the whole site suspect without identifying the affected content or its review status.
- Fix: Delete.
- Priority: P1

### Misleading model and hosting caption

- Location: `apps/sokosumi/templates/shell.js:462`
- Current text: “profiles show the models a coworker runs on and the region it runs in.”
- Problem: Several catalog records omit one or both fields, so the caption states a rule the data does not meet.
- Fix: “Profiles show models and hosting when the vendor provides them.”
- Priority: P1

### Asterisk used as legal-looking fine print

- Location: `apps/sokosumi/templates/shell.js:582`
- Current text: “*No Credit Card required”
- Problem: The asterisk points to no note, and “Credit Card” ignores the site’s sentence-case rule.
- Fix: “No credit card required.”
- Priority: P3

### Coworker and agent terms collapse in navigation

- Location: `apps/sokosumi/templates/shell.js:683`
- Current text: “Specialist AI agents with a name, a role and a vendor behind them.”
- Problem: The menu describes coworkers as agents while the coworker page insists they are different products.
- Fix: “Browse AI coworkers and specialist agents from marketplace vendors.”
- Priority: P1

### Use-case menu promises preloaded knowledge

- Location: `apps/sokosumi/templates/shell.js:795`
- Current text: “Pick one and the coworkers behind it already know the brief.”
- Problem: The claim hides the setup and context a user still has to supply.
- Fix: “Pick a workflow and review the coworkers and tasks linked to it.”
- Priority: P2

### Footer compresses four claims into one sentence

- Location: `apps/sokosumi/templates/shell.js:939`
- Current text: “The marketplace where you hire AI coworkers for real marketing work — research, social, planning, and writing, delivered as finished files.”
- Problem: The category list repeats nearby navigation and makes the main definition harder to find.
- Fix: “Hire AI coworkers for marketing tasks that return finished files.”
- Priority: P2

### Default CTA says nothing about the next step

- Location: `apps/sokosumi/templates/shell.js:592`
- Current text: “Put an AI coworker on it”
- Problem: “It” has no stable referent when the component appears on many pages.
- Fix: “Start a task.”
- Priority: P2

### Mobile navigation ignores sentence case

- Location: `apps/sokosumi/templates/shell.js:853`
- Current text: “AI Coworkers”, “Template Tasks”, “Talk to Sales”
- Problem: The labels conflict with the declared sentence-case interface.
- Fix: “AI coworkers”, “Template tasks”, “Talk to sales”
- Priority: P3

### German cookie choices are English

- Location: `apps/sokosumi/assets/consent.js:193`
- Current text: “Accept all”, “Reject non-essential”, “Manage preferences”, “Save choices”
- Problem: The consent decision on `/de` is not localized, including its explanatory text and accessible label.
- Fix: Delete the German cookie dialog until its heading, body, category descriptions, controls, link label, and accessible label all have approved German copy.
- Priority: P1

## Landing page

### Hero headline uses title case

- Location: `apps/sokosumi/index.html:140`
- Current text: “AI Coworkers for Marketing.”
- Problem: The capitalization conflicts with the site’s sentence-case rule and makes the line read like a category label.
- Fix: “AI coworkers for marketing.”
- Priority: P3

### Hero subhead is a stock automation promise

- Location: `apps/sokosumi/index.html:144`
- Current text: “Automate Your Marketing with AI Agents That Work Around the Clock”
- Problem: It uses title case, switches from coworkers to agents, and makes an unsupported 24-hour availability claim.
- Fix: “Brief AI coworkers and receive finished marketing files.”
- Priority: P1

### CTA labels use title case

- Location: `apps/sokosumi/index.html:148`
- Current text: “Talk to Sales” and “Sign Up”
- Problem: The labels break the interface’s sentence-case rule.
- Fix: “Talk to sales” and “Sign up”
- Priority: P3

### Roster introduction reads like internal inventory notes

- Location: `apps/sokosumi/index.html:186`
- Current text: “Serviceplan Group and utxo AG both have coworkers here, and other vendors do too. A lot of them ship template tasks…”
- Problem: The paragraph lists caveats and implementation details before explaining what a visitor can do.
- Fix: “Browse named AI coworkers, their vendors, and the tasks they offer.”
- Priority: P2

### One brief becomes an unlimited promise

- Location: `apps/sokosumi/index.html:201`
- Current text: “You write one briefing. They do the rest.”
- Problem: The line hides review, follow-up questions, and any work the user still owns.
- Fix: “Write a brief, review the task, and download the result.”
- Priority: P1

### Lead-coworker handoff is stated as universal behavior

- Location: `apps/sokosumi/index.html:202`
- Current text: “A lead coworker can break the brief up and send pieces out.”
- Problem: The catalog does not show that every lead coworker can delegate work this way.
- Fix: “Some coworkers can assign parts of a brief to specialist agents.”
- Priority: P1

### Setup-form claim has no support

- Location: `apps/sokosumi/index.html:233`
- Current text: “You file one ticket and skip the setup forms; the lead coworker takes it from there.”
- Problem: The page promises a setup path that is not established elsewhere in the product copy.
- Fix: Delete.
- Priority: P1

### Workflow label is grammatically broken

- Location: `apps/sokosumi/index.html:240`
- Current text: “Split & delegated”
- Problem: The two words do not share a grammatical form.
- Fix: “Split and delegate.”
- Priority: P3

### Coworkers are called people

- Location: `apps/sokosumi/index.html:268`
- Current text: “Elena hands the packages to the people who do that work”
- Problem: The sentence blurs AI workers and humans on a page that needs to keep that boundary plain.
- Fix: “Elena assigns each package to a specialist agent.”
- Priority: P1

### Sample-output sentence uses vague shape language

- Location: `apps/sokosumi/index.html:305`
- Current text: “see the shape of the output before you spend credits.”
- Problem: “Shape” avoids saying what a visitor can inspect.
- Fix: “Open the sample file before you spend credits.”
- Priority: P2

### Builder credit omits NMKR and uses an odd verb

- Location: `apps/sokosumi/index.html:379`
- Current text: “Serviceplan Group builds and runs Sokosumi. Their strategists write the Serviceplan coworkers…”
- Problem: The project credit omits NMKR, and people do not “write” coworkers.
- Fix: “Serviceplan Group built Sokosumi with NMKR. Each vendor develops and operates its own listings.”
- Priority: P1

### Org-chart heading over-humanizes the product

- Location: `apps/sokosumi/index.html:390`
- Current text: “They report to your team”
- Problem: The heading suggests an employment and reporting relationship that the product does not create.
- Fix: “Your team reviews the work.”
- Priority: P1

### FAQ overstates model disclosure

- Location: `apps/sokosumi/index.html:466`
- Current text: “Most profiles name the models, Claude and Mistral among them.”
- Problem: Many catalog profiles have no model field, so “most” is not supported by the records.
- Fix: “Some profiles list their models and hosting region.”
- Priority: P1

### CEO quote is a chain of abstract nouns

- Location: `apps/sokosumi/index.html:495`
- Current text: “Agentic services enable interaction, and with it the thread that ties together all of our AI applications and services.”
- Problem: The quote does not tell a buyer what Sokosumi does or why the claim matters.
- Fix: Delete the quote block.
- Priority: P2

### Homepage counter mixes two record types

- Location: `apps/sokosumi/index.html:705`
- Current text: `coworkers.length + agents.length` labelled “AI Coworkers”
- Problem: The displayed total counts marketplace agents as coworkers after the site says they are distinct.
- Fix: “Coworkers and agents”
- Priority: P1

## Product pages

### Product summary claims unspecified guarantees

- Location: `apps/sokosumi/lib/i18n.js:787`
- Current text: “the surfaces, workflows, and guarantees behind Sokosumi.”
- Problem: No guarantees are named or supported on the page.
- Fix: “the screens and workflows in Sokosumi.”
- Priority: P1

### Product hero denies a feature the page demonstrates

- Location: `apps/sokosumi/templates/productDemo.js:1017`
- Current text: “Work with AI coworkers, not a chat window”
- Problem: Chat is one of the product’s main screens, so the contrast is false.
- Fix: “Brief coworkers, track tasks, and collect files.”
- Priority: P1

### Coworker definition invents a manager relationship

- Location: `CMS pages/product/ai-coworkers/layout[0].subheading`
- Current text: “An AI coworker has a name, a role, and a manager: you.”
- Problem: The product does not establish a managerial or employment relationship.
- Fix: “An AI coworker has a name, a role, and a public profile.”
- Priority: P1

### Every profile is said to disclose models and hosting

- Location: `CMS pages/product/ai-coworkers/layout[1].items[2].text`
- Current text: “Every coworker lists the models it runs on and where it is hosted”
- Problem: The coworker records contain missing model and hosting fields.
- Fix: “Profiles list models and hosting when the vendor provides them.”
- Priority: P1

### Every coworker is said to ship tasks and samples

- Location: `CMS pages/product/ai-coworkers/layout[1].items[4].text`
- Current text: “Every coworker ships ready-to-run tasks with sample outputs”
- Problem: Maya, Jamal, Pheme, and other profiles explicitly say they have no template tasks.
- Fix: “Some coworkers offer template tasks with sample outputs.”
- Priority: P1

### “No seats” contradicts seat-based plans

- Location: `CMS pages/product/ai-coworkers/layout[1].items[5].text`
- Current text: “No seats, no retainers, no idle cost.”
- Problem: The pricing page sells credits per seat, so the first claim is false.
- Fix: “Each task shows its credit price before you run it.”
- Priority: P1

### Roster statistics are editorial snapshots

- Location: `CMS pages/product/ai-coworkers/layout[2]`
- Current text: “40+ specialist agents”, “13 curated coworkers”, “9 vendors”
- Problem: Static CMS totals will drift from the live catalog and already conflict with other counts on the site.
- Fix: Delete the stats block, or calculate all three values from the same catalog response at render time.
- Priority: P1

### “One click away” hides the actual path

- Location: `CMS pages/product/ai-coworkers/layout[5].heading`
- Current text: “Your next coworker is one click away.”
- Problem: The phrase is generic and does not say that the click opens signup.
- Fix: “Create an account to start a task.”
- Priority: P2

### Briefing page promises automatic workspace context

- Location: `apps/sokosumi/templates/pagesCms.js:110`
- Current text: “workspace context (like brand guidelines) is added to every task automatically.”
- Problem: This broad product behavior is not supported by the other product descriptions or demo.
- Fix: Delete.
- Priority: P1

### Briefing page says coworkers ask instead of guessing

- Location: `apps/sokosumi/templates/pagesCms.js:118`
- Current text: “the task waits in Input required instead of guessing wrong.”
- Problem: The absolute claim promises model behavior the interface cannot assure.
- Fix: “A coworker can move a task to Input required and ask a question.”
- Priority: P1

### Task board is called an audit trail

- Location: `apps/sokosumi/templates/pagesCms.js:139`
- Current text: “an audit trail for AI work.”
- Problem: “Audit trail” implies controls and retention rules that the page does not define.
- Fix: “a history of task status, coworker, and credit cost.”
- Priority: P1

### Output page says every task ends with a file

- Location: `apps/sokosumi/templates/pagesCms.js:150`
- Current text: “Every task ends in a deliverable”
- Problem: Tasks can fail, pause, or return non-file output, and another CMS block discusses incomplete tasks.
- Fix: “Completed template tasks return the deliverable listed on the task page.”
- Priority: P1

### “In your Drive” names a product area as if it were Google Drive

- Location: `apps/sokosumi/templates/pagesCms.js:162`
- Current text: “In your Drive”
- Problem: The page does not explain whether this is Google Drive or Sokosumi workspace storage.
- Fix: “In workspace files.”
- Priority: P2

### Chat page promises external shared channels

- Location: `apps/sokosumi/templates/pagesCms.js:178`
- Current text: “External shared channels let clients and partners hand work to your coworkers directly”
- Problem: The demo has no external channels and no repository evidence establishes this access model.
- Fix: Delete.
- Priority: P1

### Chat page says every coworker supports direct messages

- Location: `apps/sokosumi/templates/pagesCms.js:188`
- Current text: “every coworker can be messaged directly”
- Problem: The catalog does not declare direct-message support per coworker.
- Fix: “Coworkers shown in chat can be messaged directly.”
- Priority: P1

### Scheduled-task headline promises an exact delivery time

- Location: `apps/sokosumi/templates/pagesCms.js:200`
- Current text: “Set it once. The report arrives every Monday.”
- Problem: A run may need input or fail, so the headline promises arrival rather than a scheduled attempt.
- Fix: “Schedule a recurring task.”
- Priority: P1

### Scheduled-task page says any task can run on three cadences

- Location: `apps/sokosumi/templates/pagesCms.js:201`
- Current text: “Any task can run daily, weekly or monthly.”
- Problem: The statement is broader than the available task and coworker records support.
- Fix: “Supported tasks can run on a daily, weekly, or monthly schedule.”
- Priority: P1

### Scheduled runs are promised in three destinations

- Location: `apps/sokosumi/templates/pagesCms.js:201`
- Current text: “the finished file lands on your board, in chat, and in your notifications.”
- Problem: The copy guarantees three delivery surfaces without stating the conditions for each one.
- Fix: “Each run appears in task history; completed files remain attached to the run.”
- Priority: P1

### Scheduling FAQ claims a common customer behavior

- Location: `apps/sokosumi/templates/pagesCms.js:111`
- Current text: “weekly reports are the most common scheduled brief.”
- Problem: No usage data in the repository or CMS supports “most common.”
- Fix: Delete the clause.
- Priority: P1

## Use cases

### Hub calls every workflow ready to start

- Location: `apps/sokosumi/templates/useCases.js:84`
- Current text: “Every use case on this page is a real workflow you can start today.”
- Problem: Use-case pages link to signup rather than to a runnable workflow, and some named coworkers have no template tasks.
- Fix: “Each use case links the relevant coworkers and available tasks.”
- Priority: P1

### Hub repeats a three-step sales formula

- Location: `apps/sokosumi/templates/useCases.js:75`
- Current text: “Pick the work”, “Hand it over”, “Get the file”
- Problem: The sequence repeats claims made in the hero without helping a visitor choose a use case.
- Fix: Delete the step block.
- Priority: P2

### Use-case count sentence is grammatically broken

- Location: `apps/sokosumi/templates/useCases.js:134`
- Current text: “Each one is a real job, start to finished file…”
- Problem: “Start to finished file” is not grammatical English.
- Fix: “Each workflow shows the brief, the coworkers, and the expected file.”
- Priority: P3

### Market-intelligence page promises every claim is sourced

- Location: `CMS use-cases/market-intelligence-briefings/layout[3].items[0].text`
- Current text: “Every claim carries its source, so the briefing can be quoted…or forwarded to compliance without a rewrite.”
- Problem: Source links do not make a document approved for compliance or safe to quote unchanged.
- Fix: “The report includes source references for review.”
- Priority: P1

### Market-intelligence FAQ invents a customer pattern

- Location: `CMS use-cases/market-intelligence-briefings/layout[5].items[1].answer`
- Current text: “Teams usually run it weekly and forward the document as is.”
- Problem: No customer research or usage data supports “usually,” and forwarding without review is poor advice.
- Fix: Delete.
- Priority: P1

### Seasonal page says creative can precede an agreed plan

- Location: `CMS use-cases/seasonal-campaign-planning/layout[2].items[2].text`
- Current text: “the creative can start while the plan is still being argued about.”
- Problem: The sentence endorses rework and uses a needlessly combative description of planning.
- Fix: “Run each creative task after its channel brief is approved.”
- Priority: P2

### Seasonal output claims pages are on-brand

- Location: `CMS use-cases/seasonal-campaign-planning/layout[6].items[6].answer`
- Current text: “the pages Dite builds are on-brand rather than generic”
- Problem: Brand fit depends on the brief and review; it cannot be promised as an output property.
- Fix: “Review the ads and pages against your brand rules before publishing.”
- Priority: P1

### New-business page claims its prep decides a pitch

- Location: `CMS use-cases/agency-new-business-research/layout[0].subheading`
- Current text: “The prep that decides a pitch”
- Problem: Research can inform a pitch but does not decide the outcome.
- Fix: “Research for your first prospect call.”
- Priority: P1

### New-business page invents a Sunday-work contrast

- Location: `CMS use-cases/agency-new-business-research/layout[3].items[0].text`
- Current text: “measured in somebody’s Sunday.”
- Problem: The drama adds no product information and assumes a buyer’s working pattern.
- Fix: “The credit price is shown before each run.”
- Priority: P2

### New-business FAQ guarantees the prospect will not notice

- Location: `CMS use-cases/agency-new-business-research/layout[6].items[1].answer`
- Current text: “No. The research reads public sources…”
- Problem: Public-source research does not justify an absolute promise that a prospect cannot notice.
- Fix: “The tasks use public sources and do not contact the prospect.”
- Priority: P1

### “Always-on” conflicts with scheduled runs

- Location: `CMS use-cases/always-on-social-listening/title`
- Current text: “Always-on social listening”
- Problem: The page later says users brief separate weekly or monthly runs, not continuous monitoring.
- Fix: “Scheduled social listening reports.”
- Priority: P1

### Social-listening output impersonates a strategist

- Location: `CMS use-cases/always-on-social-listening/layout[6].intro`
- Current text: “A report a strategist would write.”
- Problem: The comparison asserts human-level authorship instead of stating the output.
- Fix: “A written report with themes, source posts, and suggested responses.”
- Priority: P2

### GEO page states model trust as a measurable fact

- Location: `CMS use-cases/seo-and-ai-visibility/layout[1].items[1].text`
- Current text: “which sources they trust, and which brands they recommend.”
- Problem: Model outputs can cite or name sources; the task cannot establish what a model “trusts.”
- Fix: “which sources and brands appear in sampled AI answers.”
- Priority: P1

### Audience sprint promises two weeks of work overnight

- Location: `CMS use-cases/audience-research-sprint/layout[0].subheading`
- Current text: “The work that used to fill a two-week discovery phase, done overnight”
- Problem: The time comparison has no cited benchmark and overstates what synthetic profiles replace.
- Fix: “Run audience profiles, message tests, and a planning document as separate tasks.”
- Priority: P1

### Audience sprint promises same-day completion

- Location: `CMS use-cases/audience-research-sprint/layout[6].items[2].answer`
- Current text: “The runs are tasks that complete the same day you brief them.”
- Problem: The absolute completion time has no service commitment behind it.
- Fix: “Run the profiles first, then the message test, then the planning document.”
- Priority: P1

### Audience checklist says nothing is invented

- Location: `CMS use-cases/audience-research-sprint/layout[5].intro`
- Current text: “Everything sourced, nothing invented.”
- Problem: The same page uses five synthetic personas, so the absolute claim is internally false.
- Fix: “Source the audience profiles and label the synthetic panel results.”
- Priority: P1

### Launch page promises a month from one brief

- Location: `CMS use-cases/launch-content-engine/title`
- Current text: “Turn one launch into a month of content”
- Problem: The amount and duration are invented; the page only describes separate content tasks.
- Fix: “Create launch content from one approved brief.”
- Priority: P1

### Copy score is called objective

- Location: `CMS use-cases/launch-content-engine/layout[4].items[2].title`
- Current text: “An objective score for the room”
- Problem: A rubric-based AI assessment is not objective.
- Fix: “A shared copy-review rubric.”
- Priority: P1

### Competitor report promises Monday delivery

- Location: `CMS use-cases/competitor-monitoring/layout[0].subheading`
- Current text: “hands you the same report every Monday, with sources.”
- Problem: The sentence promises successful delivery rather than a schedule.
- Fix: “Schedule a weekly competitor report with source links.”
- Priority: P1

### Competitor FAQ invents the usual cadence

- Location: `CMS use-cases/competitor-monitoring/layout[6].items[0].answer`
- Current text: “Weekly is the rhythm most teams settle on”
- Problem: No CMS or repository data supports the customer-behavior claim.
- Fix: “Choose a cadence that matches how often the sources change.”
- Priority: P1

### Every use case repeats the same pricing answer

- Location: `CMS use-cases/*/layout[*].items[*].question`
- Current text: “What does it cost to run?” followed by the same account-and-credits answer on all eight pages.
- Problem: The repeated answer adds length while withholding the actual task prices.
- Fix: Delete these eight FAQ items and link once to pricing near the page CTA.
- Priority: P2

## Industries

### Agency page assumes visitors switched products

- Location: `apps/sokosumi/templates/useCases.js:182`
- Current text: “Why agencies switch”
- Problem: The heading presumes a decision the visitor has not made.
- Fix: “Where agencies use Sokosumi.”
- Priority: P2

### Agency page promises overnight pitch research

- Location: `apps/sokosumi/templates/useCases.js:186`
- Current text: “pitch research overnight”
- Problem: The turnaround claim has no supporting service level.
- Fix: “run pitch-research tasks from public sources.”
- Priority: P1

### Agency page claims headcount savings

- Location: `apps/sokosumi/templates/useCases.js:186`
- Current text: “without scaling headcount”
- Problem: The product cannot promise a staffing outcome.
- Fix: Delete the clause.
- Priority: P1

### Agency page invents a weekly routine

- Location: `apps/sokosumi/templates/useCases.js:201`
- Current text: “A week with coworkers on the team”, “The cadence agency teams settle into”, “Monday, 8:00”, “Before every pitch”, “Friday”
- Problem: The schedule is fictional proof, not a documented customer workflow.
- Fix: Delete the “week” block.
- Priority: P1

### Agency FAQ calls output billable work

- Location: `apps/sokosumi/templates/useCases.js:215`
- Current text: “the output is billable work product”
- Problem: Whether work is billable is a contractual decision for the agency and client.
- Fix: “Review each output before using it in client work.”
- Priority: P1

### Retail page promises a Monday 8:00 report

- Location: `apps/sokosumi/templates/useCases.js:235`
- Current text: “Monday report at 8”
- Problem: The exact arrival time is not supported and duplicates the scheduled-task overclaim.
- Fix: “Schedule a weekly report.”
- Priority: P1

### Retail page invents a buyer’s current pain

- Location: `apps/sokosumi/templates/useCases.js:228`
- Current text: “The season starts before the plan is ready”, “Seasonal planning starts late, every single year”, “Monday morning disappears into reporting”
- Problem: The page presents a stereotype as customer evidence.
- Fix: Delete the “Today” column and keep only the proposed tasks.
- Priority: P2

### Financial-services page implies compliance approval

- Location: `apps/sokosumi/templates/useCases.js:260`
- Current text: “campaign work that survives a compliance review”
- Problem: The product cannot promise review outcomes.
- Fix: “campaign drafts with source references for your compliance review.”
- Priority: P1

### Financial-services page promises no analyst time

- Location: `apps/sokosumi/templates/useCases.js:291`
- Current text: “no analyst hours consumed”
- Problem: Briefing, review, and decisions still require analyst time.
- Fix: Delete.
- Priority: P1

### Media page invents a speed comparison

- Location: `apps/sokosumi/templates/useCases.js:311`
- Current text: “in a day, not a fortnight”
- Problem: Neither timeframe is sourced.
- Fix: “Run the research and content tasks separately.”
- Priority: P1

### Media page promises one launch becomes a month

- Location: `apps/sokosumi/templates/useCases.js:302`
- Current text: “one launch becomes a month of coverage”
- Problem: The amount is a made-up outcome, not a task definition.
- Fix: “Create launch drafts for selected channels.”
- Priority: P1

### SaaS page invents a two-person team

- Location: `apps/sokosumi/templates/useCases.js:338`
- Current text: “A two-person marketing team with ten jobs — give the recurring ones to coworkers and keep the judgment calls.”
- Problem: The scenario pretends to be customer insight without a source.
- Fix: Delete the “Today” scenario.
- Priority: P2

### SaaS page claims a fifteen-minute decision

- Location: `apps/sokosumi/templates/useCases.js:350`
- Current text: “fifteen minutes to decision”
- Problem: The exact time is invented.
- Fix: Delete.
- Priority: P1

### Travel page makes an affordability claim

- Location: `apps/sokosumi/templates/useCases.js:375`
- Current text: “a small team can actually afford”
- Problem: “Actually afford” has no price comparison or buyer definition.
- Fix: “with a credit price shown before each task.”
- Priority: P2

### Travel FAQ invents a common starting pattern

- Location: `apps/sokosumi/templates/useCases.js:404`
- Current text: “most start…”
- Problem: No usage evidence supports the claim.
- Fix: Delete the sentence.
- Priority: P1

## Compare

### Public pages announce unfinished copy

- Location: `apps/sokosumi/templates/compare.js:27`
- Current text: “Placeholder copy — final comparison in progress.”
- Problem: A public comparison cannot build trust while admitting its evidence is unfinished.
- Fix: Delete the three placeholder routes until reviewed comparisons exist.
- Priority: P1

### Placeholder metrics are published as facts

- Location: `apps/sokosumi/templates/compare.js:37`
- Current text: “0 → 1 task”, “14+”, and “EU-hosted”
- Problem: The numbers and blanket hosting claim are not tied to verified comparison data.
- Fix: Delete the stats block.
- Priority: P1

### Competitor cells are knowingly unverified

- Location: `apps/sokosumi/templates/compare.js:46`
- Current text: “Competitor cells below are placeholders until evidence links are attached.”
- Problem: The page publishes claims that its own source says are unverified.
- Fix: Delete the table and the route.
- Priority: P1

### Placeholder cards still appear on the comparison index

- Location: `apps/sokosumi/templates/compare.js:104`
- Current text: “Sokosumi vs hiring an agency”, “Sokosumi vs ChatGPT alone”, and “Sokosumi vs a general AI agent”
- Problem: The index directs visitors to unfinished sales pages.
- Fix: Delete all entries from `PLACEHOLDERS`; render only published CMS comparisons.
- Priority: P1

### Index claims honesty without showing evidence

- Location: `apps/sokosumi/templates/compare.js:147`
- Current text: “Honest, side by side looks…”
- Problem: Calling the comparisons honest is self-awarded trust language, and three linked pages say their cells are placeholders.
- Fix: “Compare Sokosumi with other ways to get marketing work done.”
- Priority: P1

### Freelancer description makes three unsupported advantages

- Location: `CMS comparisons/vs-hiring-a-freelancer/description`
- Current text: “faster, cheaper, and on schedule.”
- Problem: No source supports any of the three comparative claims.
- Fix: “Compare task pricing, turnaround, review, and working style.”
- Priority: P1

### Turnaround comparison has no evidence

- Location: `CMS comparisons/vs-hiring-a-freelancer/layout[1].rows[0]`
- Current text: “Minutes to hours” versus “Days to weeks”
- Problem: The ranges are unsourced and ignore task type, freelancer capacity, and coworker failure or review time.
- Fix: Delete the row.
- Priority: P1

### Availability comparison is not comparable

- Location: `CMS comparisons/vs-hiring-a-freelancer/layout[1].rows[2]`
- Current text: “yes” versus “Depends on capacity”
- Problem: One cell is a yes/no claim and the other is a condition, while Sokosumi also has capacity and failure limits.
- Fix: Delete the row.
- Priority: P1

### Retainer claim is false as a general rule

- Location: `CMS comparisons/vs-hiring-a-freelancer/layout[1].rows[3]`
- Current text: “Needs a retainer”
- Problem: Freelancers can accept recurring work without a retainer.
- Fix: “Terms agreed with the freelancer.”
- Priority: P1

### Brand immersion claim anthropomorphizes stored context

- Location: `CMS comparisons/vs-hiring-a-freelancer/layout[1].rows[4]`
- Current text: “Growing with every task”
- Problem: The page does not establish durable learning from every task.
- Fix: “Depends on the context supplied with each task.”
- Priority: P1

### Verdict reduces human and AI work to a false split

- Location: `CMS comparisons/vs-hiring-a-freelancer/layout[2].contentHtml`
- Current text: “Use a freelancer when the work needs a human eye… Use a coworker when the work has a clear shape and a deadline.”
- Problem: Deadlines and defined work also suit freelancers, while AI output still needs human review.
- Fix: “Use a coworker for a listed task when its sample and credit price fit the brief. Hire a freelancer when you need accountable human judgment or an open-ended engagement.”
- Priority: P2

## Pricing

### Free-plan tagline is ungrammatical

- Location: `apps/sokosumi/templates/pricing.js:68`
- Current text: “Getting started to work with Marketing Agents.”
- Problem: The construction is awkward, and “Marketing Agents” breaks sentence case.
- Fix: “Try marketplace tasks with 250 credits per seat.”
- Priority: P2

### Starter plan uses an odd company label

- Location: `apps/sokosumi/templates/pricing.js:74`
- Current text: “For freelancers and micro companies.”
- Problem: “Micro companies” is not natural customer language.
- Fix: “For freelancers and very small teams.”
- Priority: P2

### Standard plan promises the full catalog

- Location: `apps/sokosumi/templates/pricing.js:81`
- Current text: “Full set of marketing agents for small companies.”
- Problem: Plans buy credits, not a different “full set,” and the line switches from coworkers to agents.
- Fix: “5,000 credits per seat for small teams.”
- Priority: P1

### Pro plan does not say what increases

- Location: `apps/sokosumi/templates/pricing.js:89`
- Current text: “Get more access to our Marketing Agents and Services.”
- Problem: The plan card already shows that the difference is credits; “more access” suggests gated catalog inventory.
- Fix: “15,000 credits per seat.”
- Priority: P1

### Enterprise plan uses generic customization filler

- Location: `apps/sokosumi/templates/pricing.js:98`
- Current text: “Custom plan for organizations with tailored seats, credits, and support.”
- Problem: The sentence names three variables without explaining the buying condition.
- Fix: “Contact sales for seat, credit, and support terms.”
- Priority: P2

### “Most popular” has no source

- Location: `apps/sokosumi/templates/pricing.js:182`
- Current text: “Most popular”
- Problem: No plan-selection data supports the badge.
- Fix: Delete the badge.
- Priority: P1

### Pricing introduction restates the cards

- Location: `apps/sokosumi/templates/pricing.js:230`
- Current text: “Every plan includes credits per seat. Start free, move up when your team runs more work…”
- Problem: The paragraph repeats the free plan, credit model, and upgrade path shown directly below it.
- Fix: Delete.
- Priority: P2

### Testimonial heading implies paid adoption

- Location: `apps/sokosumi/templates/pricing.js:242`
- Current text: “Teams already on a plan”
- Problem: The CMS quotes do not identify the speakers as current plan customers.
- Fix: “What users say about the work.”
- Priority: P1

### Free-plan CTA promises every agent is usable

- Location: `apps/sokosumi/templates/pricing.js:245`
- Current text: “every agent on the marketplace to try them on.”
- Problem: Listings have different credit costs and readiness, so the plan does not prove every agent can be tried with 250 credits.
- Fix: “250 credits per seat. No credit card required.”
- Priority: P1

## Contact/sales

### Contact page promises a one-day reply

- Location: `apps/sokosumi/templates/contact.js:64`
- Current text: “we will get back within a day.”
- Problem: No published support or sales commitment backs the response time.
- Fix: “Tell us what you have in mind.”
- Priority: P1

### Support guidance has a run-on instruction

- Location: `apps/sokosumi/templates/contact.js:71`
- Current text: “Include the task link if you have one, it speeds things up.”
- Problem: The comma joins two sentences, and the speed claim is unnecessary.
- Fix: “Include the task link if you have one.”
- Priority: P3

### App-help claim is vague

- Location: `apps/sokosumi/templates/contact.js:75`
- Current text: “most answers are one click away there.”
- Problem: It does not name the help area and no evidence supports “most.”
- Fix: Delete the clause.
- Priority: P2

### Public-content claim is false

- Location: `apps/sokosumi/templates/contact.js:83`
- Current text: “Every coworker, task, and sample output on the marketplace is public. Nothing here is behind a form.”
- Problem: Some coworkers have no tasks or samples, and the app itself sits behind signup.
- Fix: “You can browse public coworker profiles and task pages before signing up.”
- Priority: P1

### Sales page promises exact handling

- Location: `apps/sokosumi/templates/sales.js:98`
- Current text: “we will show you exactly how Sokosumi handles it.”
- Problem: “Exactly” is an empty intensifier and the outcome depends on the use case.
- Fix: “We will review the use case with you.”
- Priority: P2

### One-day sales promise appears three times

- Location: `apps/sokosumi/templates/sales.js:62`, `apps/sokosumi/templates/sales.js:71`, `apps/sokosumi/templates/sales.js:116`
- Current text: “within one working day”
- Problem: Repetition turns an unsupported response target into a prominent service commitment.
- Fix: “We will reply by email.”
- Priority: P1

### Sales confirmation is vague

- Location: `apps/sokosumi/templates/sales.js:70`
- Current text: “Thanks, that is on its way.”
- Problem: “That” does not identify what was sent or where it went.
- Fix: “Request received.”
- Priority: P2

### Confirmation adds three unrelated cards

- Location: `apps/sokosumi/templates/sales.js:79`
- Current text: “Meet the coworkers”, “Browse template tasks”, “See it by use case”
- Problem: The cards distract from confirming the request and repeat the main navigation.
- Fix: Delete the card grid.
- Priority: P2

### Support page claims pricing covers failed tasks

- Location: `apps/sokosumi/templates/support.js:43`
- Current text: “what happens when a task does not complete.”
- Problem: The linked pricing page does not explain incomplete-task handling.
- Fix: “What each plan includes and how credits per seat work.”
- Priority: P1

### Support page invents a one-day service level

- Location: `apps/sokosumi/templates/support.js:96`
- Current text: “We reply within one working day.”
- Problem: The source comment says the page does not invent an SLA, but this sentence does exactly that.
- Fix: “Goes straight to {email}.”
- Priority: P1

### Self-service heading blames the customer

- Location: `apps/sokosumi/templates/support.js:171`
- Current text: “Answer it yourself, faster”
- Problem: The heading is dismissive when the visitor is already reporting a problem.
- Fix: “Related help.”
- Priority: P2

### Self-service subhead makes an unsupported “most” claim

- Location: `apps/sokosumi/templates/support.js:172`
- Current text: “Most of what people write in about is already written down.”
- Problem: No support data backs the statement, and it tells users their request is probably unnecessary.
- Fix: Delete.
- Priority: P2

### Agent-listing documentation points to a legacy destination

- Location: `apps/sokosumi/templates/listAgent.js:25`
- Current text: `https://docs.masumi.network/`
- Problem: The rest of the repository points developers to the current Masumi developer hub.
- Fix: `https://www.masumi.network/dev/sokosumi/documentation`
- Priority: P1

### Agent-listing introduction is sales filler

- Location: `apps/sokosumi/templates/listAgent.js:275`
- Current text: “Welcome! You’re one step away from getting your Agent featured on Sokosumi…”
- Problem: The exclamations and “one step away” understate a review process.
- Fix: “Submit an agent for marketplace review.”
- Priority: P2

### Agent-listing CTA is an awkward question

- Location: `apps/sokosumi/templates/listAgent.js:280`
- Current text: “Not built it yet?”
- Problem: The question is not idiomatic English.
- Fix: “Need to build the agent first?”
- Priority: P3

## Blog

### Category labels are forced to all caps

- Location: `apps/sokosumi/templates/blog.js:31`
- Current text: `category.toUpperCase()`
- Problem: The rendering conflicts with the site’s sentence-case rule.
- Fix: Delete `.toUpperCase()` from the category-label render.
- Priority: P3

### Blog index summary is a three-part inventory

- Location: `apps/sokosumi/templates/blog.js:54`
- Current text: “how the marketplace works, what teams brief, and what shipped recently.”
- Problem: The list reads like a generic content template and adds little to “articles and announcements.”
- Fix: “Product news and practical notes from the Sokosumi team.”
- Priority: P2

### Post calls AI listings real teammates

- Location: `CMS posts/introducing-sokosumi/contentHtml`
- Current text: “they collaborate with each other the way a real team does.”
- Problem: The comparison overstates coordination and blurs the human review boundary.
- Fix: “Some coworkers can assign parts of a task to specialist agents.”
- Priority: P1

### Post claims every coworker has a track record

- Location: `CMS posts/introducing-sokosumi/contentHtml`
- Current text: “Each coworker has a name, a role, and a track record.”
- Problem: Several profiles have no runs or ratings, so the blanket claim is not supported.
- Fix: “Each coworker has a name, a role, and a public profile.”
- Priority: P1

### Post omits NMKR from the builder credit

- Location: `CMS posts/introducing-sokosumi/contentHtml`
- Current text: “Sokosumi is built by Serviceplan Group”
- Problem: The project facts state that Serviceplan Group built Sokosumi with NMKR.
- Fix: “Serviceplan Group built Sokosumi with NMKR.”
- Priority: P1

### “Leading agency group” claim has no source

- Location: `CMS posts/introducing-sokosumi/contentHtml`
- Current text: “one of the world’s leading agency groups.”
- Problem: The ranking is not defined or sourced.
- Fix: Delete the clause.
- Priority: P1

### Post promises agency-grade output by association

- Location: `CMS posts/introducing-sokosumi/contentHtml`
- Current text: “the deliverables read like agency work, not model output.”
- Problem: The assertion substitutes the builder’s identity for evidence about output quality.
- Fix: “Open the sample on a task page before you run it.”
- Priority: P1

### Monthly growth claim has no catalog history

- Location: `CMS posts/introducing-sokosumi/contentHtml`
- Current text: “The roster grows every month”
- Problem: No month-by-month record in the repository or CMS supports the cadence.
- Fix: “Vendors can publish agents to the marketplace.”
- Priority: P1

### Two-minute briefing claim is unsupported

- Location: `CMS posts/introducing-sokosumi/contentHtml`
- Current text: “the first briefing takes about two minutes to write.”
- Problem: The exact time is not sourced and depends on the task.
- Fix: “Start from a template briefing or write your own.”
- Priority: P1

### Post ends with corporate enthusiasm

- Location: `CMS posts/introducing-sokosumi/contentHtml`
- Current text: “We are excited to see what you hand over first.”
- Problem: The sentence adds no information after the signup instruction.
- Fix: Delete.
- Priority: P2

## Guides

### Guide index uses “get the most out of” filler

- Location: `apps/sokosumi/templates/guides.js:47`
- Current text: “How to get the most out of your AI coworkers…”
- Problem: The phrase avoids naming the practical outcome.
- Fix: “How to brief coworkers, review tasks, and use recurring workflows.”
- Priority: P2

### Guide turns advice into an arbitrary rule of three

- Location: `CMS guides/writing-your-first-briefing/contentHtml`
- Current text: “Three parts make the difference between an okay result and a great one.”
- Problem: The number and quality jump are unsupported, and the structure reads like a generated formula.
- Fix: “Include the context, deliverable, and constraints the task needs.”
- Priority: P2

### Guide calls the coworker a capable colleague

- Location: `CMS guides/writing-your-first-briefing/contentHtml`
- Current text: “you are telling a capable colleague what you need.”
- Problem: The comparison overstates competence and hides the need to review AI output.
- Fix: “you are describing the task in plain language.”
- Priority: P1

### Guide contains broken closing quotation marks

- Location: `CMS guides/writing-your-first-briefing/contentHtml`
- Current text: `as a PDF“ beats “tell me about our competitors“`
- Problem: Both quotations close with opening German-style marks in the English article.
- Fix: `as a PDF” is clearer than “tell me about our competitors.”`
- Priority: P3

### Guide claims briefing is the whole skill

- Location: `CMS guides/writing-your-first-briefing/contentHtml`
- Current text: “That is the whole skill.”
- Problem: The summary dismisses iteration, review, and task-specific expertise.
- Fix: Delete.
- Priority: P2

### Guide CTA makes an empty speed claim

- Location: `apps/sokosumi/templates/guides.js:72`
- Current text: “The fastest way through any guide is to run the thing it describes.”
- Problem: It is not true for every guide and says “the thing” instead of naming an action.
- Fix: “Use a guide with the task it describes.”
- Priority: P2

## Releases

### Release tags are forced to all caps

- Location: `apps/sokosumi/templates/releases.js:25`
- Current text: `String(tag).toUpperCase()`
- Problem: “NEW” and “IMPROVED” break the sentence-case interface.
- Fix: “New” and “Improved”
- Priority: P3

### Archive heading overstates one release

- Location: `apps/sokosumi/templates/releases.js:70`
- Current text: “Every release in order”
- Problem: The CMS contains one published Sokosumi release, so the heading presents a history that does not exist yet.
- Fix: “Release notes.”
- Priority: P2

### Release summary is a stock three-item list

- Location: `apps/sokosumi/templates/releases.js:77`
- Current text: “New capabilities, improvements, and fixes, straight from the team.”
- Problem: The line merely restates the content type.
- Fix: Delete.
- Priority: P2

### Account-delivery claim is nonsensical

- Location: `apps/sokosumi/templates/releases.js:86`
- Current text: “Every release lands in your account”
- Problem: Product changes do not “land” as account objects, and rollout conditions are not stated.
- Fix: “No installation required.”
- Priority: P2

### Release CTA makes an absolute rollout claim

- Location: `apps/sokosumi/templates/releases.js:159`
- Current text: “Every release is already live in the product.”
- Problem: The claim leaves no room for staged rollout, account eligibility, or a release note that precedes availability.
- Fix: “Open the product to check availability.”
- Priority: P1

### Chat release promises unbounded context reading

- Location: `CMS releases/chat-with-your-coworkers/description`
- Current text: “it reads the recent context and replies”
- Problem: “Recent context” does not state how much of a thread is available or when the coworker receives it.
- Fix: “Mention a coworker in a channel to send it the thread context available to the task.”
- Priority: P1

## Coworker profiles

### Agent-versus-coworker split is presented as settled fact

- Location: `apps/sokosumi/templates/coworkers.js:61`
- Current text: “An agent does a task and stops; a coworker owns a role and keeps going week after week.”
- Problem: The catalog data does not define persistence or weekly work as the dividing line between its two record types.
- Fix: “Sokosumi lists named coworkers and specialist agents. Check each profile for its available tasks.”
- Priority: P1

### Coworker is called a colleague

- Location: `apps/sokosumi/templates/coworkers.js:64`
- Current text: “A colleague you brief”
- Problem: The label obscures that this is software supplied by a vendor.
- Fix: “A named AI service you brief.”
- Priority: P1

### Example assigns an open-ended business result

- Location: `apps/sokosumi/templates/coworkers.js:74`
- Current text: “Grow our organic traffic.”
- Problem: The example treats an outcome as a bounded task and suggests the coworker owns the result.
- Fix: “Audit our organic-search gaps and return a prioritized report.”
- Priority: P2

### Roster says specialists can be hired today

- Location: `apps/sokosumi/templates/coworkers.js:137`
- Current text: “specialists you can hire today”
- Problem: Some records have no task or direct starting route, so immediate availability is not uniform.
- Fix: “specialists listed on the marketplace.”
- Priority: P1

### Featured status is not explained

- Location: `apps/sokosumi/templates/coworkers.js:172`
- Current text: “Featured”
- Problem: The page does not say whether placement is editorial, paid, or based on activity.
- Fix: Delete the label unless the selection rule is published.
- Priority: P1

### Specialist-agent heading breaks sentence case

- Location: `apps/sokosumi/templates/coworkers.js:182`
- Current text: “Specialist Agents”
- Problem: The capitalization conflicts with the site’s interface rules.
- Fix: “Specialist agents.”
- Priority: P3

### Hermes profile promises persistent memory and integration access

- Location: `CMS coworkers/hermes/seoDescription`
- Current text: “dedicated infrastructure, persistent memory across sessions, direct integration access.”
- Problem: The profile gives no limits, supported integrations, or data handling conditions for these broad claims.
- Fix: “Hermes is a standalone agent for individual users. Check the listing for current integrations and hosting details.”
- Priority: P1

### Dite profile publishes an unsupported library count

- Location: `CMS coworkers/dite/seoDescription`
- Current text: “a library of 150+ design systems.”
- Problem: No catalog field or linked source verifies the count.
- Fix: “Designs landing pages, pitch decks, and brand graphics from a supplied brief.”
- Priority: P1

### Igni guarantees working output

- Location: `CMS coworkers/igni/seoDescription`
- Current text: “hands back something that actually works.”
- Problem: “Actually works” promises successful execution and testing for every run.
- Fix: “Builds and tests a first version in an isolated workspace.”
- Priority: P1

### Extended Audience Profiles uses banned filler

- Location: `CMS coworkers/extended-audience-profiles/seoDescription`
- Current text: “Crafting strategic audience insights…to empower brands with comprehensive consumer understanding”
- Problem: The sentence uses banned sales filler and never names the output.
- Fix: “Builds audience profiles from multiple research sources.”
- Priority: P2

### Ad-Campaign Generator uses generic persuasion language

- Location: `CMS coworkers/ad-campaign-generator/seoDescription`
- Current text: “Crafting compelling visual ads that capture brand essence and drive engagement…”
- Problem: The description promises subjective quality and performance instead of stating what the task returns.
- Fix: “Creates visual ad variants for the channels named in the brief.”
- Priority: P2

### AttentionInsight promises predicted behavior and maximum engagement

- Location: `CMS coworkers/attentioninsight-analysis-agent/seoDescription`
- Current text: “predicts eye movement and optimizes design for maximum engagement and clarity.”
- Problem: The claim overstates an attention model and guarantees an optimization result.
- Fix: “Produces a predicted visual-attention map for an uploaded design.”
- Priority: P1

### Meme Creator promises virality in 110 languages

- Location: `CMS coworkers/meme-creator-agent/seoDescription`
- Current text: “Effortlessly create viral memes in 110+ languages”
- Problem: Ease and virality are unsupported, and the language count has no source.
- Fix: “Creates meme variants from a supplied topic and language.”
- Priority: P1

### Crowd tool claims statistical validation

- Location: `CMS coworkers/let-the-crowd-decide/seoDescription`
- Current text: “statistically-validated demographic rankings and comparisons.”
- Problem: The profile does not name the sample, method, uncertainty, or validation source.
- Fix: “Ranks supplied options using simulated demographic personas.”
- Priority: P1

### Emotional Sensing stacks AI filler

- Location: `CMS coworkers/emotional-sensing/seoDescription`
- Current text: “advanced AI, enabling dynamic conversational insights and real-time response optimization.”
- Problem: The description strings together broad capability words without a defined input or output.
- Fix: “Labels emotions and intent in supplied text.”
- Priority: P2

### Facebook analysis ends with an empty intensifier

- Location: `CMS coworkers/facebook-page-analysis/seoDescription`
- Current text: “Analyzes Facebook page content strategy, engagement metrics, and posting patterns comprehensively.”
- Problem: “Comprehensively” adds no testable scope.
- Fix: “Analyzes a Facebook page’s posts, engagement metrics, and posting patterns.”
- Priority: P2

### Website clustering calls itself intelligent

- Location: `CMS coworkers/website-content-clustering/seoDescription`
- Current text: “Intelligent web content mapping agent…”
- Problem: The adjective is self-praise and the rest of the sentence is harder to parse than the task.
- Fix: “Groups selected website pages by topic and search criteria.”
- Priority: P2

### Advanced Web Research repeats the product category

- Location: `CMS coworkers/advanced-web-research/seoDescription`
- Current text: “Comprehensive web research agent that explores, synthesizes, and reports findings…”
- Problem: The description uses banned filler and a three-verb list instead of naming the deliverable.
- Fix: “Researches a question on the web and returns a sourced report.”
- Priority: P2

### Company Researcher is all modifiers

- Location: `CMS coworkers/company-researcher/seoDescription`
- Current text: “Comprehensive AI-powered company research agent delivering detailed insights, market analysis, and strategic business intelligence.”
- Problem: The sentence does not state sources, format, or a bounded research job.
- Fix: “Researches a company and returns a sourced company and market report.”
- Priority: P2

### GWI Spark promises deep understanding and privacy safety

- Location: `CMS coworkers/gwi-spark/seoDescription`
- Current text: “deliver deep, privacy-safe audience understanding”
- Problem: “Deep” is empty, and “privacy-safe” needs a defined data-handling basis.
- Fix: “Returns audience findings from GWI survey data.”
- Priority: P1

### Deepfake Detector claims high precision without evidence

- Location: `CMS coworkers/deepfake-detector-knight/seoDescription`
- Current text: “with high precision and accuracy”
- Problem: No benchmark, dataset, or error rate supports the performance claim.
- Fix: “Flags uploaded images and videos that may be manipulated.”
- Priority: P1

### Product Reality Check claims to reveal truth

- Location: `CMS coworkers/product-reality-check-bansumi/seoDescription`
- Current text: “Unveils truth behind Amazon product claims”
- Problem: Review analysis cannot determine the truth of every product claim.
- Fix: “Compares Amazon product claims with themes in customer reviews.”
- Priority: P1

## German site

### Five product pages open with English sales copy

- Location: `apps/sokosumi/templates/pagesCms.js:83`
- Current text: “What is an AI coworker?”, “Brief it like a colleague, not a prompt”, “See what your AI coworkers are doing”, “The job ends with a file you can send”, “AI coworkers, inside your team chat”
- Problem: Indexable German pages begin in English and switch language mid-page.
- Fix: Delete the five German routes from indexing until every `SURFACES` string is localized.
- Priority: P1

### Scheduled-task page is almost entirely English

- Location: `apps/sokosumi/templates/pagesCms.js:194`
- Current text: “Set it once. The report arrives every Monday.” and the sections that follow.
- Problem: The German route publishes a full English product page inside German navigation.
- Fix: Delete the German scheduled-task route from indexing until every field, FAQ, card, and demo label is localized.
- Priority: P1

### Six industry pages publish English page content

- Location: `apps/sokosumi/templates/useCases.js:176`
- Current text: “AI coworkers for agencies”, “AI coworkers for e-commerce & retail”, “AI coworkers for financial services”, “AI coworkers for media & publishing”, “AI coworkers for SaaS & technology”, “AI coworkers for travel & hospitality”
- Problem: All six indexable `/de/use-cases/industries/*` pages have English headings, pain scenarios, workflows, and FAQs.
- Fix: Delete the German industry routes from indexing until every `INDUSTRY_CONTENT` string is localized.
- Priority: P1

### Interactive demo remains English on German pages

- Location: `apps/sokosumi/templates/productDemo.js:15`, `apps/sokosumi/assets/product-demo.js:183`
- Current text: “New Task”, “Ready-To-Run Tasks”, “In Progress”, “Input Required”, dialog labels, menus, toasts, and chat messages.
- Problem: The main product demonstration on `/de/product` bypasses `t()` for most visible and interactive text.
- Fix: Delete `/de/product` from indexing until every demo data string and client-side UI string is localized.
- Priority: P1

### Mobile menu accessible label switches back to English

- Location: `apps/sokosumi/assets/nav.js:230`
- Current text: “Close menu” and “Open menu”
- Problem: Client-side state changes overwrite the German label emitted by the server.
- Fix: “Menü schließen” and “Menü öffnen”
- Priority: P1

### Agent-listing legal classification is left in English

- Location: `apps/sokosumi/lib/i18n.js:1002`
- Current text: “Classify your AI Agent according to the EU AI Act”, risk categories, and confirmation statements.
- Problem: A German vendor is asked to make a legal declaration in English while the surrounding form is German.
- Fix: Delete the German form route until the full classification and confirmation text has an approved German version.
- Priority: P1

### German enterprise copy contains a banned modifier

- Location: `apps/sokosumi/lib/i18n.js:549`
- Current text: “maßgeschneiderten Seats, Credits und Support.”
- Problem: The modifier is banned filler and does not define the terms.
- Fix: “individuell vereinbarten Seats, Credits und Supportleistungen.”
- Priority: P2

### German product metadata claims guarantees

- Location: `apps/sokosumi/lib/i18n.js:788`
- Current text: “die Oberflächen, Workflows und Garantien hinter Sokosumi.”
- Problem: “Garantien” is a stronger claim than the page substantiates.
- Fix: “die Ansichten und Workflows in Sokosumi.”
- Priority: P1

### German homepage keeps awkward automation copy

- Location: `apps/sokosumi/lib/i18n.js:1142`
- Current text: “Automatisieren Sie Ihr Marketing mit AI Agents, die rund um die Uhr arbeiten”
- Problem: The line repeats the unsupported 24-hour promise and switches from coworkers to agents.
- Fix: “Briefen Sie AI Coworker und erhalten Sie fertige Marketingdateien.”
- Priority: P1

### German homepage says vendors write coworkers

- Location: `apps/sokosumi/lib/i18n.js:1242`
- Current text: “Ihre Strategen schreiben die Serviceplan-Coworker… andere Anbieter schreiben ihre eigenen.”
- Problem: “Coworker schreiben” is not idiomatic German and obscures who develops and operates the service.
- Fix: “Die Serviceplan Group entwickelt und betreibt ihre Coworker; andere Anbieter verantworten ihre eigenen Listings.”
- Priority: P2

### German manual offer is a literal translation

- Location: `CMS offers/logo-concepts/description` (German)
- Current text: “bereit zum Reagieren und Verfeinern.”
- Problem: The phrase is a literal English construction, not natural German.
- Fix: “Mehrere klar unterscheidbare Logoansätze als Grundlage für Ihr Feedback.”
- Priority: P2

### German Pheme profile is grammatically broken

- Location: `CMS coworkers/pheme-beta/longBioHtml` (German)
- Current text: “plant die ein, die X und LinkedIn-Mitgliedsprofile annehmen”
- Problem: The relative clause has no clear noun and makes the scheduling capability hard to understand.
- Fix: “Pheme entwirft Social Posts und kann sie für verbundene X- und LinkedIn-Profile einplanen.”
- Priority: P2

### German agent descriptions retain generated filler

- Location: `CMS coworkers/extended-audience-profiles/seoDescription`, `advanced-web-research/seoDescription`, `company-researcher/seoDescription` (German)
- Current text: “umfassendes Verständnis”, “Umfassender Web-Research-Agent”, “Umfassender KI-gestützter Agent”
- Problem: The translations preserve vague catalog filler instead of naming each output.
- Fix: Delete the three German descriptions until direct German task descriptions replace them.
- Priority: P2

### German pricing page displays “Free” as the price

- Location: `apps/sokosumi/lib/i18n.js:847`
- Current text: `Free: "Free"`
- Problem: The plan price remains English even though the plan label elsewhere is translated as “Kostenlos.”
- Fix: `Free: "Kostenlos"`
- Priority: P3

## CMS content

### Duplicate manual offer slug

- Location: `CMS offers/id:16/slug` and `CMS offers/id:29/slug`
- Current text: “data-deep-dive” on offer IDs 16 and 29, with different descriptions.
- Problem: Two live manual offers compete for the same route identity and present different promises.
- Fix: Delete one record; keep a single description and a single `data-deep-dive` slug.
- Priority: P1

### Manual offers use the same dash-led formula

- Location: `CMS offers/logo-concepts/description`, `naming-sprint/description`, `market-sizing/description`, `financial-model/description`, `competitor-deep-dive/description`, `api-design/description`, `code-review/description`, `ui-concepts/description`, `design-review/description`
- Current text: “A set of distinct logo directions from a short brief — ready to react to and refine”; “A shortlist of names with rationale and quick checks — from a one-line prompt.”
- Problem: The repeated cadence makes unrelated tasks sound generated from one template.
- Fix: Delete the text after the first clause in each listed description.
- Priority: P2

### Logo task does not state a deliverable

- Location: `CMS offers/logo-concepts/description`
- Current text: “A set of distinct logo directions from a short brief — ready to react to and refine.”
- Problem: “Directions” and “ready to react to” do not say how many concepts or what file returns.
- Fix: “Logo concept directions based on your brief.”
- Priority: P2

### Competitor task promises to find weakness

- Location: `CMS offers/competitor-deep-dive/description`
- Current text: “where they’re weak.”
- Problem: The wording presupposes a weakness instead of asking the research to test for one.
- Fix: “A review of one competitor’s product, pricing, and messaging.”
- Priority: P1

### SEO task is generic prioritization copy

- Location: `CMS offers/seo-audit/description`
- Current text: “fixes and opportunities ranked by effort and impact.”
- Problem: It does not name what the audit checks or what form the output takes.
- Fix: “A report on crawl, page, and content issues found on the supplied site.”
- Priority: P2

### Landing-page task says nothing specific

- Location: `CMS offers/landing-page-copy/description`
- Current text: “Hero, sections, and CTAs that say what you do and why it matters.”
- Problem: The sentence lists standard page parts without stating the input, length, or file.
- Fix: “A landing-page copy draft based on your offer, audience, and proof.”
- Priority: P2

### Funnel task uses a vague superlative

- Location: `CMS offers/funnel-analysis/description`
- Current text: “the highest-leverage fixes.”
- Problem: The phrase claims prioritization without saying which data supports it.
- Fix: “Drop-off findings and proposed fixes based on the supplied funnel data.”
- Priority: P2

### Arne Tiddens quote is hype, not evidence

- Location: `CMS testimonials/Arne Tiddens/quote`
- Current text: “brutally expanding our capabilities for a super fair price tag.”
- Problem: The quote is vague, aggressive, and gives no task or outcome a visitor can assess.
- Fix: Delete.
- Priority: P2

### Michael Trautmann quote attacks a straw man

- Location: `CMS testimonials/Michael Trautmann/quote`
- Current text: “Instead of complaining that ‘advertising is dead’… they’re building real tools that make us better, faster, smarter.”
- Problem: The quote spends more space dismissing unnamed critics than describing Sokosumi.
- Fix: Delete.
- Priority: P2

### Stevan Paul quote uses an unsupported accolade and exclamation

- Location: `CMS testimonials/Stevan Paul/quote`
- Current text: “‘Germany’s most decorated food journalist’… Fantastic!”
- Problem: The accolade has no source on the page, and the ending adds enthusiasm rather than product detail.
- Fix: Delete the quote unless the speaker supplies approved shortened text about the digital-reach finding and roadmap.
- Priority: P1

### Florian quote calls Sokosumi the best tool

- Location: `CMS testimonials/Florian von Keyserlingk/quote`
- Current text: “this is the best tool to develop an actionable and effective online strategy.”
- Problem: “Best” is an unsupported comparison and “actionable and effective” does not name the result.
- Fix: Delete.
- Priority: P1

### Michael Wolff quote is grammatically broken

- Location: `CMS testimonials/Michael Wolff/quote`
- Current text: “it’s just mind blowing how fast to go forward… not available on public makes a big trustful difference!”
- Problem: The errors make the quote hard to understand, and the premium-data claim is not explained.
- Fix: Delete until the speaker approves corrected wording that names the task and result.
- Priority: P1

### Product-output CMS hardcodes changing catalog totals

- Location: `CMS pages/product/outputs/layout[1]`, `layout[2].text`
- Current text: “55 template tasks”, “21”, “13”, “10”, “11”, and “31 of the template tasks”
- Problem: The values are copied into prose instead of calculated from the catalog, so they will drift as offers change.
- Fix: Delete both count-led blocks or generate the values from the same offer query on every render.
- Priority: P1

### Product-output FAQ gives one hosting region for several models

- Location: `CMS pages/product/outputs/layout[4].items[2].answer`
- Current text: “Claude, Mistral, Grok and OpenAI Codex are all in use — along with its hosting region, currently EU · Azure · Frankfurt.”
- Problem: The sentence attaches one hosting region to models and vendors that use different infrastructure.
- Fix: “Models and hosting vary by listing. Check the coworker profile for the fields supplied by its vendor.”
- Priority: P1

### CMS product page uses six equal claims

- Location: `CMS pages/product/ai-coworkers/layout[1]`
- Current text: “A real role”, “Finished files”, “A public profile”, “Team play”, “Pre-built tasks”, “Pay per task”
- Problem: Six parallel cards flatten important distinctions and repeat claims already made in the hero and FAQ.
- Fix: Delete the cards that make false blanket claims; keep a short definition plus links to profiles and task samples.
- Priority: P2

## Product demo copy

### Demo presents a replica as the real product

- Location: `apps/sokosumi/templates/productDemo.js:1`
- Current text: “it reads as the real product, smaller — not a sketch of it.”
- Problem: The demo contains generated people, invented projects, fabricated results, and controls that simulate success rather than perform product actions.
- Fix: “Interactive example. Names, messages, tasks, results, and metrics are fictional.”
- Priority: P1

### Real person and email appear inside fictional activity

- Location: `apps/sokosumi/templates/productDemo.js:53`, `apps/sokosumi/assets/product-demo.js:653`
- Current text: “Patrick Tobler”, “patrick@nmkr.io”
- Problem: A real identity is mixed with generated teammates and fabricated customer activity, making the demo look like leaked workspace data.
- Fix: “Demo user” and “demo@example.com”
- Priority: P1

### Demo displays an implausible free-plan balance

- Location: `apps/sokosumi/assets/product-demo.js:656`
- Current text: “78,494 credits” beside “Free”
- Problem: The balance conflicts with the published free plan’s 250 credits per seat and is not marked as sample data.
- Fix: “Demo workspace · 250 demo credits”
- Priority: P1

### Demo invents sixteen priced task runs

- Location: `apps/sokosumi/templates/productDemo.js:82`
- Current text: “46”, “121”, and “310” credits; “Aug 12”; “Yesterday”; “Weekly (Monday, 8:00)”
- Problem: The details look like real product history and price evidence but are fabricated for the demo.
- Fix: “Sample data” and “Example cost”
- Priority: P1

### Demo invents output size and completion time

- Location: `apps/sokosumi/templates/productDemo.js:93`
- Current text: “12 pages, pricing table, sources linked” completed from 09:04 to 09:27.
- Problem: The demo implies a 23-minute delivery with a specific report result.
- Fix: “Sample report attached.” Delete the timestamps and page count.
- Priority: P1

### Feature card repeats fabricated productivity metrics

- Location: `apps/sokosumi/templates/productDemo.js:858`
- Current text: “5 tasks completed”, “212 minutes worked”, “1 task needs your input”
- Problem: The exact figures have no source and appear outside the demo’s activity context as product proof.
- Fix: Delete the metrics row.
- Priority: P1

### Chat feature promises a 20-minute first cut

- Location: `apps/sokosumi/templates/productDemo.js:876`
- Current text: “First cut in about 20 minutes.”
- Problem: The time is invented and reads as a turnaround promise.
- Fix: “I started a task and will post the file here when it finishes.”
- Priority: P1

### Chat feature invents a 12-page result

- Location: `apps/sokosumi/templates/productDemo.js:877`
- Current text: “12 pages, three gaps, pricing table on page 4.”
- Problem: The fabricated result looks like evidence of output quality and speed.
- Fix: “The sample report is attached to the task.”
- Priority: P1

### Scheduled cards invent twelve completed runs

- Location: `apps/sokosumi/templates/productDemo.js:908`
- Current text: “12 runs” on each of three scheduled tasks.
- Problem: The repeated number simulates product usage without a source.
- Fix: Delete the run counts.
- Priority: P1

### Demo fabricates a Plan.Net customer rollout

- Location: `apps/sokosumi/templates/productDemo.js:727`
- Current text: “Closed the Plan.Net pilot today. They want the full rollout for Q4.”
- Problem: The message asserts a named customer deal and future rollout that the repository does not support.
- Fix: Delete the message and any replies that refer to it.
- Priority: P1

### Demo fabricates a reach increase

- Location: `apps/sokosumi/templates/productDemo.js:731`
- Current text: “reach is up 12%”
- Problem: The metric is invented and is presented as a measured business result.
- Fix: Delete the message.
- Priority: P1

### Demo fabricates delivery performance

- Location: `apps/sokosumi/templates/productDemo.js:732`
- Current text: “23 shipped, 4 slipped”
- Problem: The counts simulate operational evidence.
- Fix: Delete the message.
- Priority: P1

### Demo invents live customer pilots

- Location: `apps/sokosumi/templates/productDemo.js:750`
- Current text: “two live AI pilots with customers”
- Problem: The claim presents fictional sales activity as fact.
- Fix: Delete the message.
- Priority: P1

### Demo fabricates a sales outcome

- Location: `apps/sokosumi/templates/productDemo.js:751`
- Current text: “they asked for a pilot on the call.”
- Problem: The result reads like customer proof but is invented.
- Fix: Delete the message.
- Priority: P1

### Demo fabricates an 8:00 delivery habit

- Location: `apps/sokosumi/templates/productDemo.js:769`
- Current text: “Hannah’s prospect briefs are changing my calls… the PDF is there at 8.”
- Problem: The fictional testimonial combines a business result with an exact delivery promise.
- Fix: Delete the message.
- Priority: P1

### Demo fabricates plan consumption

- Location: `apps/sokosumi/templates/productDemo.js:779`
- Current text: “we used 61% of the monthly allowance”
- Problem: The metric looks like real account data and conflicts with the invented 78,494-credit balance.
- Fix: Delete the message.
- Priority: P1

### Demo fabricates editing time saved

- Location: `apps/sokosumi/templates/productDemo.js:783`
- Current text: “came back in 20 minutes and needed almost no edits.”
- Problem: The sentence is an invented speed and quality testimonial.
- Fix: Delete the message.
- Priority: P1

### Personal-assistant card promises infrastructure and data protection

- Location: `apps/sokosumi/templates/productDemo.js:691`
- Current text: “its own micro-VM”, “Your data stays yours”, and named integrations.
- Problem: The card makes security, isolation, retention, and integration claims without links to product terms or technical documentation.
- Fix: Delete the card until every security, hosting, memory, and integration claim links to product documentation.
- Priority: P1

### Activation dialog says the assistant runs while users sleep

- Location: `apps/sokosumi/assets/product-demo.js:749`
- Current text: “remembers your context and runs while you sleep.”
- Problem: The phrase promises persistence and unattended operation without stating limits or controls.
- Fix: “Review the assistant’s available integrations and current beta terms.”
- Priority: P1

### Demo exposes internal organization names

- Location: `apps/sokosumi/assets/product-demo.js:671`
- Current text: “utxo AG”, “Serviceplan Group”, “NMKR”, “GameChanger” in a workspace switcher.
- Problem: Real organization names inside a simulated private account make the example look like genuine cross-organization access.
- Fix: “Northstar Studio”, “Sample Agency”, “Demo Partner”, and “Demo workspaces”
- Priority: P1

### Demo UI uses title case throughout

- Location: `apps/sokosumi/templates/productDemo.js:489`, `apps/sokosumi/templates/productDemo.js:494`, `apps/sokosumi/templates/productDemo.js:885`
- Current text: “Start New Task”, “Ready-To-Run Tasks”, “New Task”
- Problem: The labels conflict with the design rule embedded in the demo itself: “Sentence case.”
- Fix: “Start a new task”, “Ready-to-run tasks”, “New task”
- Priority: P3

### Demo copy contains exclamation and emoji decoration

- Location: `apps/sokosumi/templates/productDemo.js:445`, `apps/sokosumi/templates/productDemo.js:776`
- Current text: “Welcome, Patrick!” and celebratory emoji in seeded work messages.
- Problem: The punctuation and emoji make ordinary product states feel staged.
- Fix: “Welcome, Patrick.” and remove emoji from seeded business messages.
- Priority: P3

### Simulated controls report success without performing work

- Location: `apps/sokosumi/assets/product-demo.js:1089`
- Current text: “Checkout opens in the app”, “Your assistant is being set up”, “Download started”, “Project created”
- Problem: The demo fires success messages for actions that do not create, download, buy, or provision anything.
- Fix: Delete success messages for simulated actions; use “Demo only: this action opens the live product.”
- Priority: P1
