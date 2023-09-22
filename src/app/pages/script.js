const chatContent = document.getElementById('chat-content');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
  const userMessage = userInput.value;
  if (userMessage.trim() !== '') {
    displayMessage(userMessage, 'user');
    // Aqui você pode chamar a função que envia a mensagem para o Dialogflow e recebe a resposta do agente
    // Após receber a resposta, você pode exibi-la chamando a função displayMessage com o texto da resposta e o tipo 'agent'
    userInput.value = '';
  }
}

function displayMessage(message, type) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(type);
  messageElement.innerText = message;
  chatContent.appendChild(messageElement);
  chatContent.scrollTop = chatContent.scrollHeight;
}

// Função para enviar mensagem para o Dialogflow e exibir a resposta
// Substitua a chamada abaixo pela integração real com o Dialogflow
function sendToDialogflow(message) {
  // Aqui você pode implementar a lógica para enviar a mensagem para o Dialogflow e receber a resposta do agente
  // Por exemplo, você pode usar fetch ou outras bibliotecas para fazer chamadas HTTP
  // Depois de receber a resposta, chame displayMessage com o texto da resposta e o tipo 'agent'
  const agentResponse = "Resposta do agente do Dialogflow";
  displayMessage(agentResponse, 'agent');
}

// Exemplo de uso da função sendToDialogflow
// sendToDialogflow("Olá, como posso ajudar?");
