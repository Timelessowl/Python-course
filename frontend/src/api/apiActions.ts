import api from './api';
import {
  DatabaseConnectionInput,
  CheckConnectionResponse,
  TaskInput,
  Task,
} from '../types';


export const checkDatabaseConnection = async (
  connectionDetails: DatabaseConnectionInput
): Promise<CheckConnectionResponse> => {
  try {
    const response = await api.post<CheckConnectionResponse>('check-connection/', connectionDetails);
    return response.data;
  } catch (error: any) {
    return { is_connection_successful: false, error: 'Network error or server not reachable.' };
  }
};


export const createTask = async (taskDetails: TaskInput): Promise<Task> => {
  const response = await api.post<Task>('tasks/create/', taskDetails);
  return response.data;
};

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('tasks/');
  return response.data;
};
