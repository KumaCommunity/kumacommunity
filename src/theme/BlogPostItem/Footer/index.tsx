import React, {type ReactNode} from 'react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import OriginalFooter from '@theme-original/BlogPostItem/Footer';
import ContentLicenseNotice from '@site/src/components/ContentLicenseNotice';

export default function BlogPostItemFooter(): ReactNode {
  const {metadata, frontMatter, isBlogPostPage} = useBlogPost();
  const isArticle = isBlogPostPage && Boolean(metadata.description?.trim()) && !frontMatter.draft;

  return (
    <>
      <OriginalFooter />
      {isArticle && <ContentLicenseNotice license={(frontMatter as {content_license?: unknown}).content_license} />}
    </>
  );
}
