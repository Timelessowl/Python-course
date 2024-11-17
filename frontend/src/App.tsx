import React, { useState } from 'react';
import Selector from './components/Selector';
import TaskAndConnectionForm from './components/TaskAndConnectionForm';
import ControlPanel from './components/ControlPanel';
import History from './components/History';
import 'bootstrap/dist/css/bootstrap.min.css';
const App: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('Панель управления');

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const renderContent = () => {
    switch (selectedOption) {
      case 'Панель управления':
        return <ControlPanel />;
      case 'Создание нового запроса':
        return <TaskAndConnectionForm />;
      case 'История запросов':
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
      <Selector selectedOption={selectedOption} onOptionSelect={handleOptionSelect} />

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
