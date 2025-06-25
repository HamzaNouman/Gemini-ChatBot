import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function ChatWindow() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Ref for the textarea to manage its height

  // Effect to scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to adjust textarea height and scroll to bottom when message changes
  useEffect(() => {
    adjustTextareaHeight();
    scrollToBottom(); // Keep scrolling to bottom even when typing
  }, [message]);

  // Effect to focus the textarea when the component mounts or after sending a message
  // and loading state changes.
  useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [loading]); // Depend on 'loading' state to re-focus when bot finishes

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to adjust the textarea height based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      // Set height based on scroll height, up to a max (e.g., 5 lines)
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseFloat(getComputedStyle(textareaRef.current).lineHeight);
      const maxRows = 5;
      const maxHeight = lineHeight * maxRows;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    // Validate that the message is not empty or just whitespace
    if (message.trim()) {
      const userMessageText = message.trim();

      // Add the user's message to the state immediately
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          sender: 'You',
          text: userMessageText,
        },
      ]);
      setMessage(''); // Clear the input field

      setLoading(true); // Set loading state to true to show "Typing..."

      try {
        // Build the conversation history for the backend
        // Ensure parts is an array of objects as expected by Gemini API
        const conversationHistory = messages.map(msg => ({
          role: msg.sender === 'You' ? 'user' : 'model',
          parts: [{ text: msg.text }], // Wrap text in an object with 'text' property
        }));

        // Add the current user message to the history for the current request
        const currentRequestHistory = [...conversationHistory, { role: 'user', parts: [{ text: userMessageText }] }];

        const response = await axios.post('http://localhost:5000/chat', {
          question: userMessageText,
          history: currentRequestHistory
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Add the bot's answer to the message state
        // Check if response and response.data exist, and if response.data.answer has content
        if (response && response.data && response.data.answer) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: prevMessages.length + 1,
              sender: 'Bot',
              text: response.data.answer,
            },
          ]);
        } else {
          // Handle cases where the API returns an unexpected structure or empty answer
          console.warn('API returned an unexpected structure or an empty answer:', response);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: prevMessages.length + 1,
              sender: 'Bot',
              text: 'Desculpe, a API retornou uma resposta inesperada. Por favor, tente novamente.',
              isError: true,
            },
          ]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        let errorMessage = 'Não foi possível conectar ao servidor.';

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Server response error:', error.response.data);
          console.error('Status:', error.response.status);
          if (error.response.data && error.response.data.message) {
            errorMessage = `Erro do servidor: ${error.response.data.message}`;
          } else {
            errorMessage = `Erro do servidor (Status: ${error.response.status}).`;
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          errorMessage = 'Erro de rede: Nenhuma resposta foi recebida do servidor.';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          errorMessage = `Ocorreu um erro inesperado: ${error.message}.`;
        }

        // Display an error message if the API call fails
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            sender: 'Bot',
            text: `Desculpe, um erro ocorreu: ${errorMessage} Por favor, tente novamente mais tarde.`,
            isError: true, // Flag for error styling
          },
        ]);
      } finally {
        setLoading(false); // End the loading state
        // The useEffect with dependency on 'loading' will handle focusing
      }
    }
  };

  // Handle key presses in the textarea (for Enter to send message)
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Send on Enter, allow Shift + Enter for new line
      event.preventDefault(); // Prevent default new line
      if (!loading) { // Only allow sending if not loading
        handleSendMessage();
      }
    }
  };

  return (
    // Main container for the whole chat interface, including the header
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100 p-4">
      {/* Header div for the chatbot icon and text */}
      <div className="flex items-center justify-center mb-4 cursor-pointer" onClick={() => window.location.reload()}>
        <img
          src="/chatbot.png" // Path to the main chatbot icon
          alt="Chatbot Icon"
          className="bounce w-16 h-16 md:w-20 md:h-20 animate-bounceYZ transform hover:scale-110"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/60x60/cccccc/ffffff?text=BOT"; }}
        />
        <p className="ml-4 text-lg font-semibold text-gray-700">Click on the chatbot to return to the initial menu</p>
      </div>

      {/* Main chat window container */}
      <div className="flex flex-col h-[90vh] w-[90vw] max-w-2xl mx-auto border border-gray-500 rounded-lg shadow-lg overflow-hidden bg-white">
        {/* Chat messages display area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'} items-start`}>
              {/* Bot profile icon for bot messages */}
              {msg.sender === 'Bot' && (
                <img
                  src="chatbot.png" // Path to the bot's profile icon
                  alt="Bot Profile"
                  className="w-10 h-10 rounded-full mr-2" // Adjust size and margin as needed
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/cccccc/ffffff?text=BOT"; }}
                />
              )}
              {/* Message bubble */}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'You'
                    ? 'bg-blue-500 text-white'
                    : msg.isError
                    ? 'bg-red-200 text-red-800'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="font-semibold">{msg.sender}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {/* "Typing..." indicator */}
          {loading && (
            <div className="flex justify-start items-start">
              {/* Bot profile icon for typing indicator */}
              <img
                src="icon2.gif" // Path to the bot's profile icon
                alt="Bot Profile"
                className="w-10 h-10 rounded-full mr-2" // Adjust size and margin as needed
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/cccccc/ffffff?text=BOT"; }}
              />
              <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800">
                <p className="font-semibold">Bot</p>
                {/* Simple animation for typing */}
                <div className="typing-animation">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Ref for scrolling to the bottom */}
        </div>

        {/* Message input area */}
        <div className="p-4 border-t border-gray-300 flex items-end bg-gray-50">
          <textarea
            ref={textareaRef} // Assign the ref to the textarea
            className="flex-1 resize-none p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  overflow-hidden" // overflow-hidden to prevent scrollbar during auto-resize
            rows="1" // Start with 1 row, adjust dynamically
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            // The textarea itself is never disabled, only the send button
            style={{ minHeight: '40px' }} // Optional: set a minimum height
          ></textarea>
          <button
            className="ml-3 px-6 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 enabled:hover:bg-black flex items-center justify-center transition ease-in duration-500"
            onClick={handleSendMessage}
            disabled={loading || !message.trim()} // Disable if loading or message is empty
          >
            {loading ? (
              'Sending...'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.543 60.543 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.543 60.543 0 0 0 3.478 2.405Z" />
                </svg>
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
