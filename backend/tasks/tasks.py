from celery import shared_task
from .models import Task, ExecutionHistory, QueryResultConfig
from django.conf import settings
import psycopg2
import json

@shared_task
def execute_task(task_id):
    """
    Executes a specific task:
    1. Runs the task's SQL query on the source database.
    2. Stores the results in the target database.
    3. Records the execution history.
    """
    try:
        task = Task.objects.select_related('database_connection', 'result_database').get(id=task_id)

        source_db = task.database_connection
        source_conn = psycopg2.connect(
            dbname=source_db.database_name,
            user=source_db.username,
            password=source_db.password,
            host=source_db.host,
            port=source_db.port
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

        config, created = QueryResultConfig.objects.get_or_create(
            id=1,
            defaults={'table_name': 'query_results'}
        )
        table_name = config.table_name

        target_db = settings.DATABASES['default']
        target_conn = psycopg2.connect(
            dbname=target_db['NAME'],
            user=target_db['USER'],
            password=target_db['PASSWORD'],
            host=target_db['HOST'],
            port=target_db['PORT']
        )
        target_cursor = target_conn.cursor()

        create_table_query = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                id SERIAL PRIMARY KEY,
                task_id INTEGER REFERENCES tasks_task(id),
                execution_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50),
                result_data JSONB,
                error_message TEXT
            );
        """
        target_cursor.execute(create_table_query)
        target_conn.commit()

        insert_result_query = f"""
            INSERT INTO {table_name} (task_id, status, result_data)
            VALUES (%s, %s, %s);
        """
        target_cursor.execute(insert_result_query, (task.id, 'SUCCESS', json.dumps(result_data)))
        target_conn.commit()
        target_cursor.close()
        target_conn.close()

        ExecutionHistory.objects.create(
            task=task,
            status='SUCCESS',
            result_data=result_data
        )

    except Task.DoesNotExist:
        ExecutionHistory.objects.create(
            task_id=task_id,
            status='FAILURE',
            error_message=f"Task with ID {task_id} does not exist."
        )
    except Exception as e:
        ExecutionHistory.objects.create(
            task_id=task_id,
            status='FAILURE',
            error_message=str(e)
        )
