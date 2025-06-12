import React, { useState, useEffect, useRef } from 'react';

function ChatWindow() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // Começa com um array vazio para mensagens dinâmicas
  const [loading, setLoading] = useState(false); // Novo estado para indicar carregamento
  const messagesEndRef = useRef(null); // Ref para rolar para o final das mensagens

  // Efeito para rolar para o final das mensagens sempre que elas são atualizadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        text: message.trim(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage(''); // Limpa o input

      setLoading(true); // Inicia o estado de carregamento

      try {
        const response = await fetch('http://127.0.0.1:5000/chat', { // Certifique-se que a URL e porta correspondem ao seu backend
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: newMessage.text }),
        });

        const data = await response.json();

        // Adiciona a resposta do bot
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            sender: 'Bot',
            text: data.answer,
          },
        ]);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            sender: 'Bot',
            text: 'Desculpe, não consegui me conectar ao servidor. Por favor, verifique sua conexão ou tente novamente mais tarde.',
            isError: true, // Adiciona uma flag para estilizar mensagens de erro se quiser
          },
        ]);
      } finally {
        setLoading(false); // Finaliza o estado de carregamento
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-2xl mx-auto border border-gray-300 rounded-lg shadow-lg overflow-hidden bg-white">
      {/* Área de exibição de mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === 'You'
                  ? 'bg-blue-500 text-white'
                  : msg.isError // Usar a flag isError para estilizar
                  ? 'bg-red-200 text-red-800' // Estilo para erro
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="font-semibold">{msg.sender}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && ( // Exibir indicador de carregamento
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800">
              <p className="font-semibold">Bot</p>
              <p>Digitando...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Elemento vazio para rolar para o final */}
      </div>

      {/* Área de input de texto e botão de enviar */}
      <div className="p-4 border-t border-gray-300 flex items-center bg-gray-50">
        <textarea
          className="flex-1 resize-none p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows="2"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading} // Desabilitar input enquanto carrega
        ></textarea>
        <button
          className="ml-3 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={loading || !message.trim()} // Desabilitar botão enquanto carrega ou se a mensagem estiver vazia
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;