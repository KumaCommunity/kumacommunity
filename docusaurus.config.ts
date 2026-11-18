import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Kuma Community',
  tagline: 'Building a resilent community.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    // Docusaurus v4 compatibility flags, evaluated individually.
    // See https://docusaurus.io/docs/api/docusaurus-config#future
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      mdx1CompatDisabledByDefault: true,
      // Deferred: changes CSS cascade; needs visual verification.
      useCssCascadeLayers: false,
      // Deferred: changes browser storage keys (theme preference resets once).
      siteStorageNamespacing: false,
      // Deferred: switches bundler to Rspack and requires @docusaurus/faster.
      fasterByDefault: false,
    },
  },

  // Set the production url of your site here
  url: 'https://kumacommunity.com',
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
        {to: '/blog', label: 'Blog', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Guides',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
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
              label: 'Other Polcies',
              to: '/Policies',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Cybear Technologies LLC DBA Kuma Community, Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
