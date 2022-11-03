import browsersync from 'rollup-plugin-browsersync';
import commonjs from '@rollup/plugin-commonjs';
import noderesolve from '@rollup/plugin-node-resolve';
import styles from "rollup-plugin-styles";
import copy from 'rollup-plugin-copy'
import fs from 'fs/promises'
import path from 'path';
import menu from './src/menu/index.js';
import slides from './scripts/build.js';

const trainingsDir = './src/trainings'
const dstDir = './dist'

// const PLAYGROUND_BASE = "https://doc.linkurio.us/ogma/latest"
const PLAYGROUND_BASE = "https://localhost:8000/dist/doc/"


function getOptions() {
  return fs.readdir(trainingsDir)
    .then(folders => folders
      .map((folder, i, folders) => {
        const dest = path.join(dstDir, folder);
        return {
          input:  "src/index.js",
          output: {
            file: path.join(dstDir, 'index.js'),
            format: 'iife',
          },
          plugins: [
            noderesolve({ browser: true }),
            commonjs(),
            styles(),
            slides({
              templatePath: path.resolve('./src/template.html'),
              contentFolder: path.join(trainingsDir, folder),
              PLAYGROUND_BASE,
              outFolder: dest,
            }),
            i === folders.length - 1
              ? copy({
                targets: [{
                  src: 'public',
                  dest: dstDir
                }]
              })
              : null,
            i === folders.length - 1
              ? menu()
              : null,
            process.env.ROLLUP_WATCH
              ? browsersync({
                server: 'dist/',
                port: 3002
              })
              : null,
          ].filter(e => e)
        }
      }))
}

export default getOptions;