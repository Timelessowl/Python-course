import React, { useEffect, useState } from 'react';
import {
  Container,
  Alert,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  Row,
  Col,
} from 'reactstrap';
import { QueryResultConfig, Task } from '../types';
import {
  fetchQueryResultConfig,
  updateQueryResultConfig,
  runTask,
} from '../api/apiActions';
import TaskList from './TaskList';

const ControlPanel: React.FC = () => {
  const [config, setConfig] = useState<QueryResultConfig | null>(null);
  const [tableName, setTableName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const getConfig = async () => {
      setIsLoading(true);
      try {
        const configData = await fetchQueryResultConfig();
        setConfig(configData);
        setTableName(configData.table_name);
      } catch (err: any) {
        setError('Failed to load configuration.');
      } finally {
        setIsLoading(false);
      }
    };

    getConfig();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!tableName) {
      setError('Table name cannot be empty.');
      setIsLoading(false);
      return;
    }

    try {
      const updatedConfig = await updateQueryResultConfig({ table_name: tableName });
      setConfig(updatedConfig);
      setSuccess('Configuration updated successfully.');
    } catch (err: any) {
      setError('Failed to update configuration.');
    } finally {
      setIsLoading(false);
    }
  };

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
      <h4>Control Panel</h4>
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

        {/* Control Panel Section */}
        <Col xs={12} md={4}>
          <div
            style={{
              border: '1px solid #ced4da',
              borderRadius: '0.25rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
            }}
          >
            <h5>Run Selected Task</h5>
            <Button
              color="primary"
              onClick={handleRunSelectedTask}
              disabled={!selectedTask || isRunning}
              block
            >
              {isRunning ? (
                <>
                  <Spinner size="sm" /> Running...
                </>
              ) : (
                'Run Task'
              )}
            </Button>

            <hr />

            <h5>Query Results Storage</h5>
            {isLoading ? (
              <div className="text-center">
                <Spinner color="primary" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              <Form onSubmit={handleUpdate}>
                <FormGroup>
                  <Label for="tableName">Result Storage Table Name</Label>
                  <Input
                    type="text"
                    id="tableName"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    required
                  />
                </FormGroup>
                <Button type="submit" color="success" block disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Table Name'}
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ControlPanel;
