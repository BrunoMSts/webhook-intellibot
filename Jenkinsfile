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
      environment{
        scannerHome = tool "sonarqube-scanner"
      }
      steps {
        withSonarQubeEnv('sonarqube') {
          sh '''${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=tcc-project \
          -Dsonar.projectName=tcc-project \
          -Dsonar.projectVersion=1.0 \
          '''
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