import React, { useState } from 'react';
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Row,
  Col,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import {
  DatabaseConnectionInput,
  TaskInput,
  Task,
} from '../types';
import { createTask, checkDatabaseConnection } from '../api/apiActions';
const TaskAndConnectionForm: React.FC = () => {
  const navigate = useNavigate();

  const [dbName, setDbName] = useState<string>('');
  const [dbHost, setDbHost] = useState<string>('');
  const [dbPort, setDbPort] = useState<number>(5432);
  const [dbDatabaseName, setDbDatabaseName] = useState<string>('');
  const [dbUsername, setDbUsername] = useState<string>('');
  const [dbPassword, setDbPassword] = useState<string>('');

  const [taskName, setTaskName] = useState<string>('');
  const [taskQuery, setTaskQuery] = useState<string>('');
  const [taskSchedule, setTaskSchedule] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [connectionError, setConnectionError] = useState<string>('');
  const [connectionSuccess, setConnectionSuccess] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // проверка на пустые поля
    if (
      !dbName ||
      !dbHost ||
      !dbDatabaseName ||
      !dbUsername ||
      !dbPassword ||
      !taskName ||
      !taskQuery ||
      !taskSchedule
    ) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const databaseConnection: DatabaseConnectionInput = {
        name: dbName,
        host: dbHost,
        port: dbPort,
        database_name: dbDatabaseName,
        username: dbUsername,
        password: dbPassword,
      };

      const taskDetails: TaskInput = {
        name: taskName,
        query: taskQuery,
        schedule: taskSchedule,
        database_connection: databaseConnection,
      };

      const response: Task = await createTask(taskDetails);
      setSuccess('Task created successfully.');
      setDbName('');
      setDbHost('');
      setDbPort(5432);
      setDbDatabaseName('');
      setDbUsername('');
      setDbPassword('');
      setTaskName('');
      setTaskQuery('');
      setTaskSchedule('');
      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    setConnectionError('');
    setConnectionSuccess('');
    setIsChecking(true);

    if (
      !dbName ||
      !dbHost ||
      !dbDatabaseName ||
      !dbUsername ||
      !dbPassword
    ) {
      setConnectionError('Please fill in all database connection fields.');
      setIsChecking(false);
      return;
    }

    try {
      const databaseConnection: DatabaseConnectionInput = {
        name: dbName,
        host: dbHost,
        port: dbPort,
        database_name: dbDatabaseName,
        username: dbUsername,
        password: dbPassword,
      };

      const response = await checkDatabaseConnection(databaseConnection);
      if (response.is_connection_successful) {
        setConnectionSuccess('Connection successful!');
      } else {
        setConnectionError(response.error || 'Connection failed.');
      }
    } catch (err: any) {
      setConnectionError(err.response?.data?.error || 'Connection failed.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Container>
      <h4 className="my-4">Создание нового задания</h4>

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

      <Form onSubmit={handleCreateTask}>
        <Row form>
          <Col xs={12}>
            <h5 className="mb-3">Database Connection</h5>
            <Row form>
              <Col xs={12}>
                <FormGroup>
                  <Label for="dbName">Connection Name</Label>
                  <Input
                    type="text"
                    id="dbName"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label for="dbHost">Host</Label>
                  <Input
                    type="text"
                    id="dbHost"
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label for="dbPort">Port</Label>
                  <Input
                    type="number"
                    id="dbPort"
                    value={dbPort}
                    onChange={(e) => setDbPort(Number(e.target.value))}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12}>
                <FormGroup>
                  <Label for="dbDatabaseName">Database Name</Label>
                  <Input
                    type="text"
                    id="dbDatabaseName"
                    value={dbDatabaseName}
                    onChange={(e) => setDbDatabaseName(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label for="dbUsername">Username</Label>
                  <Input
                    type="text"
                    id="dbUsername"
                    value={dbUsername}
                    onChange={(e) => setDbUsername(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label for="dbPassword">Password</Label>
                  <Input
                    type="password"
                    id="dbPassword"
                    value={dbPassword}
                    onChange={(e) => setDbPassword(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            {connectionError && (
              <Alert
                color="danger"
                toggle={() => setConnectionError('')}
                className="mt-3"
              >
                {connectionError}
              </Alert>
            )}
            {connectionSuccess && (
              <Alert
                color="success"
                toggle={() => setConnectionSuccess('')}
                className="mt-3"
              >
                {connectionSuccess}
              </Alert>
            )}

            <Button
              type="button"
              color="secondary"
              onClick={handleCheckConnection}
              disabled={isChecking}
              className="mt-2"
            >
              {isChecking ? 'Checking...' : 'Check Connection'}
            </Button>
          </Col>

          <Col xs={12} className="mt-5">
            <h5 className="mb-3">Task Details</h5>
            <Row form>
              <Col xs={12}>
                <FormGroup>
                  <Label for="taskName">Task Name</Label>
                  <Input
                    type="text"
                    id="taskName"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12}>
                <FormGroup>
                  <Label for="taskQuery">SQL Query</Label>
                  <Input
                    type="textarea"
                    id="taskQuery"
                    value={taskQuery}
                    onChange={(e) => setTaskQuery(e.target.value)}
                    required
                    rows={4}
                  />
                </FormGroup>
              </Col>
              <Col xs={12}>
                <FormGroup>
                  <Label for="taskSchedule">Cron Schedule</Label>
                  <Input
                    type="text"
                    id="taskSchedule"
                    placeholder="e.g., */5 * * * *"
                    value={taskSchedule}
                    onChange={(e) => setTaskSchedule(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12}>
                <Button type="submit" color="primary" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Task'}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default TaskAndConnectionForm;
