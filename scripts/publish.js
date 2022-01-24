#!/bin/node
const rimraf = require("rimraf");
const ghpages = require('gh-pages');

ghpages.publish('dist', {
  add: true,
  branch: 'master',
  async beforeAdd(git) {
    return rimraf('dist')
  }
}, () => { console.log('published') });