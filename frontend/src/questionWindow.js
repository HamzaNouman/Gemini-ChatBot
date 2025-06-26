// QuestionWindow.js
import React from "react";

function QuestionWindow({ onAnswerSelected }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
      <h1 className="text-4xl font-bold italic mb-6">Antes de começar...</h1>
      <p className="text-lg mb-8 text-gray-700">
        Responda algumas perguntas rápidas para personalizar sua experiência.
      </p>
      <button
        onClick={onAnswerSelected}
        className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
      >
        Continuar
      </button>
    </div>
  );
}

export default QuestionWindow;