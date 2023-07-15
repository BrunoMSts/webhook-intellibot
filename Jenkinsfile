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
        dependencyCheck additionalArguments: '--scan . --format HTML', odcInstallation: 'intellibot-dp-check'
        echo "Gerando relatório em JSON"
        dependencyCheck additionalArguments: '--scan . --format JSON', odcInstallation: 'intellibot-dp-check'
      }
    }
  }
}