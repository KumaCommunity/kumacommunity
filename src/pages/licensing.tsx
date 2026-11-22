import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import MDXContent from '@theme/MDXContent';
import ContentLicense from '@site/LICENSE-CONTENT.md';

export default function LicensingPage(): ReactNode {
  return (
    <Layout title="Licensing" description="Software and educational content licenses, attribution, and exclusions.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2 markdown">
            <MDXContent><ContentLicense /></MDXContent>
          </div>
        </div>
      </main>
    </Layout>
  );
}
