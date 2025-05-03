import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "EncolaJS Validator",
  description: "Documentation for EncolaJS Validator",
  base: "/validator/",
  head: [['link', { rel: 'icon', href: '/validator/favicon.ico' }]],
  themeConfig: {
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/encolajs/encolajs-validator/tree/main/docs/:path'
    },
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/encolajs/encolajs-validator' },
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/docs/' },
      { text: 'More...',
        items: [
          {text: 'EncolaJS Enforma', link: 'https://encolajs.com/enforma/'},
          {text: 'EncolaJS Hydrator', link: 'https://encolajs.com/hydrator/'},
        ]
      },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Installation', link: '/docs/' },
          { text: 'Getting Started', link: '/docs/getting-started' },
          { text: 'Common validation patterns', link: '/docs/common-patterns' },
          { text: 'Built-in validation rules', link: '/docs/validation-rules' },
          { text: 'Custom validation rules' , link: '/docs/custom-rules'},
          { text: 'Form validation', link: '/docs/form-validation' },
        ]
      },
      {
        text: 'Advanced usage',
        items: [
          { text: 'Custom error messages' , link: '/docs/custom-errors'},
          { text: 'Complex validation patterns' , link: '/docs/complex-validation-patterns'},
          { text: 'Custom data sources' , link: '/docs/custom-data-sources'},
        ]
      },
    ],
    footer: {
      message: 'MIT Licensed',
      copyright:
        'Copyright © 2025-present EncolaJS & Contributors',
    },
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**'],
      }
    }
  }
}) 