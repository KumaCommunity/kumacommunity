import {expect, test} from '@playwright/test';
import homepagePlugin from '../plugins/homepage';
import {featuredDocIds} from '../src/data/homepage';
import type {HomepageData} from '../src/data/homepage';

// Exercise the real build hook with synthetic Docusaurus metadata, not public files.
test('plugin resolves actual metadata, blocks empty descriptions, combines blog dates', () => {
  let result: HomepageData;
  const docs = featuredDocIds.map((id, index) => ({
    id,
    title: `Metadata title ${index}`,
    description: index ? '' : 'Reviewed description',
    permalink: `/docs/canonical-${index}`,
    frontMatter: {homepage: true},
    draft: false,
    unlisted: false,
  }));
  const hook = homepagePlugin().allContentLoaded!;
  hook({
    allContent: {
      'docusaurus-plugin-content-docs': {default: {loadedVersions: [{versionName: 'current', docs, drafts: []}]}},
      'docusaurus-plugin-content-blog': {default: {blogPosts: [
        {id: 'post', metadata: {title: 'Metadata article', description: 'Reviewed article', permalink: '/blog/canonical', date: new Date('2020-01-01'), frontMatter: {homepage: true}, unlisted: false}},
        {id: 'starter', metadata: {title: 'Template', description: 'Template description', permalink: '/blog/starter', date: new Date('2020-01-02'), frontMatter: {}, unlisted: false}},
      ]}},
    },
    actions: {setGlobalData(data) { result = data as HomepageData; }} as Parameters<typeof hook>[0]['actions'],
  });
  expect(result!.topics).toHaveLength(1);
  expect(result!.topics[0].permalink).toBe('/docs/canonical-0');
  expect(result!.featured[0].title).toBe('Metadata title 0');
  expect(result!.featured[0].description).toBe('Reviewed description');
  expect(result!.recent.map((item) => [item.title, item.date])).toEqual([['Metadata article', '2020-01-01']]);
});

test('plugin fails clearly when required current-version metadata is unavailable', () => {
  expect(() => homepagePlugin().allContentLoaded!({allContent: {}, actions: {} as never})).toThrow('current documentation metadata is unavailable');
});
