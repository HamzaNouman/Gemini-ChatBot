import React, { useState } from 'react';

function ChatWindow() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'You', text: 'Hey Bot, this is a static message' },
    { id: 2, sender: 'Bot', text: 'Yes, this is not a conversation, you wrote all of it in the chatWindow.js script' },
    { id: 3, sender: 'You', text: 'You saying im talking alone? By myself?' },
    { id: 4, sender: 'Bot', text: 'Not really, because your not talking, just typing.' },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You', // Por enquanto, o remetente será sempre 'You'
        text: message.trim(),
      };
      setMessages([...messages, newMessage]);
      setMessage(''); // Limpa o input
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Envia ao pressionar Enter, mas não Shift+Enter
      event.preventDefault(); // Evita quebra de linha no textarea
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
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="font-semibold">{msg.sender}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
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
        ></textarea>
        <button
          className="ml-3 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;