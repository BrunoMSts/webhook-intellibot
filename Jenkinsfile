pipeline {
  agent any

  stages  {
    stage ("Inicial") {
      steps {
        echo "Iniciando a Pipe"
      }
    }
    stage("Scan") {
      steps {
        def mvnHome = tool name: "Maven-3.8.4", type: "maven"
        withSonarQubeEnv(installationName: 'sonarqube') {
          sh "${mvnHome}/bin/mvn sonar:sonar"
        }        
      }
    }
    // stage("Outlier Teste") {
    //   steps {
    //     echo "Iniciando tarefa longa"
    //     sleep time: 1800, unit: 'SECONDS'
    //     echo "Tarefa concluida"
    //   }
    // }
  }
}