// QuestionWindow.js
import React from "react";

function QuestionWindow({ onAnswerSelected }) { // Prop to handle answer selection and lead to chat
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
      <h1 className="text-4xl font-bold italic mb-6">Who are you?</h1> {/* Title for the question screen */}
      <p className="text-lg mb-8 text-gray-700">
        No data will be kept, this question is for improving experience only.
      </p>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md"> {/* Grid for 2x2 buttons */}
        <button
          onClick={onAnswerSelected} // All buttons will lead to the chat for now
          className="px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-black transition duration-600 ease-in-out shadow-md"
        >
          Recruiter
        </button>
        <button
          onClick={onAnswerSelected}
          className="px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-black transition duration-600 ease-in-out shadow-md"
        >
          Developer
        </button>
        <button
          onClick={onAnswerSelected}
          className="px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-black transition duration-600 ease-in-out shadow-md"
        >
          Tester
        </button>
        <button
          onClick={onAnswerSelected}
          className="px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-black transition duration-600 ease-in-out shadow-md"
        >
          A friend of you
        </button>
      </div>
    </div>
  );
}

export default QuestionWindow;