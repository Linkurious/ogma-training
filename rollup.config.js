import browsersync from 'rollup-plugin-browsersync';
import commonjs from '@rollup/plugin-commonjs';
import noderesolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'
import fs from 'fs/promises'
import path from 'path';

const trainingsDir = './trainings'
const dstDir = './dist'


function getOptions() {
  return fs.readdir(trainingsDir)
    .then(folders => folders.map((folder, i) => {
      const dest = path.join(dstDir, folder);
      return {
        input: path.join(trainingsDir, folder, "src/index.js"),
        output: {
          file: path.join(dstDir,folder ,'index.js'),
          format: 'iife',
        },
        plugins: [
          noderesolve({ browser: true }),
          commonjs(),
          copy({
            targets: [
              {
                src: path.join(trainingsDir, folder, '/src/index.html'),
                dest
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
          process.env.ROLLUP_WATCH
          ? browsersync({
              server: 'dist/',
              port: 3002
            })
          : null
        ]
      }
    }))
}

export default getOptions;