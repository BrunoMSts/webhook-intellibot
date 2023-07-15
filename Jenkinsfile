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
        dependencyCheck '--scan . --format HTML'
        echo "Gerando relatório em JSON"
        dependencyCheck '--scan . --format JSON'
      }
    }
  }
}