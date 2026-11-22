import React, {type ReactNode} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import OriginalFooter from '@theme-original/DocItem/Footer';
import ContentLicenseNotice from '@site/src/components/ContentLicenseNotice';

export default function DocItemFooter(): ReactNode {
  const {metadata, frontMatter} = useDoc();
  const isArticle = Boolean(metadata.description?.trim()) && !frontMatter.draft;

  return (
    <>
      <OriginalFooter />
      {isArticle && <ContentLicenseNotice license={(frontMatter as {content_license?: unknown}).content_license} />}
    </>
  );
}
