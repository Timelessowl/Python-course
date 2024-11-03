import React, { useEffect, useState } from 'react';
import {
  Alert,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Collapse,
  Button,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import { Task, TaskInput } from '../types';
import { fetchAllTasks, editTask, deleteTask } from '../api/apiActions';

interface TaskListProps {
  onSelectTask: (task: Task | null) => void;
  selectedTaskId: number | null;
}

const TaskList: React.FC<TaskListProps> = ({ onSelectTask, selectedTaskId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [editableTasks, setEditableTasks] = useState<{ [key: number]: Partial<TaskInput> }>({});

  useEffect(() => {
    const getTasks = async () => {
      setIsLoading(true);
      try {
        const tasksData = await fetchAllTasks();
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
    const selectedTask = tasks.find((task) => task.id === newActiveTaskId) || null;
    onSelectTask(selectedTask);
  };

  const handleEditToggle = (task: Task) => {
    setEditableTasks((prev) => {
      if (prev[task.id]) {
        saveTaskEdits(task.id);
        return {};
      } else {
        return {
          [task.id]: {
            name: task.name,
            query: task.query,
            schedule: task.schedule,
            retry_delay: task.retry_delay,
            max_retries: task.max_retries,
            is_active: task.is_active,
          },
        };
      }
    });
  };

  const handleFieldChange = (taskId: number, field: keyof TaskInput, value: any) => {
    setEditableTasks((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  };

  const saveTaskEdits = async (taskId: number) => {
    const editedTask = editableTasks[taskId];

    try {
      const updatedTask = await editTask(taskId, editedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setEditableTasks({});
      setSuccess('Task updated successfully.');
    } catch (err: any) {
      setError('Failed to save task changes.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;
    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setSuccess('Task deleted successfully.');
    } catch (err: any) {
      setError('Failed to delete task.');
    }
  };

  return (
    <div>
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
      {isLoading ? (
        <div className="text-center">
          <Spinner color="primary" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        <div>
          {tasks.map((task) => {
            const isEditing = !!editableTasks[task.id];
            const currentTask = isEditing ? editableTasks[task.id] : task;

            return (
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
                  <Button
                    color="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    style={{ float: 'right', marginRight: '5px' }}
                  >
                    Delete
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditToggle(task);
                    }}
                    style={{ float: 'right', marginRight: '5px' }}
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </CardHeader>
                <Collapse isOpen={activeTaskId === task.id}>
                  <CardBody>
                    <FormGroup>
                      <strong>Name:</strong>{' '}
                      {isEditing ? (
                        <Input
                          type="text"
                          value={currentTask.name || ''}
                          onChange={(e) => handleFieldChange(task.id, 'name', e.target.value)}
                        />
                      ) : (
                        <span>{task.name}</span>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <strong>Schedule:</strong>{' '}
                      {isEditing ? (
                        <Input
                          type="text"
                          value={currentTask.schedule || ''}
                          onChange={(e) =>
                            handleFieldChange(task.id, 'schedule', e.target.value)
                          }
                        />
                      ) : (
                        <span>{task.schedule}</span>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <strong>Retry Delay (seconds):</strong>{' '}
                      {isEditing ? (
                        <Input
                          type="number"
                          value={currentTask.retry_delay || 0}
                          onChange={(e) =>
                            handleFieldChange(task.id, 'retry_delay', Number(e.target.value))
                          }
                        />
                      ) : (
                        <span>{task.retry_delay}</span>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <strong>Max Retries:</strong>{' '}
                      {isEditing ? (
                        <Input
                          type="number"
                          value={currentTask.max_retries || 0}
                          onChange={(e) =>
                            handleFieldChange(task.id, 'max_retries', Number(e.target.value))
                          }
                        />
                      ) : (
                        <span>{task.max_retries}</span>
                      )}
                    </FormGroup>
                    <FormGroup check>
                      <Label check>
                        {isEditing ? (
                          <Input
                            type="checkbox"
                            checked={currentTask.is_active || false}
                            onChange={(e) =>
                              handleFieldChange(task.id, 'is_active', e.target.checked)
                            }
                          />
                        ) : (
                          <Input type="checkbox" checked={task.is_active} disabled />
                        )}{' '}
                        Active
                      </Label>
                    </FormGroup>
                    <FormGroup>
                      <strong>Last Run:</strong>{' '}
                      <span>
                        {task.last_run ? new Date(task.last_run).toLocaleString() : 'Never'}
                      </span>
                    </FormGroup>
                    <FormGroup>
                      <strong>Query:</strong>
                      {isEditing ? (
                        <Input
                          type="textarea"
                          value={currentTask.query || ''}
                          onChange={(e) =>
                            handleFieldChange(task.id, 'query', e.target.value)
                          }
                        />
                      ) : (
                        <pre>{task.query}</pre>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <strong>Database Connection:</strong>
                      <div style={{ marginLeft: '15px' }}>
                        <p><strong>ID:</strong> {task.database_connection.id}</p>
                        <p><strong>Name:</strong> {task.database_connection.name}</p>
                        <p><strong>Host:</strong> {task.database_connection.host}</p>
                        <p><strong>Port:</strong> {task.database_connection.port}</p>
                        <p><strong>Database Name:</strong> {task.database_connection.database_name}</p>
                        <p><strong>Username:</strong> {task.database_connection.username}</p>
                      </div>
                    </FormGroup>
                  </CardBody>
                </Collapse>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskList;
