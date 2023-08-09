pipeline {
  agent any

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
      def scannerHome = tool 'sonarqube-scanner';
      withSonarQubeEnv() {
        sh "${scannerHome}/bin/sonar-scanner"
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