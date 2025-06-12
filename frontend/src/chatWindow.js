import React, { useState } from 'react';

function ChatWindow() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You', // Por enquanto, o remetente serÃ¡ sempre 'You'
        text: message.trim(),
      };
      setMessages([...messages, newMessage]);
      setMessage(''); // Limpa o input

      try {
        const response = await fetch('http://localhost:5000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: message.trim() }),
        });
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, sender: 'Bot', text: data.answer },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, sender: 'Bot', text: 'Error: Could not connect to backend.' },
        ]);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Envia ao pressionar Enter, mas nÃ£o Shift+Enter
      event.preventDefault(); // Evita quebra de linha no textarea
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-2xl mx-auto border border-gray-300 rounded-lg shadow-lg overflow-hidden bg-white">
      {/* Ãrea de exibiÃ§Ã£o de mensagens */}
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

      {/* Ãrea de input de texto e botÃ£o de enviar */}
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