import React, { useState } from 'react';
import {
  Container,
  Button,
  Spinner,
  Row,
  Col,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { Task } from '../types';
import { runTask } from '../api/apiActions';
import TaskList from './TaskList';


const ControlPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleRunSelectedTask = async () => {
    if (!selectedTask) {
      toast.error('No task selected.');
      return;
    }
    setIsRunning(true);
    try {
      await runTask(selectedTask.id);
      toast.success(`Запрос "${selectedTask.name}" был успешно выполнен.`);
    } catch (err: any) {
      toast.error('Не удалось выполнить запрос.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Container className="my-4">
      <h4>Доступные запросы</h4>
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
