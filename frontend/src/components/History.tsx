import React, { useEffect, useState } from 'react';
import { Container, Table, Alert } from 'reactstrap';
import { ExecutionHistory } from '../types';
import { fetchExecutionHistory } from '../api/apiActions';

const History: React.FC = () => {
  const [histories, setHistories] = useState<ExecutionHistory[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchExecutionHistory();
        setHistories(data);
      } catch (err) {
        setError('Failed to fetch execution history.');
      }
    };
    fetchData();
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
              <td>{history.task.name}</td>
              <td>{new Date(history.execution_time).toLocaleString()}</td>
              <td>{history.status}</td>
              <td>
                {history.status === 'SUCCESS' ? (
                  <pre>{JSON.stringify(history.result_data, null, 2)}</pre>
                ) : (
                  history.error_message
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default History;
