import type {ContentItem, HomepageData, TopicConfig} from '../../src/data/homepage';

export type Publication = ContentItem & {
  eligible: boolean;
  draft?: boolean;
  unlisted?: boolean;
};

// Restrict publication dates to explicit calendar dates, normalized at build time.
export function publicationDate(value: unknown, id: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  const day = value instanceof Date && Number.isFinite(value.getTime()) ? value.toISOString().slice(0, 10) : String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day) {
    throw new Error(`Homepage: invalid publication date for "${id}". Use YYYY-MM-DD.`);
  }
  return day;
}

function contentItem(item: Publication): ContentItem {
  const {id, title, description, permalink, type, date} = item;
  return {id, title, description, permalink, type, ...(date ? {date} : {})};
}

export function resolveHomepage(
  publications: readonly Publication[],
  topics: readonly TopicConfig[],
  featuredIds: readonly string[],
  today = new Date().toISOString().slice(0, 10),
): HomepageData {
  const docs = new Map(publications.filter((item) => item.type === 'Guide').map((item) => [item.id, item]));
  function findDoc(id: string) {
    const doc = docs.get(id);
    if (!doc) throw new Error(`Homepage: unknown document ID "${id}". Check src/data/homepage.ts.`);
    return doc;
  }
  const eligible = (item: Publication) => {
    if (!item.eligible || item.draft || item.unlisted) return false;
    const date = publicationDate(item.date, item.id);
    return !date || date <= today;
  };
  return {
    topics: topics.flatMap((topic) => {
      const doc = findDoc(topic.docId);
      return eligible(doc) ? [{...topic, permalink: doc.permalink}] : [];
    }),
    featured: featuredIds.map(findDoc).filter(eligible).map(contentItem),
    recent: publications.filter(eligible).filter((item) => item.date)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date! > b.date! ? -1 : 1;
        return a.permalink < b.permalink ? -1 : a.permalink > b.permalink ? 1 : 0;
      })
      .slice(0, 3).map(contentItem),
  };
}
