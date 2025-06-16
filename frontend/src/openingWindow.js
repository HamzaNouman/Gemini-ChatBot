import React from "react";

function OpeningWindow({ onStartChat }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <img
            src="/chatbot.png"
            alt="Chat Icon"
            className="w-24 h-24 mb-6 transform hover:scale-110 animate-bounceY" />
      <h1 className="Chat text-4xl font-bold italic mb-4">Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">Chat App</span></h1>
      <button
        onClick={onStartChat} // Redirect to chat window
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-black transition duration-500 ease-in"
      >
        Start Chatting
      </button>
    </div>
  );
}

export default OpeningWindow;