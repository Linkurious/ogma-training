const fs = require('fs').promises;
const path = require('path');
const copyDir = require('recursive-copy');

export default function ({ templatePath, PLAYGROUND_BASE,contentFolder, outFolder }) {
  return {
    name: 'build-training',
    resolveId() { /* ... */ },
    generateBundle() {
      return Promise.all([
        fs.readFile(templatePath, { encoding: 'utf-8' }),
        fs.readFile(path.resolve(contentFolder, 'index.html'), { encoding: 'utf-8' }),
      ])
        .then(([template, slides]) => {
          let titleMatch = slides.match(/<p id="title">(.*)<\/p>/);
          if (!titleMatch) {
            titleMatch = ['', 'Ogma training'];
          }
          slides = slides.replace(titleMatch[0], '')
            .replaceAll('https://doc.linkurio.us/ogma/latest/', PLAYGROUND_BASE)
            .replaceAll('<section>', '<section data-background-image="../public/background.png">');
          return template
            .replace('{{title}}', titleMatch[1])
            .replace('{{slides}}', slides)

        })
        .then(html => {
          return fs.mkdir(outFolder, { recursive: true, })
            .then(() => fs.writeFile(path.join(outFolder, 'index.html'), html))
        })
        .then(() => {
          return fs.readdir(path.resolve(contentFolder), { withFileTypes: true })
            .then(content => {
              return Promise.all(content
                .filter(c => !c.isFile())
                .map(c => {
                  return copyDir(
                  path.join(contentFolder, c.name),
                  path.resolve(path.join(outFolder, c.name)),{
                    overwrite: true
                  }
                )}))
            })

        })
        .catch(e => {
          console.log("error here", e)
        })
    },
  }
}