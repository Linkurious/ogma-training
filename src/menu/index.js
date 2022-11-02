const fs = require('fs').promises;
const copyDir = require('recursive-copy');
const path = require('path');

const templatePath = './src/menu/template.html';
const trainingsPath = './src/trainings';
const distPath = './dist';

function getReportContent() {
  return fs
    .readdir(trainingsPath)
    .then(folders => {
      const rows = folders
        .reduce(
          (rows, folder) =>
            rows +
            `<li><a href="${folder}">${folder}</a></li>`,
          ''
        );
      return `<ul>${rows}<ul>`;
    })
    .then(ul => {
      const intro = `<h2>Omga trainings</h2>`;
      return intro + ul;
    });
}

function generateReport() {
  return Promise.all([
    fs.readFile(templatePath, { encoding: 'utf-8' }),
    getReportContent()
  ])
    .then(([template, content]) => {
      return template.replace('{{content}}', content)
      .replace('{{hash}}', Date.now());
    })
    .then(html => fs.writeFile(path.join(distPath, 'index.html'), html))
    .then(() => copyDir(
      './menu/images',
      path.join(distPath, 'images'),
      {overwrite: true}
      )
    )
}

export default function (options) {
  return {
    name: 'menu',
    buildStart() {
      this.addWatchFile("src/trainings")
    },
    resolveId() { /* ... */ },
    generateBundle() {
      return generateReport()
    },
  }
}
