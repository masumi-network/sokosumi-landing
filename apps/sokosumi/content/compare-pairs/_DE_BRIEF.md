# German pass for content/compare-pairs/*.json

For every `*.json` in this directory (skip files starting with `_`): add a
`de` object next to `en` with the SAME shape (title, metaTitle, description,
intro, glance [same row order, translate all three cells], pickA/pickB
{heading, points}, limits {a, b}, verdict, bridge {heading, text, points,
links unchanged}, faq [[q, a] …]). Leave `en`, `a`, `b`, `slug`, `checked`,
`sources` untouched. Do not translate product names, company names, plan
names (Pro, Team, Business, Enterprise), or model names. Keep every number,
price and currency exactly. Keep these product terms as the app uses them:
Coworker, Agent/Agents, Credits, Seat/Seats, Task-Board, Briefing/briefen,
Vorlagen (template tasks), Marktplatz, Anbieter, Free-Plan, Enterprise.

Write German a DACH B2B marketer would write: Sie-Form, short sentences,
plain words, no Denglisch ("Kanal" not "Channel", "Recherche" not "Research"
when it is the activity, "Kreditkarte" not "Karte", "verbraucht" not "gehen
drauf"), no marketing filler. Headings stay questions where the English is a
question. `metaTitle` ≤ 65 characters, `description` 130–155 characters.

Validate every file with `node -e "JSON.parse(require('fs').readFileSync('<file>','utf8'))"`
after editing. If a file already has a `de` object, leave it.
