// References are Docusaurus document IDs, never hand-written public URLs.
export type IconName = 'book' | 'plan' | 'network' | 'tools';
export type TopicConfig = {
  title: string;
  description: string;
  icon: IconName;
  docId: string;
};
export type ContentItem = {
  id: string;
  title: string;
  description?: string;
  permalink: string;
  type: 'Guide' | 'Article';
  date?: string;
};
export type HomepageData = {
  topics: (TopicConfig & {permalink: string})[];
  featured: ContentItem[];
  recent: ContentItem[];
};

export const topics: readonly TopicConfig[] = [
  {
    title: 'Preparedness',
    description: 'Emergency planning and household preparedness.',
    icon: 'plan',
    docId: 'Emergency Planning/PACE Plan',
  },
  {
    title: 'Safety & Security',
    description: 'Personal safety and home security.',
    icon: 'book',
    docId: 'Firearms/Firearm Safety/Storage Safety',
  },
];
// Pending selections: automatically shown only after editorial eligibility.
export const featuredDocIds = [
  'Emergency Planning/PACE Plan',
  'Firearms/Firearm Safety/Storage Safety',
] as const;
