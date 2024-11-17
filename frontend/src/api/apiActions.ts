import api from './api';
import {
  Task,
  TaskInput,
  DatabaseConnectionInput,
  ExecutionHistory,
  DatabaseConnection,
} from '../types';

export const createTask = async (taskDetails: TaskInput): Promise<Task> => {
  const response = await api.post<Task>('tasks/create/', taskDetails);
  return response.data;
};

export const fetchAllTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('tasks/');
  return response.data;
};

export const editTask = async (
  taskId: number,
  updatedTaskDetails: Partial<TaskInput>
): Promise<Task> => {
  const response = await api.put<Task>(`tasks/${taskId}/`, updatedTaskDetails);
  return response.data;
};

export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`tasks/${taskId}/`);
};

export const runTask = async (taskId: number): Promise<any> => {
  const response = await api.post(`tasks/${taskId}/run/`);
  return response.data;
};

export const fetchExecutionHistory = async (): Promise<ExecutionHistory[]> => {
  const response = await api.get<ExecutionHistory[]>('executions/');
  return response.data;
};

export const checkDatabaseConnection = async (
  connectionDetails: DatabaseConnectionInput
): Promise<{ is_connection_successful: boolean; error?: string }> => {
  const response = await api.post<{ is_connection_successful: boolean; error?: string }>(
    'check-connection/',
    connectionDetails
  );
  return response.data;
};

export const fetchAllDatabaseConnections = async (): Promise<DatabaseConnection[]> => {
  const response = await api.get<DatabaseConnection[]>('database-connections/');
  return response.data;
};
