import type {Plugin} from '@docusaurus/types';
import type {LoadedContent} from '@docusaurus/plugin-content-docs';
import type {BlogContent} from '@docusaurus/plugin-content-blog';
import {featuredDocIds, topics} from '../../src/data/homepage';
import {publicationDate, resolveHomepage} from './resolve';

export default function homepagePlugin(): Plugin {
  return {
    name: 'kuma-homepage',
    allContentLoaded({allContent, actions}) {
      const docs = allContent['docusaurus-plugin-content-docs']?.default as LoadedContent | undefined;
      const version = docs?.loadedVersions.find((item) => item.versionName === 'current');
      if (!version) throw new Error('Homepage: current documentation metadata is unavailable.');
      const blog = allContent['docusaurus-plugin-content-blog']?.default as BlogContent | undefined;
      const guides = [...version.docs, ...version.drafts].map((doc) => ({
          id: doc.id,
          title: doc.title,
          description: doc.description || undefined,
          permalink: doc.permalink,
          type: 'Guide' as const,
          eligible: doc.frontMatter.homepage === true && Boolean(doc.description.trim()),
          draft: doc.draft,
          unlisted: doc.unlisted,
          date: doc.frontMatter.homepage === true ? publicationDate(doc.frontMatter.date, doc.id) : undefined,
        }));
      const articles = (blog?.blogPosts ?? []).map(({id, metadata}) => ({
        id,
        title: metadata.title,
        description: metadata.description || undefined,
        permalink: metadata.permalink,
        type: 'Article' as const,
        eligible: metadata.frontMatter.homepage === true && Boolean(metadata.description.trim()),
        draft: metadata.frontMatter.draft === true,
        unlisted: metadata.unlisted,
        // Blog filenames contain explicit publication dates, unlike docs.
        date: metadata.frontMatter.homepage === true ? publicationDate(metadata.date, id) : undefined,
      }));
      actions.setGlobalData(resolveHomepage([...guides, ...articles], topics, featuredDocIds));
    },
  };
}
