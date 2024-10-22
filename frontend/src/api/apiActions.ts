import api from './api';
import {
  DatabaseConnectionInput,
  CheckConnectionResponse,
  TaskInput,
  Task,
  QueryResult,
  QueryResultConfig,
} from '../types';

/**
 * Check Database Connection
 * @param connectionDetails - Database connection parameters
 * @returns Promise resolving to CheckConnectionResponse
 */
export const checkDatabaseConnection = async (
  connectionDetails: DatabaseConnectionInput
): Promise<CheckConnectionResponse> => {
  try {
    const response = await api.post<CheckConnectionResponse>('check-connection/', connectionDetails);
    return response.data;
  } catch (error: any) {
    // Handle network or unexpected errors
    return { is_connection_successful: false, error: 'Network error or server not reachable.' };
  }
};

/**
 * Create a New Task
 * @param taskDetails - Task parameters
 * @returns Promise resolving to Task
 */
export const createTask = async (taskDetails: TaskInput): Promise<Task> => {
  const response = await api.post<Task>('tasks/create/', taskDetails);
  return response.data;
};

/**
 * Fetch All Tasks
 * @returns Promise resolving to an array of Tasks
 */
export const fetchTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('tasks/');
  return response.data;
};

/**
 * Fetch All Query Results
 * @returns Promise resolving to an array of QueryResults
 */
export const fetchQueryResults = async (): Promise<QueryResult[]> => {
  const response = await api.get<QueryResult[]>('query-results/');
  return response.data;
};

/**
 * Create a New Query Result
 * @param queryResult - QueryResult parameters
 * @returns Promise resolving to QueryResult
 */
export const createQueryResult = async (queryResult: QueryResult): Promise<QueryResult> => {
  const response = await api.post<QueryResult>('query-results/create/', queryResult);
  return response.data;
};

/**
 * Fetch QueryResult Configuration
 * @returns Promise resolving to QueryResultConfig
 */
export const fetchQueryResultConfig = async (): Promise<QueryResultConfig> => {
  const response = await api.get<QueryResultConfig>('query-results-config/');
  return response.data;
};

/**
 * Update QueryResult Configuration
 * @param config - QueryResultConfig parameters
 * @returns Promise resolving to QueryResultConfig
 */
export const updateQueryResultConfig = async (config: Partial<QueryResultConfig>): Promise<QueryResultConfig> => {
  const response = await api.put<QueryResultConfig>('query-results-config/', config);
  return response.data;
};

/**
 * Run a Specific Task
 * @param taskId - ID of the task to run
 * @returns Promise resolving to any (handle response as needed)
 */
export const runTask = async (taskId: number): Promise<any> => {
  const response = await api.post(`tasks/${taskId}/run/`, {});
  return response.data;
};
