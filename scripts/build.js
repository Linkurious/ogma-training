const fs = require('fs').promises;
const path = require('path');

export default function ({ templatePath, contentPath,folder, outPath }) {
  return {
    name: 'build-training',
    resolveId() { /* ... */ },
    generateBundle() {
      return Promise.all([
        fs.readFile(templatePath, { encoding: 'utf-8' }),
        fs.readFile(contentPath, { encoding: 'utf-8' }),
      ])
        .then(([template, slides]) => {
          let titleMatch = slides.match(/<p id="title">(.*)<\/p>/);
          if (!titleMatch) {
            titleMatch = ['', 'Ogma training'];
          }
          slides = slides.replace(titleMatch[0], '')
            .replaceAll('<section>', '<section data-background-image="../public/background.png">');
          return template
            .replace('{{title}}', titleMatch[1])
            .replace('{{slides}}', slides)
            .replace('{{index.js}}', `${folder}/index.js`);

        })
        .then(html => {
          return fs.mkdir(outPath, { recursive: true })
            .then(() => fs.writeFile(path.join(outPath, 'index.html'), html))
        })
        .catch(e => {
          console.log("error here", e)
        })
    },
  }
}