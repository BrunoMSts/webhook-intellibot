const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const fs = require('fs')

const intents = require('./intents.json')
const { setInterval } = require('timers/promises')

const app = express()
const PORT = 3000

function redirectLogToArchive(texto) {
  fs.writeFileSync('./logs/log.txt', texto + '\n', { flag: 'a' })  
}

const jenkinsURL = 'http://143.198.110.110:8080'
const jobName = 'intellibot'
const config = {
  auth: {
    username: "brunobot",
    password: "brunobot"
  }
}

async function getPipeInfos() {
  try {
    const response = await axios.get(`${jenkinsURL}/job/${jobName}/lastBuild/api/json`, config)
    // redirectLogToArchive(JSON.stringify(buildData))
    return response.data

  } catch (error) {
    console.error("Error ao obter response" + error)

  }
}

async function getPipeSecurityInfos() {
  try {
    const response = await axios.get(`${jenkinsURL}/api/json?tree=useSecurity`, config)
    return response.data
  } catch (error) {
    console.error("Error ao obter response" + error)
  }
}

async function getLastBuild() {
  try {
    const lastBuild = await axios.get(`${jenkinsURL}/job/${jobName}/lastBuild/buildNumber`, config)
    return lastBuild.data
  } catch (error) {
    console.error("Error ao obter response" + error)
  }
}

async function getBuildInfos() {
  try {
    const lastBuild = await getLastBuild()
    const response = await axios.get(`${jenkinsURL}/job/${jobName}/${lastBuild}/consoleText`, config)
    return response.data
  } catch (error) {
    console.error("Error ao obter response" + error)
  }
}

function formatBuildInfos(buildInfos) {
  let buildFormated = buildInfos.split("stage").filter(elem => !elem.includes("> git"))
  console.log(buildFormated)
  // buildInfos.split("stage").forEach(splitted => {
  //   console.log(splitted + "END")
  // })
  
}

app.use(bodyParser.json())

app.get("/", async (req, res) => {
  res.json({status: "OK"})
} )

app.post("/", async (req, res) => {

  const intentName = req.body.queryResult.intent.displayName

  if(intentName === intents.security_intents.types.analysis) {

    const pipeInfos = await getPipeInfos()
    const buildInfos = await getBuildInfos()
    formatBuildInfos(buildInfos)
    const { fullDisplayName, result, timestamp } = pipeInfos

    let botResponse = {"fulfillmentText":`Análise realizada. Aqui estão algumas informações sobre sua pipe.
                                            Nome: ${fullDisplayName}
                                            Resultado: ${result}
                                            Tempo: ${new Date(timestamp)}
                                            Build: ${buildInfos}` }

    const pipeSecurityInfos = await getPipeSecurityInfos()
    // botResponse = pipeSecurityInfos.useSecurity ? "Sua pipe esta com a flag useSecurity ativada." : "Sua pipe esta com a flag useSecurity desativada. Considere ativar imediatamente."
    //COLOCAR VARIAS RESPONSES NO BOT
    res.json(botResponse)
    // res.json({ 
    //   "fulfillmentText": [
    //     {

    //     }
    //   ], 
    // })
  }

  console.log(intentName)  

  // res.json({ "fulfillmentText": "Etou aqui, estou esperando" })
})

app.listen(PORT ,() => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

//VERIFICAR VERSÃO DO JENKINS, VERIFICAR MINHA V E VER SE EXISTE UMA MAIS ATUAL, POSSO FAZER UMA BUSCA NO OWASP PESQUISANDO POR VULNERABILIDADES DAQUELA VERSÂO.
