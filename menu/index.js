const fs = require('fs').promises;
const copyDir = require('recursive-copy');
// const rimraf = require('rimraf');
const path = require('path');

const templatePath = './menu/template.html';
const trainingsPath = './trainings';
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
        console.log(rows)
      return `<ul>${rows}<ul>`;
    })
    .then(ul => {
      const intro = `<h2>Omga trainings</h2>`;
      return intro + ul;
    });
}

function rm(path) {
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) return reject(err);
      resolve();
    });
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
  console.log("MENU")
  return {
    name: 'menu',
    load() {
      this.addWatchFile(path.resolve('./menu/index.js'));
      this.addWatchFile(path.resolve('./menu/template.html'));
    },
    resolveId() { /* ... */ },
    generateBundle() {
      return generateReport()
    },
  }
}
