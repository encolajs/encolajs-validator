import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Encolajs Validator",
  description: "Documentation for Encolajs Validator",
  base: "/validator/",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Installation', link: '/guide/' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Built-in rules', link: '/guide/validation-rules' },
          { text: 'Custom validation rules' , link: '/guide/custom-rules'},
          { text: 'Form validation', link: '/guide/form-validation' },
          {
            text: 'Advanced usage',
            items: [
              { text: 'Custom error messages' , link: '/guide/custom-errors'},
              { text: 'Complex validation patterns' , link: '/guide/complex-validation-patterns'},
              { text: 'Custom data sources' , link: '/guide/custom-data-sources'},
            ]
          },
        ]
      }
    ],
    footer: {
      message: 'MIT Licensed',
      copyright:
        'Copyright © 2025-present EncolaJS & Contributors',
    },
  }
}) 