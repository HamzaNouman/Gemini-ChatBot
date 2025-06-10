import React from 'react';
import './App.css'; // Mantenha este se você tiver estilos globais
import ChatWindow from './chatWindow'; // Importe o componente ChatWindow

function App() {
  return (
    <div className="App min-h-screen flex items-center justify-center bg-gray-100">
      <ChatWindow />
    </div>
  );
}

export default App;