export interface Task {
  id: number;
  name: string;
  is_active: boolean;
  schedule: string;
}

export interface ExecutionHistoryEntry {
  id: number;
  task: number;
  execution_time: string;
  status: string;
  result: string;
  error_message: string;
}

export interface DatabaseConnection {
  id: number;
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
}
