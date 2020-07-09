
import { configuration } from '@codedoc/core';
import { codingBlog } from '@codedoc/coding-blog-plugin';
import { formulaPlugin } from '@codedoc/core/components';

import { theme } from './theme';



export const config = /*#__PURE__*/configuration({
  theme,
  src: {
    base: 'posts'
  },
  dest: {
    namespace: '/coding-blog-boilerplate',    // --> change this if you want to also deploy to GitHub Pages
    html: 'dist',
    assets: process.env.GITHUB_BUILD === 'true' ? 'dist' : '.',
    bundle: process.env.GITHUB_BUILD === 'true' ? 'bundle' : 'dist/bundle',
    styles: process.env.GITHUB_BUILD === 'true' ? 'styles' : 'dist/styles',
  },
  page: {
    title: {
      base: 'Sajad\'s blog'         // --> change this to change your blog's title
    },
    favicon: '/favicon.ico'
  },
  plugins: [
    codingBlog({
      assets: [
        'img',
        'favicon.ico',
      ]
    }),
    formulaPlugin
  ],
  misc: {
    github: {
      repo: 'coding-blog-boilerplate',
      user: 'CONNECT-platform'
    }
  }
});
