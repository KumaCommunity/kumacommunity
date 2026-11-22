import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import {usePluginData} from '@docusaurus/useGlobalData';
import {ContentList, Contribute, Hero, ProjectPrinciples, TopicGrid} from '../components/Homepage';
import type {HomepageData} from '../data/homepage';

export default function Home(): ReactNode {
  const data = usePluginData('kuma-homepage') as HomepageData;
  return (
    <Layout
      title="Preparedness and independent technology"
      description="Guides and resources for emergency preparedness, personal safety, communications, privacy, and independent technology."
    >
      <main>
        <Hero />
        <div className="container">
          <TopicGrid topics={data.topics} />
          <ContentList items={data.featured} />
          <ProjectPrinciples />
          <ContentList items={data.recent} recent />
          <Contribute />
        </div>
      </main>
    </Layout>
  );
}
