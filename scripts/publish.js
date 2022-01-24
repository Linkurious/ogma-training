#!/bin/node
const rimraf = require("rimraf");
const copy = require("recursive-copy");

new Promise((resolve, reject) => {
  rimraf('docs', (err) => {
    if (err) {
      return reject(err)
    }
    resolve()
  })
})
.then(() =>copy('dist', 'docs'))
.catch(function(error) {
  console.error('Publish failed: ' + error);
}).then(() => {
  console.log('Publish complete. Just commit docs/ and push on master.');
})
  