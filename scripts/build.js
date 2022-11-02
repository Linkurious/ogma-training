const fs = require('fs').promises;
const copyDir = require('recursive-copy');
const path = require('path');
const distPath = './dist';


export default function ({ templatePath, contentPath }) {
  return {
    name: 'build-training',
    resolveId() { /* ... */ },
    generateBundle() {
      return Promise.all([
        fs.readFile(templatePath, { encoding: 'utf-8' }),
        fs.readFile(contentPath, { encoding: 'utf-8' }),
      ])
        .then(([template, content]) => {
          let titleMatch = content.match(/<p id="title">(.*)<\/p>/)[1];
          if (!titleMatch) {
            titleMatch = ['', 'Ogma training'];
          }
          const content = content.replace(titleMatch, '');
          return template.replace('{{title}}', titleMatch[1])
            .replace('{{content}}', content)
        })
        .then(html => fs.writeFile(path.join(distPath, 'index.html'), html))
        .then(() => copyDir(
          './menu/images',
          path.join(distPath, 'images'),
          { overwrite: true }
        )
        )
    },
  }
}