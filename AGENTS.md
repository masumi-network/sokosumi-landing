# AGENTS.md

Working rules for anyone — human or agent — writing for the sites in this
repo. For architecture see [CLAUDE.md](CLAUDE.md) and
[docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md).

## Writing: Obvious Adams

House style, on every surface: marketing copy, UI strings, headings, error
messages, docs, alt text, commit messages.

The rule comes from Updegraff's *Obvious Adams* (1916): the obvious answer
is usually the right one, and it gets rejected because it looks too simple
to be clever. Write the obvious sentence. Then stop.

**Before shipping a line, run it through the five tests.**

1. **Is it simple?** One idea per sentence. If a sentence needs a comma
   splice or a subordinate clause to survive, it is two sentences.
2. **Does it check with human nature?** Say what a person would say out
   loud to a colleague. Nobody says "leverage", "seamless", "empower",
   "unlock" or "solutions" out loud.
3. **Does it survive being written plainly?** Strip the adjectives and
   read what is left. If the claim disappears, there was no claim — there
   was decoration. Cut it or replace it with the fact underneath.
4. **Does it land?** The reader should think "yes, obviously" — not "what
   does that mean?" and not "sure, everyone says that".
5. **Is the time ripe?** Say it where the reader needs it, not where it
   flatters us. A feature explained before the reader knows the problem is
   noise.

**In practice**

- Lead with the point. The first sentence is the answer, not the run-up.
- Prefer the concrete number to the adjective: "about 20 minutes" beats
  "fast", "250 credits per seat" beats "generous free tier".
- Say the thing once. If the table already proved it, the paragraph below
  must not re-prove it — that is the most common bloat on this site.
- Verbs over nouns. "Brief a coworker" beats "the briefing process".
- Cut the throat-clearing: "It is worth noting that", "In today's
  fast-moving", "We believe that", "Whether you are X or Y".
- No invented proof. A number we cannot source does not go on the page.
- Short is the effect, not the goal. Do not cut a fact to hit a word count;
  cut the words that were not carrying one.

**What this is not.** It is not clipped or terse for its own sake, and it
is not dumbing down. A long sentence that earns its length is fine. The
target is that a reader never has to read a line twice.
