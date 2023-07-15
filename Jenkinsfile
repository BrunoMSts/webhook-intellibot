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
        echo "Escaneando"
        echo "Gerando relatórios"
        dependencyCheck additionalArguments: '--scan . --format HTML --format JSON', odcInstallation: 'intellibot-dp-check'
      }
    }
  }
}