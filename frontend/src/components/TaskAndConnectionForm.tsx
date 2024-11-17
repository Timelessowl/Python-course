// TaskAndConnectionForm.tsx

import React, { useState, useEffect } from 'react';
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
  DatabaseConnection,
  TaskInput,
  Task,
} from '../types';
import {
  createTask,
  checkDatabaseConnection,
  fetchAllDatabaseConnections,
} from '../api/apiActions';

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
  const [retryDelay, setRetryDelay] = useState<number>(60);
  const [maxRetries, setMaxRetries] = useState<number>(3);

  const [useExistingConnection, setUseExistingConnection] = useState<boolean>(false);
  const [existingConnections, setExistingConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [connectionError, setConnectionError] = useState<string>('');
  const [connectionSuccess, setConnectionSuccess] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    if (useExistingConnection) {
      fetchAllDatabaseConnections()
        .then((connections) => setExistingConnections(connections))
        .catch((err) => setError('Failed to load existing connections.'));
    }
  }, [useExistingConnection]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (
      !taskName ||
      !taskQuery ||
      !taskSchedule ||
      (!useExistingConnection &&
        (!dbName || !dbHost || !dbDatabaseName || !dbUsername || !dbPassword)) ||
      (useExistingConnection && !selectedConnectionId)
    ) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const taskDetails: TaskInput = {
        name: taskName,
        query: taskQuery,
        schedule: taskSchedule,
        retry_delay: retryDelay,
        max_retries: maxRetries,
        database_connection: useExistingConnection ? selectedConnectionId! : undefined,
        database_connection_data: !useExistingConnection
          ? {
              name: dbName,
              host: dbHost,
              port: dbPort,
              database_name: dbDatabaseName,
              username: dbUsername,
              password: dbPassword,
            }
          : undefined,
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
      setRetryDelay(60);
      setMaxRetries(3);
      setUseExistingConnection(false);
      setSelectedConnectionId(null);
      navigate('/tasks');
    } catch (err: any) {
      let errorMessage = 'Failed to create task.';
      const errorData = err.response?.data;
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          errorMessage = Object.values(errorData)
            .flat()
            .join(' ');
        }
      } else {
        errorMessage = err.message || 'Failed to create task due to an unknown error.';
      }

      setError(errorMessage);
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
      <h4 className="my-4">Создать новый запрос</h4>

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
            <h5 className="mb-3">База данных</h5>
            <FormGroup check className="mb-3">
              <Label check>
                <Input
                  type="checkbox"
                  checked={useExistingConnection}
                  onChange={(e) => setUseExistingConnection(e.target.checked)}
                />{' '}
                Выбрать существующие подключение
              </Label>
            </FormGroup>
            {useExistingConnection ? (
              <FormGroup>
                <Label for="existingConnection">Выберите подключение</Label>
                <Input
                  type="select"
                  id="existingConnection"
                  value={selectedConnectionId || ''}
                  onChange={(e) => setSelectedConnectionId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>
                    -- Выберите подключение --
                  </option>
                  {existingConnections.map((conn) => (
                    <option key={conn.id} value={conn.id}>
                      {conn.name} ({conn.host}:{conn.port}/{conn.database_name})
                    </option>
                  ))}
                </Input>
              </FormGroup>
            ) : (
              <>
                <Row form>
                  <Col xs={12}>
                    <FormGroup>
                      <Label for="dbName">Название подключение</Label>
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
                      <Label for="dbHost">Хост</Label>
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
                      <Label for="dbPort">Порт</Label>
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
                      <Label for="dbDatabaseName">Имя БД</Label>
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
                      <Label for="dbUsername">Имя пользователя</Label>
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
                      <Label for="dbPassword">Пароль</Label>
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
              </>
            )}
          </Col>

          <Col xs={12} className="mt-5">
            <h5 className="mb-3">Новый запрос</h5>
            <Row form>
              <Col xs={12}>
                <FormGroup>
                  <Label for="taskName">Имя</Label>
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
                  <Label for="taskQuery">SQL запрос</Label>
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
                  <Label for="taskSchedule">Расписание (в формате Cron)</Label>
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
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label for="retryDelay">Интервал повторных попыток (секунды)</Label>
                  <Input
                    type="number"
                    id="retryDelay"
                    value={retryDelay}
                    onChange={(e) => setRetryDelay(Number(e.target.value))}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label for="maxRetries">Число попыток</Label>
                  <Input
                    type="number"
                    id="maxRetries"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(Number(e.target.value))}
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12}>
                <Button type="submit" color="primary" disabled={isLoading}>
                  {isLoading ? 'Создание...' : 'Создать запрос'}
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
