pipeline {
  agent any

  tools {
    maven "maven3"
    jdk "jdk11"
  }

  stages  {
    stage ("Inicial") {
      steps {
        echo "Iniciando a Pipe"
      }
    }

    stage("Install Dependencies") {
      steps {
        sh 'npm install'
      }
    }


    stage('SonarQube Analysis') {
      steps {        
        script {
          def scannerHome = tool 'sonarqube-scanner';
          withSonarQubeEnv() {
            sh "${scannerHome}/bin/sonar-scanner"
          }
        }
      }
    }
  
    stage("Outlier Teste") {
      steps {
        echo "Iniciando tarefa longa"
        sleep time: 1800, unit: 'SECONDS'
        echo "Tarefa concluida"
      }
    }
  }
}