pipeline {
  agent any

  stages  {
    stage ("Inicial") {
      steps {
        echo "Iniciando a Pipe"
      }
    }
    stage("Outlier Teste") {
      steps {
        echo "Iniciando tarefa longa"
        sh """
            for i in {1..100000}; do
              echo 'Executando tarefa $i'
            done
            sleep 1800
        """
        echo "Tarefa concluida"
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