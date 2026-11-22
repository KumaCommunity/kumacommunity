import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import type { ContentItem, HomepageData, IconName } from "../../data/homepage";
import { project } from "../../data/project";
import styles from "./styles.module.css";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    book: (
      <>
        <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z" />
        <path d="M12 5v15" />
      </>
    ),
    plan: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="1" />
        <path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="5" r="3" />
        <circle cx="5" cy="18" r="3" />
        <circle cx="19" cy="18" r="3" />
        <path d="m10 8-4 7m8-7 4 7M8 18h8" />
      </>
    ),
    tools: (
      <path d="M21 6a6 6 0 0 1-8 6L5 20a2 2 0 0 1-3-3l8-8a6 6 0 0 1 8-8l-4 4 3 3 4-4Z" />
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.icon}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Hero() {
  return (
    <header className={styles.hero}>
      <div className={`container ${styles.heroInner}`}>
        <Heading as="h1">Building a more resilient community.</Heading>
        <p className={styles.heroDescription}>
          Guides and resources for emergency preparedness, personal safety,
          communications, privacy, and independent technology.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} to={project.guides}>
            Explore the Guides <span aria-hidden="true">↗</span>
          </Link>
          <Link className={styles.secondaryAction} to={project.about}>
            About the Project <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function TopicGrid({ topics }: Pick<HomepageData, "topics">) {
  if (!topics.length) return null;
  return (
    <section className={styles.section} aria-labelledby="topics-heading">
      <Heading as="h2" id="topics-heading">
        Explore by topic
      </Heading>
      <div className={styles.topicGrid}>
        {topics.map((topic) => (
          <Link className={styles.topic} key={topic.docId} to={topic.permalink}>
            <Icon name={topic.icon} />
            <Heading as="h3">{topic.title}</Heading>
            <p>{topic.description}</p>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ContentList({
  items,
  recent = false,
}: {
  items: ContentItem[];
  recent?: boolean;
}) {
  if (!items.length) return null;
  const id = recent ? "recent-heading" : "start-heading";
  return (
    <section className={styles.section} aria-labelledby={id}>
      <Heading as="h2" id={id}>
        {recent ? "Recently published" : "Where to start"}
      </Heading>
      <div className={styles.readingList}>
        {items.map((item) => (
          <Link
            className={styles.readingItem}
            key={item.permalink}
            to={item.permalink}
          >
            <div className={styles.itemMeta}>
              {item.type}
              {recent && item.date ? (
                <time dateTime={item.date}>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  }).format(new Date(item.date))}
                </time>
              ) : null}
            </div>
            <div>
              <Heading as="h3">{item.title}</Heading>
              {item.description ? <p>{item.description}</p> : null}
            </div>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const principles = [
  {
    title: "Accessible",
    description: "Education without barriers",
    icon: "book",
  },
  { title: "Practical", description: "Real world applications", icon: "tools" },
  {
    title: "Independent",
    description: "Built on open standards",
    icon: "network",
  },
] as const;

export function ProjectPrinciples() {
  return (
    <section className={styles.section} aria-labelledby="approach-heading">
      <Heading as="h2" id="approach-heading">
        Our approach
      </Heading>
      <div className={styles.principles}>
        {principles.map((principle) => (
          <div key={principle.title} className={styles.principle}>
            <Icon name={principle.icon} />
            <Heading as="h3">{principle.title}</Heading>
            <p>{principle.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Contribute() {
  return (
    <section
      className={`${styles.section} ${styles.contribute}`}
      aria-labelledby="project-heading"
    >
      <Heading as="h2" id="project-heading">
        Contribute
      </Heading>
      <div>
        <p>
          Found an error, have a suggestion, or want to contribute a guide?
          Contributions to Kuma Community are welcome.
        </p>
        <div className={styles.projectLinks}>
          <Link to={project.contributing}>
            Contribution guidelines <span aria-hidden="true">↗</span>
          </Link>
          <Link to={project.source}>
            GitHub <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
