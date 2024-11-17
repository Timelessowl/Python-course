import React from 'react';

type SelectorProps = {
  selectedOption: string;
  onOptionSelect: (option: string) => void;
};

const Selector: React.FC<SelectorProps> = ({ selectedOption, onOptionSelect }) => {
  const options = ['Панель управления', 'Создание нового запроса', 'История запросов'];

  return (
    <div
      className="selector-rectangle"
      style={{
        backgroundColor: '#fff',
        borderRadius: '15px',
        padding: '15px',
        width: '300px',
        margin: '20px',
        position: 'sticky',
        top: '20px',
        height: 'fit-content',
      }}
    >
      <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
        {options.map((option) => (
          <li
            key={option}
            className={`selector-item ${selectedOption === option ? 'active' : ''}`}
            onClick={() => onOptionSelect(option)}
            style={{
              cursor: 'pointer',
              padding: '10px',
              borderLeft: `6px solid ${selectedOption === option ? '#3498db' : 'transparent'}`,
              marginLeft: '-15px',
              paddingLeft: '25px',
              color: selectedOption === option ? '#3498db' : '#333',
              transition: 'color 0.3s, border-left 0.3s',
            }}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Selector;
