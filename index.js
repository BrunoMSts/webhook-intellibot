const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3000

app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.send("OK")
} )

app.post("/", (req, res) => {
  console.log(req.body)
  res.json({ "fulfillmentText": "Etou aqui, estou esperando" })
})

app.listen(PORT ,() => {
  console.log(`Servidor rodando na porta ${PORT}`)
})