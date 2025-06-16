import React, { useState } from 'react';
import './App.css';
import ChatWindow from './chatWindow';
import OpeningWindow from './openingWindow';

function App() {
  const [showChat, setShowChat] = useState(false);
  return (
    <div className="App min-h-screen flex items-center justify-center bg-gray-100">
      {showChat ? <ChatWindow /> : <OpeningWindow onStartChat={() => setShowChat(true)} />}
    </div>
  );
}

export default App;