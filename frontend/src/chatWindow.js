import React, { useState, useEffect, useRef } from 'react';

function ChatWindow() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const messagesEndRef = useRef(null); 
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessageText = message.trim(); 
      
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          sender: 'You',
          text: userMessageText,
        },
      ]);
      setMessage(''); // Cleans input

      setLoading(true); 

      try {
        //  We build the histoy to send to the backend
        // backend format: [{"role": "user/model", "parts": "text"}, ...]
        const conversationHistory = messages.map(msg => ({
          role: msg.sender === 'You' ? 'user' : 'model', // Maps 'You' to 'User', and 'Bot' to 'Model'
          parts: msg.text,
        }));
        
        // Here we add the currently message of the user to the history BEFORE we send the message
        // This is just for the requiisition
        const currentRequestHistory = [...conversationHistory, { role: 'user', parts: userMessageText }];

        const response = await fetch('http://127.0.0.1:5000/chat', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: userMessageText, // A pergunta atual
            history: currentRequestHistory // The complete history of the conversation, includiong the actual question of the conversation 
          })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.answer || 'Erro desconhecido do servidor.');
        }

        const data = await response.json();

        // Add the asnwer of the bot to the message state (exibition)
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
            text: `Desculpe, um erro ocorreu: ${error.message || 'Não foi possível se conectar ao servidor.'} Por favor, tente novamente mais tarde.`,
            isError: true, // A flag for validation
          },
        ]);
      } finally {
        setLoading(false); // Ends the loading state
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
      {}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === 'You'
                  ? 'bg-blue-500 text-white'
                  : msg.isError //User flag error if is an error (styles)
                  ? 'bg-red-200 text-red-800' // error styles
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
        <div ref={messagesEndRef} /> {}
      </div>

      {}
      <div className="p-4 border-t border-gray-300 flex items-center bg-gray-50">
        <textarea
          className="flex-1 resize-none p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows="2"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading} // Desable the inut while is loading
        ></textarea>
        <button
          className="ml-3 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-400 disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={loading || !message.trim()} 
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;