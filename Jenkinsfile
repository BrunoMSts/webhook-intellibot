pipeline {
  agent any

  stages  {
    stage ("Inicial") {
      steps {
        echo "Iniciando a Pipe"
      }
    }
    stage ("Dependency check") {
      steps {
        echo "Gerando relatório em HTML"
        dependencyCheck additionalArguments: '--format HTML', odcInstallation: 'intellibot-dp-check'
        echo "Gerando relatório em JSON"
        dependencyCheck additionalArguments: '--format JSON', odcInstallation: 'intellibot-dp-check'
      }
    }
  }
}