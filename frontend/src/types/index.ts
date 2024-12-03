export interface DatabaseConnectionInput {
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
}

export interface DatabaseConnection {
  id: number;
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
}

export interface TaskInput {
  name?: string;
  query?: string;
  schedule?: string;
  retry_delay?: number;
  max_retries?: number;
  is_active?: boolean;
  database_connection?: number;
  database_connection_data?: DatabaseConnectionInput;
}

export interface Task {
  id: number;
  name: string;
  query: string;
  schedule: string;
  retry_delay: number;
  max_retries: number;
  is_active: boolean;
  last_run: string | null;
  database_connection: DatabaseConnection;
}

export interface ExecutionHistory {
  id: number;
  task: {
    id: number;
    name: string;
  };
  execution_time: string;
  status: string;
  result_data?: any;
  error_message?: string | null;
  retry_count: number;
}
