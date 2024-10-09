// src/App.tsx

import React, { useState } from 'react';
import Selector from './components/Selector';
import TaskAndConnectionForm from './components/TaskAndConnectionForm';
import ControlPanel from './components/ControlPanel';
import History from './components/History';
import './App.css'; // Optional: For component-specific styles

const App: React.FC = () => {
  // State to track the selected option
  const [selectedOption, setSelectedOption] = useState<string>('Add New');

  // Handler for selector option clicks
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  // Function to render content based on the selected option
  const renderContent = () => {
    switch (selectedOption) {
      case 'Control Panel':
        return <ControlPanel />;
      case 'Add New':
        return <TaskAndConnectionForm />;
      case 'History':
        return <History />;
      default:
        return <TaskAndConnectionForm />;
    }
  };

  return (
    <div
      className="app-container"
      style={{
        display: 'flex',
        backgroundColor: '#e0e0e0',
        height: '100vh',
      }}
    >
      {/* Selector Component */}
      <Selector selectedOption={selectedOption} onOptionSelect={handleOptionSelect} />

      {/* Main Content Area */}
      <div
        className="main-content-rectangle"
        style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
          flex: 1,
          margin: '20px',
          height: '90vh',
          overflowY: 'auto',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
