import psycopg2
import json
from celery import shared_task
from django.db import connection
from django.conf import settings
from .models import Task, ExecutionHistory
from celery.exceptions import MaxRetriesExceededError


@shared_task(bind=True)
def execute_task(self, task_id):
    source_conn = None
    source_cursor = None
    try:
        task = Task.objects.select_related("database_connection").get(
            id=task_id
        )

        execution_history, created = ExecutionHistory.objects.get_or_create(
            task=task,
            celery_task_id=self.request.id,
            defaults={
                "status": "PENDING",
                "retry_count": 0,
                "celery_task_id": self.request.id,
            },
        )

        if not created:
            execution_history.retry_count += 1

        if execution_history.retry_count > task.max_retries:
            execution_history.status = "FAILURE"
            execution_history.error_message = "Max retries exceeded"
            execution_history.save()
            raise MaxRetriesExceededError("Max retries exceeded")

        db_conn = task.database_connection
        source_conn = psycopg2.connect(
            dbname=db_conn.database_name,
            user=db_conn.username,
            password=db_conn.password,
            host=db_conn.host,
            port=db_conn.port,
        )
        source_cursor = source_conn.cursor()
        source_cursor.execute(task.query)
        results = source_cursor.fetchall()
        columns = [desc[0] for desc in source_cursor.description]

        result_data = {"columns": columns, "rows": results}

        table_name = settings.RESULT_TABLE_NAME

        with connection.cursor() as cursor:
            create_table_query = f"""
                CREATE TABLE IF NOT EXISTS "{table_name}" (
                    id SERIAL PRIMARY KEY,
                    task_id INTEGER REFERENCES tasks_task(id),
                    execution_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    result_data JSONB
                );
            """
            cursor.execute(create_table_query)

            insert_query = f"""
                INSERT INTO "{table_name}" (task_id, result_data)
                VALUES (%s, %s);
            """
            cursor.execute(insert_query, [task.id, json.dumps(result_data)])

        execution_history.status = "SUCCESS"
        execution_history.result_data = result_data
        execution_history.save()

    except Exception as e:
        execution_history.status = "RETRY"
        execution_history.error_message = str(e)
        execution_history.save()

        try:
            remaining_retries = task.max_retries - self.request.retries

            if remaining_retries > 0:
                raise self.retry(
                    exc=e,
                    countdown=task.retry_delay,
                    max_retries=task.max_retries,
                )
            else:
                execution_history.status = "FAILURE"
                execution_history.error_message = str(e)
                execution_history.save()
                raise e
        except MaxRetriesExceededError:
            execution_history.status = "FAILURE"
            execution_history.error_message = "Max retries exceeded"
            execution_history.save()
            raise

    finally:
        if source_cursor is not None:
            source_cursor.close()
        if source_conn is not None:
            source_conn.close()
