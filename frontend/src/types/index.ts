export type DatabaseConnectionInput = {
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
};

export type DatabaseConnection = {
  id: number;
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
};

export type TaskInput = {
  name: string;
  query: string;
  schedule: string;
  database_connection: DatabaseConnectionInput;
};

export type Task = {
  id: number;
  name: string;
  query: string;
  schedule: string;
  is_active: boolean;
  last_run: string | null;
  database_connection: DatabaseConnection;
};

export type QueryResult = {
  id: number;
  task: number;
  execution_time: string;
  status: string;
  result_data: any; // JSON data
  error_message: string | null;
};

export type ExecutionHistoryEntry = {
  id: number;
  task_name: string;
  execution_time: string;
  status: string;
  result: string;
  error_message: string;
};

export type QueryResultConfig = {
  id: number;
  table_name: string;
};

export type CheckConnectionResponse = {
  is_connection_successful: boolean;
  error?: string;
};
