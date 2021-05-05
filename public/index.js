const express = require('express')
const fs = require('fs');
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

app.use(express.static('public'))

app.get('/hello', (req, res) => {
  res.send('Hello World!')
})

app.post('/form', (req, res) => {
  fs.writeFileSync('public/nodes.json', JSON.stringify(req.body.nodes));
  fs.writeFileSync('public/links.json', JSON.stringify(req.body.links));
  res.send('OK')
})

app.get('/reset', (req, res) => {
  fs.copyFile('public/nodesBACK.json', 'public/nodes.json', (err) => {
      if (err) throw err;
      console.log('backup nodes.json');
  });
  fs.copyFile('public/linksBACK.json', 'public/links.json', (err) => {
      if (err) throw err;
      console.log('backup links.json');
  });
  res.send('OK')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
