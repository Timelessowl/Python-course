import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Table } from 'reactstrap';
import { ExecutionHistoryEntry } from '../types';

const ExecutionHistory: React.FC = () => {
  const [histories, setHistories] = useState<ExecutionHistoryEntry[]>([]);

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const response = await api.get<ExecutionHistoryEntry[]>('execution_histories/');
      setHistories(response.data);
    } catch (error) {
      console.error('Error fetching execution histories:', error);
    }
  };

  return (
    <div>
      <h3>Execution History</h3>
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Execution Time</th>
            <th>Status</th>
            <th>Result/Error</th>
          </tr>
        </thead>
        <tbody>
          {histories.map((history) => (
            <tr key={history.id}>
              <td>{history.task}</td>
              <td>{new Date(history.execution_time).toLocaleString()}</td>
              <td>{history.status}</td>
              <td>
                {history.status === 'SUCCESS'
                  ? history.result
                  : history.error_message}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ExecutionHistory;
