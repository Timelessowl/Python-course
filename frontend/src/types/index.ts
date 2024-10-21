// src/types/index.ts

// ------------------------
// Database Connection Types
// ------------------------

export type DatabaseConnectionInput = {
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
};

export type DatabaseConnection = {
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
  database_connection: DatabaseConnection;
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

export type ExecutionHistoryEntry = {
  id: number;
  task: string;
  execution_time: string;
  status: string;
  result: string;
  error_message: string;
};

export type CheckConnectionResponse = {
  is_connection_successful: boolean;
  error?: string;
};
