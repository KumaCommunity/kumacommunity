import {expect, test} from '@playwright/test';
import {publicationDate, resolveHomepage, type Publication} from '../plugins/homepage/resolve';
import type {TopicConfig} from '../src/data/homepage';

// Synthetic data stays in tests, never in public content or generated pages.
const guide: Publication = {id: 'guide', title: 'A guide', permalink: '/docs/guide', type: 'Guide', eligible: true};
const topic: TopicConfig = {title: 'Preparedness', description: 'Planning', icon: 'plan', docId: 'guide'};
const today = '2026-05-01';
const resolve = (items: Publication[], topics: TopicConfig[] = [], featured: string[] = []) => resolveHomepage(items, topics, featured, today);

test('empty and pending collections produce no homepage sections', () => {
  expect(resolve([])).toEqual({topics: [], featured: [], recent: []});
  expect(resolve([{...guide, eligible: false}], [topic], ['guide'])).toEqual({topics: [], featured: [], recent: []});
});

test('eligible undated guide resolves canonical metadata without entering recent feed', () => {
  const data = resolve([guide], [topic], ['guide']);
  expect(data.topics).toEqual([{...topic, permalink: guide.permalink}]);
  expect(data.featured).toEqual([{id: 'guide', title: 'A guide', permalink: '/docs/guide', type: 'Guide', description: undefined}]);
  expect(data.recent).toEqual([]);
});

for (const patch of [{draft: true}, {unlisted: true}, {eligible: false}, {date: '2026-05-02'}]) {
  test(`visibility excludes ${JSON.stringify(patch)} from every section`, () => {
    const item = {...guide, date: '2026-04-01', ...patch};
    expect(resolve([item], [topic], ['guide'])).toEqual({topics: [], featured: [], recent: []});
  });
}

test('invalid required topic and featured IDs fail with actionable messages', () => {
  expect(() => resolve([], [topic])).toThrow('unknown document ID "guide"');
  expect(() => resolve([], [], ['missing'])).toThrow('unknown document ID "missing"');
});

test('curation order remains independent of date and optional description is absent', () => {
  const older = {...guide, id: 'older', permalink: '/docs/older', date: '2025-01-01'};
  const newer = {...guide, date: '2026-01-01'};
  expect(resolve([newer, older], [], ['older', 'guide']).featured.map((item) => item.id)).toEqual(['older', 'guide']);
  expect(resolve([guide], [], ['guide']).featured[0].description).toBeUndefined();
});

test('recent feed combines types, sorts by date with stable URL tie-break, caps at three', () => {
  const items: Publication[] = [
    {...guide, id: 'b', permalink: '/docs/b', date: today},
    {...guide, id: 'old', permalink: '/docs/old', date: '2020-01-01'},
    {...guide, id: 'article', permalink: '/blog/a', type: 'Article', date: today},
    {...guide, id: 'c', permalink: '/docs/c', date: '2026-04-30'},
  ];
  const expected = ['/blog/a', '/docs/b', '/docs/c'];
  expect(resolve(items).recent.map((item) => item.permalink)).toEqual(expected);
  expect(resolve([...items].reverse()).recent.map((item) => item.permalink)).toEqual(expected);
  expect(resolve([items[0]]).recent).toHaveLength(1);
});

test('publication dates reject malformed and impossible calendar dates', () => {
  for (const date of ['yesterday', '', '2026-02-30', '2026-13-01', '2026-5-1', '2026-01-01T12:00:00Z']) {
    expect(() => publicationDate(date, 'guide')).toThrow('Use YYYY-MM-DD');
  }
  expect(() => publicationDate(new Date('invalid'), 'guide')).toThrow('Use YYYY-MM-DD');
  expect(publicationDate(undefined, 'guide')).toBeUndefined();
  expect(publicationDate('2024-02-29', 'guide')).toBe('2024-02-29');
  expect(publicationDate(new Date('2026-01-01T00:00:00Z'), 'guide')).toBe('2026-01-01');
  expect(() => resolve([{...guide, date: 'bad'}])).toThrow('invalid publication date');
});
