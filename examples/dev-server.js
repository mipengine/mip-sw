/**
 * @file dev server
 * @author mj(zoumiaojiang@gmail.com)
 */

const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(path.join(__dirname, '../')))

const port = process.env.PORT || 8848
module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
  console.log(`View http://localhost:${port}/examples/index.html`)
})
