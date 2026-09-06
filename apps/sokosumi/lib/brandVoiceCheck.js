"use strict";

// Deterministic brand-voice extractor for /tools/brand-voice-analyzer. Given
// 5-10 pasted posts (blank-line or "---" separated), this measures sentence
// length, contraction rate, pronoun balance, and punctuation habits across
// all of them, then turns the numbers into a reusable voice spec — the same
// no-network, no-LLM approach as postCheck.js and headlineCheck.js, just
// aggregated across several inputs instead of scoring one.

const MAX_TEXT_LENGTH = 12000;
const MIN_POSTS = 2;

const STOPWORDS = new Set(
  "a an the and or but if then so of to in on for with at by from up about into over after is are was were be been being this that these those it its it's you your you're we we're our us i i'm my me he she they them their as not no do does did done can could should would will just more most so than very really also has have had".split(
    " ",
  ),
);

const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

function splitPosts(text) {
  return text
    .split(/\n\s*-{3,}\s*\n|\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function words(text) {
  return text.match(/\b[\w'-]+\b/g) || [];
}

function sentences(text) {
  return text
    .split(/[.!?]+(?:\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function topWords(posts) {
  const counts = new Map();
  posts.forEach((post) => {
    const seen = words(post.toLowerCase());
    seen.forEach((w) => {
      if (w.length < 3 || STOPWORDS.has(w) || /^\d+$/.test(w)) return;
      counts.set(w, (counts.get(w) || 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, count]) => ({ label, count }));
}

function pct(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function analyze(input) {
  const raw = String((input && input.text) || "");
  const trimmed = raw.trim();

  if (!trimmed) {
    const error = new Error("Paste a handful of existing posts, separated by a blank line.");
    error.status = 400;
    throw error;
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    const error = new Error(`That's ${trimmed.length} characters — keep it under ${MAX_TEXT_LENGTH}.`);
    error.status = 400;
    throw error;
  }

  const posts = splitPosts(trimmed);
  if (posts.length < MIN_POSTS) {
    const error = new Error(`Found ${posts.length} post(s) — separate posts with a blank line (or "---") and paste at least ${MIN_POSTS}.`);
    error.status = 400;
    throw error;
  }

  const allWords = posts.flatMap((p) => words(p));
  const allSentences = posts.flatMap((p) => sentences(p));
  const wordCount = allWords.length;

  const avgWordsPerSentence = allSentences.length ? wordCount / allSentences.length : wordCount;
  const avgWordsPerPost = wordCount / posts.length;

  const contractions = (trimmed.match(/\b\w+'\w+\b/g) || []).length;
  const contractionsPer100Words = wordCount ? (contractions / wordCount) * 100 : 0;

  const youCount = (trimmed.match(/\b(you|your|you're|yours)\b/gi) || []).length;
  const weCount = (trimmed.match(/\b(we|our|us|ours)\b/gi) || []).length;
  const iCount = (trimmed.match(/\b(i|i'm|my|mine)\b/gi) || []).length;
  const pronounTotal = youCount + weCount + iCount;

  const emojiCount = (trimmed.match(EMOJI_PATTERN) || []).length;
  const exclamationCount = (trimmed.match(/!/g) || []).length;
  const questionCount = (trimmed.match(/\?/g) || []).length;
  const hashtagCount = (trimmed.match(/#\w+/g) || []).length;

  const emojiPerPost = emojiCount / posts.length;
  const exclamationPerPost = exclamationCount / posts.length;
  const questionPerPost = questionCount / posts.length;
  const hashtagPerPost = hashtagCount / posts.length;

  const formalityLabel = contractionsPer100Words >= 2 ? "Casual, conversational" : contractionsPer100Words > 0 ? "Neutral" : "Formal, no contractions";

  const pronounProfile = {
    you: pct(youCount, pronounTotal),
    we: pct(weCount, pronounTotal),
    i: pct(iCount, pronounTotal),
  };
  const personLabel =
    pronounTotal === 0
      ? "No first- or second-person language"
      : pronounProfile.you >= 45
        ? "Reader-directed (talks to \"you\")"
        : pronounProfile.we >= 45
          ? "Collective voice (talks as \"we\")"
          : pronounProfile.i >= 45
            ? "Personal narrator (talks as \"I\")"
            : "Mixed — no single dominant voice";

  const sentenceStyleLabel = avgWordsPerSentence < 14 ? "Short and punchy" : avgWordsPerSentence <= 22 ? "Conversational length" : "Long-form, detailed";

  const punctuationBits = [];
  if (emojiPerPost >= 1) punctuationBits.push("uses emoji often");
  else if (emojiPerPost > 0) punctuationBits.push("uses emoji occasionally");
  if (exclamationPerPost >= 1) punctuationBits.push("enthusiastic punctuation (frequent !)");
  if (questionPerPost >= 0.5) punctuationBits.push("asks questions often");
  if (hashtagPerPost >= 1) punctuationBits.push(`averages ${hashtagPerPost.toFixed(1)} hashtags per post`);
  const punctuationLabel = punctuationBits.length ? punctuationBits.join("; ") : "measured, minimal decoration";

  const words_ = topWords(posts);

  const spec = [
    `Voice: ${personLabel}. ${formalityLabel}.`,
    `Sentences: ${sentenceStyleLabel} — averaging ${avgWordsPerSentence.toFixed(1)} words per sentence, ${avgWordsPerPost.toFixed(0)} words per post.`,
    `Punctuation: ${punctuationLabel}.`,
    `Recurring vocabulary: ${words_.slice(0, 8).map((w) => w.label).join(", ") || "no strong recurring terms"}.`,
    "",
    "Write new posts in this voice by:",
    `- Keeping sentences to roughly ${Math.max(6, Math.round(avgWordsPerSentence - 4))}-${Math.round(avgWordsPerSentence + 6)} words.`,
    pronounProfile.you >= 45 ? "- Addressing the reader directly (\"you\", \"your\")." : pronounProfile.we >= 45 ? "- Speaking as \"we\" rather than \"I\" or \"you\"." : "- Keeping the same pronoun balance found above.",
    contractionsPer100Words >= 2 ? "- Using contractions freely (don't, it's, we're)." : "- Avoiding contractions to keep the tone formal.",
    emojiPerPost >= 1 ? "- Including at least one emoji." : "- Skipping emoji.",
  ].join("\n");

  return {
    postCount: posts.length,
    wordCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgWordsPerPost: Math.round(avgWordsPerPost),
    contractionsPer100Words: Math.round(contractionsPer100Words * 10) / 10,
    pronounProfile,
    personLabel,
    formalityLabel,
    sentenceStyleLabel,
    punctuationLabel,
    emojiPerPost: Math.round(emojiPerPost * 10) / 10,
    exclamationPerPost: Math.round(exclamationPerPost * 10) / 10,
    hashtagPerPost: Math.round(hashtagPerPost * 10) / 10,
    topWords: words_,
    spec,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };
