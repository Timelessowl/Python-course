from celery import shared_task
from django.db import connection
from django.conf import settings
from .models import Task, ExecutionHistory
import psycopg2
import json

@shared_task(bind=True, max_retries=None)
def execute_task(self, task_id):
    """
    Executes a specific task:
    1. Runs the task's SQL query on the source database.
    2. Inserts results into the specified table.
    3. Records the execution history.
    """
    try:
        # Fetch the Task instance
        task = Task.objects.select_related('database_connection').get(id=task_id)

        # Connect to the source database
        db_conn = task.database_connection
        source_conn = psycopg2.connect(
            dbname=db_conn.database_name,
            user=db_conn.username,
            password=db_conn.password,
            host=db_conn.host,
            port=db_conn.port
        )
        source_cursor = source_conn.cursor()
        source_cursor.execute(task.query)
        results = source_cursor.fetchall()
        columns = [desc[0] for desc in source_cursor.description]
        source_cursor.close()
        source_conn.close()

        result_data = {
            'columns': columns,
            'rows': results
        }

        # Таблица для хранения результатов
        table_name = settings.RESULT_TABLE_NAME

        with connection.cursor() as cursor:
            # Create table if it doesn't exist
            create_table_query = f'''
                CREATE TABLE IF NOT EXISTS "{table_name}" (
                    id SERIAL PRIMARY KEY,
                    task_id INTEGER REFERENCES tasks_task(id),
                    execution_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    result_data JSONB
                );
            '''
            cursor.execute(create_table_query)

            insert_query = f'''
                INSERT INTO "{table_name}" (task_id, result_data)
                VALUES (%s, %s);
            '''
            cursor.execute(insert_query, [task.id, json.dumps(result_data)])

        ExecutionHistory.objects.create(
            task=task,
            status='SUCCESS',
            result_data=result_data
        )

    except Exception as e:
        if self.request.retries < task.max_retries:
            raise self.retry(exc=e, countdown=task.retry_delay)
        else:
            ExecutionHistory.objects.create(
                task=task,
                status='FAILURE',
                error_message=str(e)
            )
            raise e
