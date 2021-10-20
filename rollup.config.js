import browsersync from 'rollup-plugin-browsersync';
import commonjs from '@rollup/plugin-commonjs';
import noderesolve from '@rollup/plugin-node-resolve';
import styles from "rollup-plugin-styles";
import copy from 'rollup-plugin-copy'
import fs from 'fs/promises'
import path from 'path';
import menu from './menu/index.js';


const trainingsDir = './trainings'
const dstDir = './dist'


function getOptions() {
  return fs.readdir(trainingsDir)
    .then(folders => folders.map((folder, i, folders) => {
      const dest = path.join(dstDir, folder);
      return {
        input: path.join(trainingsDir, folder, "src/index.js"),
        output: {
          file: path.join(dstDir, folder, 'index.js'),
          format: 'iife',
        },
        plugins: [
          noderesolve({ browser: true }),
          commonjs(),
          styles(),
          copy({
            targets: [
              {
                src: path.join(trainingsDir, folder, '/src/index.html'),
                dest,
                hook: 'writeBundle',
                transform: (contents, filename) => {
                  const match = contents.toString().match(/Comment gerer des gros Datasets.*/)
                  console.log('content',filename, contents.toString())
                  return contents
                },
                copyOnce: false
              },
              {
                src: path.join(trainingsDir, folder, '/src/styles.css'),
                dest
              },
              {
                src: path.join(trainingsDir, folder, '/src/images'),
                dest
              },
            ]
          }),
          i === folders.length - 1
            ? copy({targets: [{
              src: 'public',
              dest: dstDir
            }]})
            :null,
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