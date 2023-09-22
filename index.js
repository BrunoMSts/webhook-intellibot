const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const fs = require('fs')
const { Configuration, OpenAIApi } = require("openai")
const { anomalyDetectionService } = require('./src/app/services/anomaly_detection_service')
const { riskAnalysisService, staticCodeCheck } = require('./src/app/services/risk_analysis_service')
const path = require('path');

const app = express()
app.use(bodyParser.json())
const PORT = 3000

function redirectLogToArchive(texto) {
  fs.writeFileSync('./logs/log.txt', texto + '\n', { flag: 'a' })  
}

let jenkinsURL = '' 
let slackURL = ''
let sonarQubeURL = ''
let defautlIntent = false
let isUsingSlack = false
let isUsingSonar = false
let jobName = '' 
let sonarProjectName = ''
let config = {
  auth: {
    username: "",
    apiToken: ""
  },
  sonarAuth: {
    token: ""
  }
}

let sonarData = ''

app.use(bodyParser.json())

app.get("/", async (req, res) => {
  const pagesPath = path.join(__dirname, 'src', 'app', 'pages')
  res.sendFile(path.join(pagesPath, 'index.html'));
} )

app.get('/chart', (req, res) => {
  const pagesPath = path.join(__dirname, 'src', 'app', 'pages', 'chart')
  res.sendFile(path.join(pagesPath, 'index.html'));
});

app.get('/graphs', async (req, res) => {
  if(sonarQubeURL) {
    const {sonarAnalysis} = await staticCodeCheck(sonarQubeURL, config.sonarAuth.token, sonarProjectName)
    res.json({
      BUG: sonarAnalysis.BUG,
      CODE_SMELL: sonarAnalysis.CODE_SMELL,
      VULNERABILITY: sonarAnalysis.VULNERABILITY
    })
  }
  else {
    res.json({ msg: "Não há gráfico disponível. Conecte ao sonar ou Verifique as credenciais!" })
  }
})

app.post("/webhook", async (req, res) => {
  const intentName = req.body.intentInfo?.displayName

  if(intentName === "Default Welcome Intent" ) {
    defautlIntent = true
    res.json({
      fulfillment_response: {
        messages: [
          {
            text: {
              text: [`Olá 👋! Sou seu assistente virutal e vou tentar te ajudar com sua pipeline Jenkins 🤖.`]
            }
          },
          {
            text: {
              text: ["Para uma melhor experiência, recomendo a utilização do slack; Desse modo você conseguirá receber os relatórios diretamente no canal escolhido. Mas sinta se a vontade para ficar por aqui também!"]
            }
          },
          {
            text: {
              text: ["Para começarmos, primeiro me informe a url onde seu jenkins está hospedado"]
            }
          }
        ]
      }
    })
  }

  if(req.body.fulfillmentInfo?.tag === "jenkinsUrl") {
    jenkinsURL = req.body.sessionInfo.parameters.jenkinsurl
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "login") {
    config.auth.username = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "apiToken") {
    config.auth.apiToken = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "jobName") {
    jobName = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "sonarURL") {
    sonarQubeURL = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "sonarToken") {
    config.sonarAuth.token = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "sonarProject") {
    sonarProjectName = req.body.text
    isUsingSonar = true
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "slackUrl") {
    slackURL = req.body.text
    isUsingSlack = true
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "anomalyAnalysis") {
    const configJenkins = {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.auth.username}:${config.auth.apiToken}`).toString('base64')}`
      }
    }

    if(isUsingSlack) {
      res.json({
        fulfillment_response: {
          messages: [
            {
              text: {
                text: ["Análise iniciada, assim que terminamos enviaremos os resultados para o seu canal do slack."]
              }
            }
          ]
        }
      })
      await axios.post(slackURL, { text: `*------ ☣️ Iniciada a detecção de anomalias ☣️ ------*` })
      const response = await anomalyDetectionService(jenkinsURL, jobName, configJenkins)
      response.forEach(async (res) => {
        const msg = res.text.text
        await axios.post(slackURL, { text: `${msg}` })
      })
    } else {
      const response = await anomalyDetectionService(jenkinsURL, jobName, configJenkins)
      res.json({
        fulfillment_response: {
          messages: response
        }
      })
    }
  }

  if(req.body.fulfillmentInfo?.tag === "riskAnalysis") {

    const configJenkins = {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.auth.username}:${config.auth.apiToken}`).toString('base64')}`
      }
    }

    if(isUsingSlack) {
      res.json({
        fulfillment_response: {
          messages: [
            {
              text: {
                text: ["Análise iniciada, assim que terminamos enviaremos os resultados para o seu canal do slack."]
              }
            }
          ],
        }
      })
      await axios.post(slackURL, { text: `*------ 🚨 Iniciada a análise de riscos 🚨 ------*` })
      const response = await riskAnalysisService(jenkinsURL, jobName, configJenkins,  sonarQubeURL, config.sonarAuth.token, sonarProjectName, isUsingSlack)
      response.fulfillmentMessages.forEach(async (res) => {
        const msg = res.text.text
        await axios.post(slackURL, { text: `${msg}` })
      })
      await axios.post(slackURL, { text: `*------ 🚨 Plugins que precisam ser atualizados 🚨 ------*` })
      response.pluginsToUpdate.forEach(async (plugin) => {
        await axios.post(slackURL, { 
          text: `----------------------------------------\n>*Nome*: ${plugin.pluginName}\n>*Versão Atual*: ${plugin.currentVersion}\n----------------------------------------`
        })
      })
      await axios.post(slackURL, { text: `* 🚨 Aqui estão algumas informações importantes que recuperei do seu do jenkins*` })
      response.jenkinsWarnings.forEach(async (warning) => {
        await axios.post(slackURL, { text: `Warning sinalizado pelo jenkins -> >*${warning}*` })
      })

    } else {
      const { fulfillmentMessages } = await riskAnalysisService(jenkinsURL, jobName, configJenkins)
      res.json({
        fulfillment_response: {
          messages: fulfillmentMessages,

        }
      })
    }
  }

  if(req.body.fulfillmentInfo?.tag === "buildPipeline") {

    const configJenkins = {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.auth.username}:${config.auth.apiToken}`).toString('base64')}`
      }
    }

    const crumbUrl = await axios.get(`${jenkinsURL}/crumbIssuer/api/json`, configJenkins)
    const crumberHeader = crumbUrl.data.crumbRequestField

    const headers = {
      ...configJenkins.headers,
      [crumberHeader]: crumbUrl.data.crumb,
    }

    if(isUsingSlack) {
      await axios.post(slackURL, { text: `*------ ✅ Build da Pipeline ${jobName} iniciado ✅ ------*` })
      await axios.post(`${jenkinsURL}/job/${jobName}/build`, null, { headers })
      const response = await axios.get(`${jenkinsURL}/job/${jobName}/lastBuild/api/json`, configJenkins)
      const slackMsg = {
        text: `Resultados da build:
                ID: ${response.data.id}
                Duração: ${response.data.duration / 1000} Segundos,
                Em progresso: ${response.data.inProgress === true ? "Sim" : "Não" },
                Resultado: ${response.data.result}`,
      }
      await axios.post(slackURL, slackMsg)
    } else {
      await axios.post(`${jenkinsURL}/job/${jobName}/build`, null, {
        headers
      })
      res.json({
        fulfillment_response: {
          messages: [
            {
              text: {
                text: [
                  `Build para o job ${jobName} Iniciada.
                  Verifique seu jenkins!
                `]
              }
            }
          ]
        }
      })
    }
  }


// intellibot
// 11d6af1ee95e4ddadb8f1b2ab66c96134e
// squ_088186eb9b7ac05dc37f9f20ccaebdce9cb35539
//SE DER TEMPO IMPLEMENTAR UM SITE RAPIDO PARA HOSPEDAR O INTELLIBOT E SER CAPAZ DE GERAR GRAFICO PARA O CLIENTE. CARA ACHO QUE SÓ ISSO TA BOM



// TIRAR UNS PRINTS, MOSTRANDO ONDE DEVE SER COLOCADA AS CONFIGS, O QUE PRECISA. 
// ESCREVER QUE PODE USAR O AZURE PARA SALVAR ESSES SECRETS.
// VOU "DETALHAR" COMO FAZER O SETUP DO PROJETO
// E COMEÇAR A FALAR DAS LIMITAÇÕES E PROJETOS FUTUROS, INTEGRAAR COM MAIS AMBIENTES. FACILITAR A VIDA DO DEV.
// INTEGRAR COM COMANDOS SLASH DO SLACK. VOU FAZER O SEGUINTE, COLOCAR UMA OPÇÃO PARA O DEV BAIXAR O REPO, E FAZER A CONFIG DO SLACK, PARA FICAR MONITORANDO A PIPE. <-- IMPORTANTE. DEVO COLOCAR ALGUNS COMANDOS SIM. 
// CRIAR UM MONITORAMENTO ATIVO QUE FICA OBSERVANDO A PIPE. ASSIM QUE RODAR UM BUILD VERIFICAR MUDANÇAS NO QUALITYGATE SONARQUBE, INFORMAR QUE HOUVE DEGRADAÇÃO.
// A LIB VAI FUNCIONAR APENAS PRO SLACK, POR ENQUANTO.
// PRECISO AJUSTAR OS CONTROLLERS.
// SETUP DO PROJETO



      
})

app.listen(PORT ,() => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

