const axios = require('axios')
const cheerio = require('cheerio')
const pluginsToRecomend = require('../../../recomender/plugins.json').plugins_to_recomend

async function riskAnalysisService(jenkinsURL, jobName, config, sonarURL, sonarToken, sonarProject, isUsingSlack) {
  const fulfillmentMessages = []
  const activePlugins = await getActivePlugins(jenkinsURL, config)
  const { pluginsToRecomend, isThereAnyToRecomend } = checkPlugins(activePlugins.plugins)
  const pluginsToUpdate = checkPluginsUpdate(activePlugins.plugins)

  fulfillmentMessages.push({
    text: {
      text: [`*Segue abaixo os detalhes da análise realizada*`]
    }
  })

  if(activePlugins.plugins.some(plugin => plugin.longName === "OWASP Dependency-Check Plugin")) {
    fulfillmentMessages.push({
      text: {
        text: [`Verifiquei que você possui o plguin: OWASP Dependency check.\nAqui está o link para relatório gerado
              \n${jenkinsURL}/job/${jobName}/lastBuild/execution/node/3/ws/dependency-check-report.html`
            ]
      }
    })
  }

  if(isThereAnyToRecomend) {
    fulfillmentMessages.push(
      {
        text: {
          text: [
            `Após uma varredura identifiquei a falta de alguns plugins que são bastante utilizados pela comunidade e pelo mercado.
              \nAqui estão algumas sugestões:`
          ]
        },
      },
    )
  }

  pluginsToRecomend.forEach(plugin => {
    fulfillmentMessages.push({ text: { text: [`>*• ${plugin}*`] }})
  })

  fulfillmentMessages.push({
    text: {
      text: [
        `Atualmente ${pluginsToUpdate.length} plugins precisam ser atualizados, o recomendável é manter sempre atualizado para evitar possíveis brechas de segurança da versão.
        Se quiser mais detalhes você pode conectar ao slack e solicitar novamente a análise!`
      ]
    }
  })
  
  fulfillmentMessages.push({
    text: {
      text: [
        `Esses plugins podem ser extramemente benéficos para sua pipeline, principalmente aqueles que servem para analise de código estatico como o SonarQube, VeraCode e relacionados.
        \nCom certeza os plugins vão te ajudar a ter um controle de segurança eficiente da sua pipeline.
        \nRecomendo a avaliar a necessidade da inclusão desses plugins na sua pipe.
        \nLembre-se que são apenas sugestões, você pode avaliar ou pesquisar outros plugins para adequar a necessidade do seu projeto; E assim manter sua pipe segura e livre de vulnerabildiades 💪`
      ]
    }
  })

  if(sonarURL) {
    const { sonarAnalysis, sonarSeverityResume } = await staticCodeCheck(normalizeUrl(sonarURL), sonarToken, sonarProject)
  
    fulfillmentMessages.push({
      text: {
        text: [
          `*-------------------------------------------------------*
           *Resultado do SonarQube 📊*
              *CODE_SMELLS* : ${sonarAnalysis.CODE_SMELL.length},
                  > MINOR  :  ${sonarSeverityResume[0].criticity?.MINOR ? sonarSeverityResume[0].criticity?.MINOR : 0} 
                  > MAJOR  :  ${sonarSeverityResume[0].criticity?.MAJOR ? sonarSeverityResume[0].criticity?.MAJOR : 0} 
                  > CRITICAL  :  ${sonarSeverityResume[0].criticity?.CRITICAL ? sonarSeverityResume[0].criticity?.CRITICAL : 0} 
                  > BLOCKER  :  ${sonarSeverityResume[0].criticity?.BLOCKER ? sonarSeverityResume[0].criticity?.BLOCKER : 0} 

              *BUGS* : ${sonarAnalysis.BUG.length}
                  > MINOR  :  ${sonarSeverityResume[1].criticity?.MINOR ? sonarSeverityResume[1].criticity?.MINOR : 0} 
                  > MAJOR  :  ${sonarSeverityResume[1].criticity?.MAJOR ? sonarSeverityResume[1].criticity?.MAJOR : 0} 
                  > CRITICAL  :  ${sonarSeverityResume[1].criticity?.CRITICAL ? sonarSeverityResume[1].criticity?.CRITICAL : 0} 
                  > BLOCKER  :  ${sonarSeverityResume[1].criticity?.BLOCKER ? sonarSeverityResume[1].criticity?.BLOCKER : 0} 

              *VULNERABILITES* : ${sonarAnalysis.VULNERABILITY.length}
                  > MINOR  :  ${sonarSeverityResume[2].criticity?.MINOR ? sonarSeverityResume[2].criticity?.MINOR : 0} 
                  > MAJOR  :  ${sonarSeverityResume[2].criticity?.MAJOR ? sonarSeverityResume[2].criticity?.MAJOR : 0} 
                  > CRITICAL  :  ${sonarSeverityResume[2].criticity?.CRITICAL ? sonarSeverityResume[2].criticity?.CRITICAL : 0} 
                  > BLOCKER  :  ${sonarSeverityResume[2].criticity?.BLOCKER ? sonarSeverityResume[2].criticity?.BLOCKER : 0}\n*-------------------------------------------------------*`
        ]
      }
    })
    fulfillmentMessages.push({
      text: {
        text: [
          `Segue uma descrição de cada problema, assim você consegue definir uma ordem de prioridade para quando for analisar:
            *MINOR*: Baixa gravidade, não possuem impacto imediato.
            *MAJOR*: Problemas significativos podendo afetar a funcionalidade ou desempenho do código.
            *BLOCKER*: Problemas críticos que impedem a compilação ou execução correta do código.
            *CRITICAL*: Problemas *URGENTES* podem causar falhas severas no sistema, violação de segurança e outros impactos graves.
          `
        ]
      }
    })
  }

  if(isUsingSlack) {
    const jenkinsWarnings = await extractAndFormatManageInfos(jenkinsURL, config)
    return { fulfillmentMessages, pluginsToUpdate, jenkinsWarnings }
  }

  return { fulfillmentMessages }
}

async function getActivePlugins(jenkinsURL, config) {
  const response = await axios.get(`${jenkinsURL}/pluginManager/api/json?depth=1`, config)
  return response.data
}

function checkPlugins(plugins) {
  plugins.forEach(plugin => {
    if(pluginsToRecomend.includes(plugin.longName)) {
      pluginsToRecomend.splice(pluginsToRecomend.indexOf(plugin.longName), 1)
    }
  })

  return { pluginsToRecomend, isThereAnyToRecomend: pluginsToRecomend.length > 0 ? true : false}
}

function normalizeUrl(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

async function staticCodeCheck(sonarURL, sonarToken, sonarProject) {
  const config = {
    headers: {
      Authorization: `Bearer ${sonarToken}`
    }
  }
  const response = await axios.get(`${normalizeUrl(sonarURL)}/api/issues/search?componentKeys=${sonarProject}`, config)
  console.log(`${normalizeUrl(sonarURL)}/api/issues/search?componentKeys=${sonarProject}`)
  const issues = response.data.issues
  const sonarAnalysis = {
    CODE_SMELL: [],
    BUG: [],
    VULNERABILITY: []
  }
  if(!issues) {
    return sonarAnalysis
  }

  issues.forEach(issue => {
    if(issue?.type === "CODE_SMELL") {
      sonarAnalysis.CODE_SMELL.push({
        component: issue.component,
        message: issue.message,
        severity: issue.severity
      })
    }
    if(issue?.type === "BUG") {
      sonarAnalysis.BUG.push({
        component: issue.component,
        message: issue.message,
        severity: issue.severity
      })
    }
    if(issue?.type === "VULNERABILITY") {
      sonarAnalysis.VULNERABILITY.push({
        component: issue.component,
        message: issue.message,
        severity: issue.severity
      })
    }
  })

  const sonarSeverityResume = [
    checkSeverity(sonarAnalysis.CODE_SMELL),
    checkSeverity(sonarAnalysis.BUG),
    checkSeverity(sonarAnalysis.VULNERABILITY),
  ]

  return {sonarAnalysis, sonarSeverityResume}
}

function checkSeverity(issues) {
  const resumeCode = {
    type: Object.keys(issues)[0],
    criticity: {MAJOR: 0, MINOR:0, CRITICAL:0, BLOCKER:0}
  }
  issues.forEach(issue => {
    switch(issue.severity) {
      case "MAJOR":
        ++resumeCode.criticity.MAJOR 
        break
      case "MINOR":
        ++resumeCode.criticity.MINOR 
        break
      case "CRITICAL":
        ++resumeCode.criticity.CRITICAL 
        break
      case "BLOCKER":
        ++resumeCode.criticity.BLOCKER
        break
    }
  })
  return resumeCode

}

function checkPluginsUpdate(plugins) {
  const pluginsToUpdate = []
  plugins.forEach(plugin => {
    if(plugin.hasUpdate && plugin.active) {
      pluginsToUpdate.push({
        pluginName: plugin.longName,
        currentVersion: plugin.version
      })
    }
  })
  return pluginsToUpdate
}

async function extractAndFormatManageInfos(jenkinsURL, config) {

  const res = await axios.get(`${jenkinsURL}/manage/`, config)

  const $ = cheerio.load(res.data); // Carregar o HTML usando Cheerio

  const dtElements = $('.alert.alert-danger dl'); // Selecionar todos os elementos <dt>

  const formattedText = dtElements.map((index, element) => {
    const dtText = $(element).text(); // Extrair o texto do elemento <dt>
    return dtText.trim(); // Formatar e remover espaços em branco
  }).get();

  return formattedText; // Retorna um array de textos formatados
}

module.exports = {
  riskAnalysisService,
  staticCodeCheck
}

//FAZER ANALISES DOS PLUGINS
//SUGERIR OS PLUGINS PARA SEGURANÇA
