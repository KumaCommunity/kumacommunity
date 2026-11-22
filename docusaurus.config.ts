import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import {project} from './src/data/project';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Kuma Community',
  tagline: 'Building a more resilient community.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    // Docusaurus v4 compatibility flags, evaluated individually.
    // See https://docusaurus.io/docs/api/docusaurus-config#future
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      mdx1CompatDisabledByDefault: true,
      // Enabled: custom.css now wins over Infima via layer order; visually
      // verified against pre-upgrade snapshots (light + dark).
      useCssCascadeLayers: true,
      // Deferred: changes browser storage keys (theme preference resets once).
      siteStorageNamespacing: false,
      // Deferred: switches bundler to Rspack and requires @docusaurus/faster.
      fasterByDefault: false,
    },
  },

  // Set the production url of your site here
  url: 'https://www.kumacommunity.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // Source repository (github.com/KumaCommunity/kumacommunity). Used by
  // `docusaurus deploy` only; production hosting is Cloudflare Pages.
  organizationName: 'KumaCommunity',
  projectName: 'kumacommunity',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: ['./plugins/homepage/index.ts'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Blogging best-practice warnings (non-fatal).
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/logo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Kuma Community',
      logo: {
        alt: 'Kuma Community Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Guides',
        },
        {to: project.about, label: 'About', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Explore',
          items: [
            {
              label: 'Guides',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'About', to: project.about},
            {label: 'Contributing', to: project.contributing},
            {label: 'Source code', href: project.source},
            {label: 'GPLv3 (Source Code)', href: project.license},
            {label: 'CC BY-SA 4.0 (Content)', to: '/licensing'},
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Privacy Policy',
              to: '/PrivacyPolicy',
            },
            {
              label: 'Terms of Use',
              to: '/TermsOfUse',
            },
            {
              label: 'Other Policies',
              to: '/Policies',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Kuma Community`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
