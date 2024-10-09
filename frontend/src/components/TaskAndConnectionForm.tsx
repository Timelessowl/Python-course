// src/components/TaskAndConnectionForm.tsx

import React, { useState } from 'react';
import api from '../api/api';
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { DatabaseConnection, Task } from '../types';
import { useNavigate } from 'react-router-dom';

const TaskAndConnectionForm: React.FC = () => {
  const navigate = useNavigate();

  // State for Database Connection
  const [dbName, setDbName] = useState<string>('');
  const [dbHost, setDbHost] = useState<string>('');
  const [dbPort, setDbPort] = useState<number>(5432);
  const [dbDatabaseName, setDbDatabaseName] = useState<string>('');
  const [dbUsername, setDbUsername] = useState<string>('');
  const [dbPassword, setDbPassword] = useState<string>('');
  const [connectionId, setConnectionId] = useState<number | null>(null);

  // State for Task
  const [taskName, setTaskName] = useState<string>('');
  const [taskQuery, setTaskQuery] = useState<string>('');
  const [taskSchedule, setTaskSchedule] = useState<string>('');

  // UI State
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState<boolean>(false);

  // Handler to check and create database connection
  const handleCheckConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!dbName || !dbHost || !dbDatabaseName || !dbUsername || !dbPassword) {
      setError('Please fill in all database connection fields.');
      return;
    }

    try {
      const newConnection = {
        name: dbName,
        host: dbHost,
        port: dbPort,
        database_name: dbDatabaseName,
        username: dbUsername,
        password: dbPassword,
      };
      const response = await api.post<DatabaseConnection>('database-connections/', newConnection);
      setConnectionId(response.data.id);
      setSuccess('Database connection checked and created successfully.');
      // Reset connection form fields
      setDbName('');
      setDbHost('');
      setDbPort(5432);
      setDbDatabaseName('');
      setDbUsername('');
      setDbPassword('');
    } catch (error: any) {
      console.error('Error checking database connection:', error);
      setError(error.response?.data?.message || 'Failed to check database connection.');
    }
  };

  // Handler to create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!taskName || !taskQuery || !taskSchedule) {
      setError('Please fill in all task fields.');
      return;
    }

    if (connectionId === null) {
      setError('Please check and create a database connection first.');
      return;
    }

    try {
      const newTask = {
        name: taskName,
        query: taskQuery,
        schedule: taskSchedule,
        database_connection: connectionId,
      };
      await api.post<Task>('tasks/', newTask);
      setSuccess('Task created successfully.');
      // Reset task form fields
      setTaskName('');
      setTaskQuery('');
      setTaskSchedule('');
      // Navigate to tasks list
      navigate('/tasks');
    } catch (error: any) {
      console.error('Error creating task:', error);
      setError(error.response?.data?.message || 'Failed to create task.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        New Task
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Database Connection Section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Database Connection
          </Typography>
          <form onSubmit={handleCheckConnection}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Connection Name"
                  variant="outlined"
                  fullWidth
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Host"
                  variant="outlined"
                  fullWidth
                  value={dbHost}
                  onChange={(e) => setDbHost(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Port"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={dbPort}
                  onChange={(e) => setDbPort(Number(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Database Name"
                  variant="outlined"
                  fullWidth
                  value={dbDatabaseName}
                  onChange={(e) => setDbDatabaseName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={dbUsername}
                  onChange={(e) => setDbUsername(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  type="password"
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="secondary">
                  Check Database Connection
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>

        {/* Task Details Section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Task Details
          </Typography>
          <form onSubmit={handleCreateTask}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Task Name"
                  variant="outlined"
                  fullWidth
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="SQL Query"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={4}
                  value={taskQuery}
                  onChange={(e) => setTaskQuery(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Cron Schedule"
                  variant="outlined"
                  fullWidth
                  placeholder="e.g., */5 * * * *"
                  value={taskSchedule}
                  onChange={(e) => setTaskSchedule(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Create Task
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TaskAndConnectionForm;
