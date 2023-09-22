const axios = require('axios')

async function anomalyDetectionService(jenkinsURL, jobName, config) {
  const fullfilment = await getExecutionTime(jenkinsURL, jobName, config)
  return fullfilment
}

async function getExecutionTime(jenkinsURL, jobName, config) {
  console.log(`${jenkinsURL}/job/${jobName}/api/json`)
  const response = await axios.get(
    `${jenkinsURL}/job/${jobName}/api/json`,
    config
  );
  console.log(`${jenkinsURL}/job/${jobName}/api/json`)
  const allBuildsExecution = response.data.builds
  const buildDurations = []
  const buildTestsResults = []
  const fulfillmentMessages = [
    {
      text: {
        text: [
          `Sua pipeline possui o total de : ${response.data.builds.length} builds`,
        ],
      },
    },
  ];

  let totalDuration = 0

  allBuildsExecution.slice(0,5).forEach(async (build) => {
    const {result} = await getBuildsTestResult(build.number, jenkinsURL, jobName, config)
    buildTestsResults.push({buildNumber: build.number, buildResult: result})
  })

  for (let buildNumber = 1; buildNumber <= allBuildsExecution.slice(0,5).length; buildNumber++ ) {
    const buildDuration = await getBuildDuration(buildNumber, jenkinsURL, jobName, config)
    totalDuration += buildDuration
    buildDurations.push({buildDuration, buildNumber: allBuildsExecution[buildNumber-1].number})
  }

  buildDurations.sort((a, b) => a.buildDuration - b.buildDuration);
  const medianIndex = Math.floor(buildDurations.length / 2);
  const firstQuartileIndex = Math.floor(medianIndex / 2);
  const thirdQuartileIndex = Math.floor(medianIndex + medianIndex / 2);
  const median = buildDurations.length % 2 === 0 ? (buildDurations[medianIndex - 1] + buildDurations[medianIndex]) / 2 : buildDurations[medianIndex];
  const firstQuartile = buildDurations[firstQuartileIndex].buildDuration;
  const thirdQuartile = buildDurations[thirdQuartileIndex].buildDuration;
  const iqr = thirdQuartile - firstQuartile;

  // Definir critérios para outliers
  const lowerBound = firstQuartile - 0.2 * iqr;
  const upperBound = thirdQuartile + 0.2 * iqr;

  // Identificar outliers
  const outliers = buildDurations.filter((duration) => duration.buildDuration < lowerBound || duration.buildDuration > upperBound);

  const outliersResult = outliers.map(outlier => {
    return {
      buildNumber: outlier.buildNumber,
      buildDuration: outlier.buildDuration / 1000
    }
  })

  totalDuration = totalDuration / allBuildsExecution.length / 1000

  fulfillmentMessages.push({ text: { text: [
    `Registramos o tempo médio das últimas 20 builds da sua pipe -> ${totalDuration.toFixed(2)} segundos`
  ]}})
  fulfillmentMessages.push({ text: { text: [
    `Resultados das últimas 5 builds:\n`
  ]}})

  let failuresCount = 0
  let successCount = 0
  buildTestsResults.forEach(result => {
    if(result.buildResult === "FAILURE") {
      failuresCount++;
      fulfillmentMessages.push({
        text: {
          text: [`A build #${result.buildNumber} apresentou o resultado ${result.buildResult} sugiro analisar o que ocorreu. Se você ja tem ciência do motivo, por favor ignore a mensagem`]
        }
      })
    } else {
      successCount++;
      fulfillmentMessages.push({
        text: {
          text: [`
            ---------------------------\nBuild #${result.buildNumber}\nResultado: ${result.buildResult}
            `
          ]
        }
      })
    }
  })

  if(failuresCount > successCount) {
    fulfillmentMessages.push({
      text: {
        text: [`A quantidade de falhas foi maior que a quantidade de sucesso. Sugiro avaliar esses casos!`]
      }
    })
  }

  if(outliersResult.length > 0) {
    outliersResult.forEach(result => {
      fulfillmentMessages.push({
        text: {
          text: [`Outliers encontrados:
                  \n• Numero da build ${result.buildNumber}
                  Duração da build: ${result.buildDuration.toFixed(2)} segundos`]
        }
      })
    })

    fulfillmentMessages.push({
      text: {
        text: ["\nEsses outliers podem estar prejudicando as métricas de sua build, sugiro analisar o que ocorreu aqui!"]
      }
    })
  } else {
    fulfillmentMessages.push({
      text: {
        text: [`Nenhum outlier encontrado!`]
      }
    })
  }

  return fulfillmentMessages

}

async function getBuildDuration(buildNumber, jenkinsURL, jobName, config) {
  try {
    const response = await axios.get(`${jenkinsURL}/job/${jobName}/${buildNumber}/api/json?tree=duration`, config)

    return response.data.duration
  } catch (error) {
    throw error
  }
}

async function getBuildsTestResult(buildNumber, jenkinsURL, jobName, config) {
  const response = await axios.get(`${jenkinsURL}/job/${jobName}/${buildNumber}/api/json?tree=result`, config)
  return response.data
}


module.exports = {
  anomalyDetectionService
}

//TODO -> CRIAR VARIAS OPÇÕES PARA O USUARIO PRA NÃO PRECISAR FAZER TUDO DE UMA VEZ
//PERGUNTAR O QUE ELE DESEJA
//1 - Taxa de sucesso e tempo médio das builds? -> de quantas builds anteriores até 20? Permitir o user digitar a quantidade
//2 - Verificar outliers em um numero escolhido por ele de builds
//3 - Taxa de sucesso de testes
//