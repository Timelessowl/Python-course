import React, { useEffect, useState } from 'react';
import {
  Alert,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Collapse,
} from 'reactstrap';
import { Task } from '../types';
import { fetchTasks } from '../api/apiActions';

interface TaskListProps {
  onSelectTask: (task: Task | null) => void;
  selectedTaskId: number | null;
}

const TaskList: React.FC<TaskListProps> = ({ onSelectTask, selectedTaskId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  useEffect(() => {
    const getTasks = async () => {
      setIsLoading(true);
      try {
        const tasksData = await fetchTasks();
        setTasks(tasksData);
      } catch (err: any) {
        setError('Failed to load tasks.');
      } finally {
        setIsLoading(false);
      }
    };

    getTasks();
  }, []);

  const toggleTask = (taskId: number) => {
    const newActiveTaskId = activeTaskId === taskId ? null : taskId;
    setActiveTaskId(newActiveTaskId);
    const selectedTask = tasks.find(task => task.id === newActiveTaskId) || null;
    onSelectTask(selectedTask);
  };

  return (
    <div>
      {error && (
        <Alert color="danger" toggle={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}
      {isLoading ? (
        <div className="text-center">
          <Spinner color="primary" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
            <Card key={task.id} className="mb-2">
              <CardHeader
                onClick={() => toggleTask(task.id)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedTaskId === task.id ? '#e9ecef' : '',
                }}
              >
                <strong>
                  ID: {task.id} - {task.name}
                </strong>
              </CardHeader>
              <Collapse isOpen={activeTaskId === task.id}>
                <CardBody>
                  <p><strong>Schedule:</strong> {task.schedule}</p>
                  <p><strong>Active:</strong> {task.is_active ? 'Yes' : 'No'}</p>
                  <p><strong>Last Run:</strong> {task.last_run ? new Date(task.last_run).toLocaleString() : 'Never'}</p>
                  <p><strong>Query:</strong></p>
                  <pre>{task.query}</pre>
                  <p><strong>Database Connection Details:</strong></p>
                  <ul>
                    <li><strong>Connection Name:</strong> {task.database_connection.name}</li>
                    <li><strong>Host:</strong> {task.database_connection.host}</li>
                    <li><strong>Port:</strong> {task.database_connection.port}</li>
                    <li><strong>Database Name:</strong> {task.database_connection.database_name}</li>
                    <li><strong>Username:</strong> {task.database_connection.username}</li>
                  </ul>
                </CardBody>
              </Collapse>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
