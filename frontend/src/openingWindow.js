import React from "react";

function OpeningWindow({ onStartQuestion }) { // Changed prop name to onStartQuestion
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
      <img
        src="/chatbot.png"
        alt="Chat Icon"
        className="w-24 h-24 mb-6 transform hover:scale-110 animate-bounceY"
      />
      <h1 className="Chat text-4xl font-bold italic mb-4">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">Chat App</span></h1> 
      <p className="text-lg mb-8 text-gray-700">
        Do you want to know more about Hamza? <br />
        First let's customize your experience!
      </p>
      <button
        onClick={onStartQuestion} // Will now trigger the next step: "Question 1"
        className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-black transition duration-500 ease-in-out shadow-lg"
      >
        Let's do it
      </button>
    </div>
  );
}

export default OpeningWindow;