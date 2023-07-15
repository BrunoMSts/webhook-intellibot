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
        echo "Cloning repo"
        git "https://github.com/BrunoMSts/webhook-intellibot.git"
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