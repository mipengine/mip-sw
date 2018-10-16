/**
 * @file rollup build script file
 * @author mj(zoumiaojiang@gmail.com)
 */

const fs = require('fs-extra')
const path = require('path')
const zlib = require('zlib')
const uglify = require('uglify-js')

let distDir = path.resolve(__dirname, '..', 'dist')

if (!fs.existsSync(distDir)) {
  fs.mkdirp(distDir)
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code = '') {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

function p (num) {
  return num < 10 ? `0${num}` : num
}

function getTimeVersion () {
  let time = new Date()
  return '' + time.getFullYear() +
    p(time.getMonth() + 1) +
    p(time.getDate()) +
    p(time.getHours()) +
    p(time.getMinutes()) +
    p(time.getSeconds())
}

let sourceCode = fs.readFileSync(path.resolve(__dirname, '..', 'mip-sw.js'), 'utf8')
sourceCode = sourceCode.replace('__BUILD_TIME__', getTimeVersion())

var minifiedCode = uglify.minify(sourceCode).code

if (minifiedCode) {
  write(path.resolve(distDir, 'mip-sw.js'), minifiedCode, true)
} else {
  console.log(blue('build faild!'))
}
