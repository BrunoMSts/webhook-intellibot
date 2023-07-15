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
        dependencyCheck additionalArguments: '--format HTML&JSON', odcInstallation: 'intellibot-dp-check'
      }
    }
  }
}