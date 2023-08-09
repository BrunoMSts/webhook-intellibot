pipeline {
  agent any

  stages  {
    stage ("Inicial") {
      steps {
        echo "Iniciando a Pipe"
        sh "mvn clean install"
      }
    }
    stage("Scan") {
      steps {
        withSonarQubeEnv('sonarqube') {
          sh "mvn sonar:sonar"
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