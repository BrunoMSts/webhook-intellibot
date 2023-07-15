pipeline {
  agent any

  stages  {
    stage ("Inicial") {
      steps {
        echo "Iniciando a Pipe"
      }
    }
    stage ("Checkout Intellibot Repo") {
      steps {
        withCredentials([usernamePassword(credentialsId: 'Jenkins_Token', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')])
        script {
          // Defina o diretório de trabalho para o repositório clonado
          def repoDir = './webhook-intellibot'

          // Execute o comando git com as credenciais fornecidas
          sh "git -c http.extraheader=\"Authorization: Basic ${GIT_USERNAME}:${GIT_PASSWORD}\" clone https://github.com/BrunoMSts/webhook-intellibot.git ${repoDir}"
        }
      }
    }
    stage ("Dependency check") {
      steps {
        echo "Escaneando"
        echo "Gerando relatórios"
        dependencyCheck additionalArguments: '--scan ./webhook-intellibot --format HTML --format JSON', odcInstallation: 'intellibot-dp-check'
      }
    }
  }
}