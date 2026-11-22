import type {ReactNode} from 'react';
import OriginalBlogListPage from '@theme-original/BlogListPage';
import type {Props} from '@theme/BlogListPage';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function BlogListPage(props: Props): ReactNode {
  if (props.items.length > 0) return <OriginalBlogListPage {...props} />;

  // Preserve the empty archive URL without promoting starter posts or rendering
  // an empty sidebar. Normal populated archives stay owned by Docusaurus.
  return (
    <Layout title={props.metadata.blogTitle} description={props.metadata.blogDescription}>
      <main className="container margin-vert--lg">
        <Heading as="h1">{props.metadata.blogTitle}</Heading>
      </main>
    </Layout>
  );
}
