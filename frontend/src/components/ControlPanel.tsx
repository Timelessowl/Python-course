import React, { useState } from 'react';
import {
  Container,
  Alert,
  Button,
  Spinner,
  Row,
  Col,
} from 'reactstrap';
import { Task } from '../types';
import { runTask } from '../api/apiActions';
import TaskList from './TaskList';

const ControlPanel: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleRunSelectedTask = async () => {
    if (!selectedTask) {
      setError('No task selected.');
      return;
    }

    setError('');
    setSuccess('');
    setIsRunning(true);
    try {
      await runTask(selectedTask.id);
      setSuccess(`Task "${selectedTask.name}" has been triggered successfully.`);
    } catch (err: any) {
      setError('Failed to run the selected task.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Container className="my-4">
      <h4>Доступные запросы</h4>
      {error && (
        <Alert color="danger" toggle={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" toggle={() => setSuccess('')} className="mb-3">
          {success}
        </Alert>
      )}
      <Row>
        <Col xs={12} md={8}>
          <TaskList
            onSelectTask={setSelectedTask}
            selectedTaskId={selectedTask ? selectedTask.id : null}
          />
        </Col>

        <Col xs={12} md={4}>
          <div
            style={{
              border: '1px solid #ced4da',
              borderRadius: '0.25rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
            }}
          >
            <h5>Выполнить выбранный запрос</h5>
            <Button
              color="primary"
              onClick={handleRunSelectedTask}
              disabled={!selectedTask || isRunning}
              block
            >
              {isRunning ? (
                <>
                  <Spinner size="sm" /> Выполняется...
                </>
              ) : (
                'Выполнить'
              )}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ControlPanel;
