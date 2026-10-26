import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { load } from 'cheerio';

const previewUrl = process.env.TUM_PREVIEW_URL ?? 'http://127.0.0.1:3001';
const guidePath = '/tum-hackathon';
const invitation = 'https://preprod.sokosumi.com/join/GTAHB3OQFWgg8rGetMfleiqgeL6_ltdW';
const obsoleteContent = /TOKEN2049|BuilderBase|\b(?:VERIFIED|REPORTED|INFERRED):/i;

test('TUM pages load with their own navigation and canonical URLs', async () => {
  for (const path of [guidePath, `${guidePath}/agent`, `${guidePath}/submission`]) {
    const response = await fetch(new URL(path, previewUrl));
    assert.equal(response.status, 200, path);
    const $ = load(await response.text());
    assert.equal($('h1').length, 1, path);
    assert.equal($('link[rel="canonical"]').attr('href'), `https://www.masumi.network${path}`);
    assert.doesNotMatch($('main').text(), obsoleteContent);
    const links = $('nav[aria-label="Hackathon pages"] a').map((_, element) => $(element).attr('href')).get();
    assert.deepEqual(links, [guidePath, `${guidePath}/agent`, `${guidePath}/submission`]);
    assert.equal($('main a[href*="token2049"], main a[href*="builderbase"]').length, 0);
  }
});

test('TUM setup uses the current invitation, template, and standard npm commands', async () => {
  const response = await fetch(new URL(guidePath, previewUrl));
  assert.equal(response.status, 200);
  const $ = load(await response.text());
  assert.ok($(`main a[href="${invitation}"]`).length > 0);
  assert.ok($('main a[href="https://github.com/masumi-network/tum-hackathon-quickstart"]').length > 0);
  const commands = $('main pre').text();
  assert.match(commands, /npm install --global @masumi_network\/sokosumi@1\.0\.4/);
  assert.doesNotMatch(commands, /sfw npm/);
  assert.match(commands, /SOKOSUMI_ORGANIZATION_ID=ORGANIZATION_ID/);
  assert.match(commands, /SOKOSUMI_ORGANIZATION_SLUG=ORGANIZATION_SLUG/);
  assert.match(commands, /--organization-slug ORGANIZATION_SLUG/);
});

test('TUM Markdown and skill downloads serve the complete TUM brief', async () => {
  const source = await readFile(new URL('../public/tum-hackathon/agent-guide.md', import.meta.url), 'utf8');
  const response = await fetch(new URL(`${guidePath}/agent-guide.md`, previewUrl));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), source);
  const skill = await fetch(new URL(`${guidePath}/skill/SKILL.md`, previewUrl));
  assert.equal(skill.status, 200);
  assert.match(skill.headers.get('content-type'), /text\/markdown/);
  assert.equal(skill.headers.get('content-disposition'), 'attachment; filename="SKILL.md"');
  const content = await skill.text();
  assert.match(content, /^---\nname: tum-hackathon-agent\n/);
  assert.ok(content.endsWith(source));
  assert.doesNotMatch(content, obsoleteContent);
  assert.ok(content.includes(invitation));
});
