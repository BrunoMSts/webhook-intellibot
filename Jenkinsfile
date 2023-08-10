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
      def scannerHome = tool 'SonarScanner';
      withSonarQubeEnv() {
        sh "${scannerHome}/bin/sonar-scanner"
      }
    }
  

  //   stage('SonarQube Analysis') {
  //     environment{
  //       scannerHome = tool "sonarqube"
  //     }
  //     steps {
  //       withSonarQubeEnv('sonarqube') {
  //         sh '''${scannerHome}/bin/sonar-scanner
  //         -Dsonar.projectKey=tcc-project \
  //         -Dsonar.sources=./src \
  //         -Dsonar.host.url=http://localhost:9000/ \
  //         -Dsonar.login=squ_9a3231bfdffc431817f4b153be09e9d3bda36859"
  //         '''
  //     }
  //   }
  // }
    // stage("Outlier Teste") {
    //   steps {
    //     echo "Iniciando tarefa longa"
    //     sleep time: 1800, unit: 'SECONDS'
    //     echo "Tarefa concluida"
    //   }squ_448831b52e7a37f2538480b9e792d9dd16804842
    // }
  }
}