import React, { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Selector from './components/Selector';
import TaskAndConnectionForm from './components/TaskAndConnectionForm';
import ControlPanel from './components/ControlPanel';
import History from './components/History';
import { ExecutionHistory } from './types';
import { fetchExecutionHistory } from './api/apiActions';
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
  const previousHistoriesRef = useRef<ExecutionHistory[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('Панель управления');

  useEffect(() => {
    let isMounted = true;
  
    const pollExecutionHistories = async () => {
      try {
        console.log('Polling for execution histories...');
        const currentHistories = await fetchExecutionHistory();
        console.log('Fetched execution histories:', currentHistories); 

        if (previousHistoriesRef.current.length > 0) {
          detectStatusChanges(previousHistoriesRef.current, currentHistories);
        }

        if (isMounted) {
          previousHistoriesRef.current = currentHistories;
        }
      } catch (err) {
        console.error('Failed to fetch execution histories', err);
      }
    };

    pollExecutionHistories();

    const intervalId = setInterval(pollExecutionHistories, 5000);

    return () => {
      clearInterval(intervalId);
      isMounted = false;
    };
  }, []);

  const buildTaskHistoryMap = (histories: ExecutionHistory[]): Map<number, ExecutionHistory> => {
    const taskHistoryMap = new Map<number, ExecutionHistory>();
    histories.forEach(history => {
      const taskId = history.task.id;
      const existingHistory = taskHistoryMap.get(taskId);
      if (!existingHistory || new Date(history.execution_time) > new Date(existingHistory.execution_time)) {
        taskHistoryMap.set(taskId, history);
      }
    });
    return taskHistoryMap;
  };

  let lastRetryCountMap = new Map<number, number>();

  const detectStatusChanges = (prevHistories: ExecutionHistory[], currHistories: ExecutionHistory[]) => {
    const prevTaskHistories = buildTaskHistoryMap(prevHistories);
    const currTaskHistories = buildTaskHistoryMap(currHistories);
  
    currTaskHistories.forEach((currHistory, taskId) => {
      const prevHistory = prevTaskHistories.get(taskId);
      const taskName = currHistory.task.name;
      const lastRetryCount = lastRetryCountMap.get(taskId) || 0;
  
      if (!prevHistory) {
        if (currHistory.status === 'PENDING') {
          const message = `Task "${taskName}" has started.`;
          console.log(message);
          toast.info(message);
        }
      } else {
        if (prevHistory.status !== currHistory.status) {
          if (currHistory.status === 'SUCCESS') {
            const message = `Task "${taskName}" completed successfully.`;
            toast.success(message);
          } else if (currHistory.status === 'FAILURE') {
            const message = `Task "${taskName}" failed after retries.`;
            toast.error(message);
          } else if (currHistory.status === 'PENDING') {
            const message = `Task "${taskName}" is now pending again.`;
            toast.info(message);
          }
        }
  
        if (currHistory.retry_count > lastRetryCount) {
          const message = `Task "${taskName}" is retrying (Attempt ${currHistory.retry_count}).`;
          toast.warning(message);
          lastRetryCountMap.set(taskId, currHistory.retry_count);
        }
  
        if (prevHistory.status === 'RETRY' && currHistory.status !== 'RETRY') {
          const message = `Task "${taskName}" finished after retrying. Final status: ${currHistory.status}`;
          toast.success(message);
        }
      }
    });
  };

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
      <ToastContainer />
    </div>
  );
};

export default App;
