import React, { useEffect, useState } from 'react';
import { Container, Table, Alert } from 'reactstrap';
import { ExecutionHistoryEntry } from '../types';
import api from '../api/api';

const History: React.FC = () => {
  const [histories, setHistories] = useState<ExecutionHistoryEntry[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const response = await api.get<ExecutionHistoryEntry[]>('execution-histories/');
        setHistories(response.data);
      } catch (err: any) {
        setError('Failed to load execution histories.');
      }
    };

    fetchHistories();
  }, []);

  return (
    <Container className="my-4">
      <h4>Execution History</h4>
      {error && (
        <Alert color="danger" toggle={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}
      <Table striped responsive>
        <thead>
          <tr>
            <th>Task</th>
            <th>Execution Time</th>
            <th>Status</th>
            <th>Result / Error</th>
          </tr>
        </thead>
        <tbody>
          {histories.map((history) => (
            <tr key={history.id}>
              <td>{'tmp'}</td>
              <td>{new Date(history.execution_time).toLocaleString()}</td>
              <td>{history.status}</td>
              <td>
                {history.status === 'SUCCESS' ? history.result : history.error_message}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default History;
