from celery import shared_task
from django.utils import timezone
from .models import Task, ExecutionHistory
from django.db import connections


@shared_task(bind=True, max_retries=3)
def execute_task(self, task_id):
    """
    Celery task to execute the SQL query of a given Task
    on the specified database.
    """
    try:
        task = Task.objects.select_related(
            'database_connection'
        ).get(id=task_id)
        db_conn = task.database_connection

        # Create a new database connection dynamically
        db_settings = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': db_conn.database_name,
            'USER': db_conn.username,
            'PASSWORD': db_conn.password,
            'HOST': db_conn.host,
            'PORT': db_conn.port,
        }

        # Create a unique alias for the database connection
        db_alias = f'task_{task_id}_connection'

        # Add the database connection to Django's connections
        connections.databases[db_alias] = db_settings

        query = task.query.strip()
        # Simple validation to allow only SELECT queries
        if not query.lower().startswith('select'):
            raise ValueError('Only SELECT queries are allowed.')

        with connections[db_alias].cursor() as cursor:
            cursor.execute(query)
            if cursor.description:
                columns = [col[0] for col in cursor.description]
                result = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
            else:
                result = []

        # Remove the dynamic database connection
        del connections.databases[db_alias]

        # Save execution history
        ExecutionHistory.objects.create(
            task=task,
            status='SUCCESS',
            result=str(result),
        )

        # Update task's last_run
        task.last_run = timezone.now()
        task.save(update_fields=['last_run'])

    except Exception as e:
        # Save execution history with error
        ExecutionHistory.objects.create(
            task_id=task_id,
            status='FAILURE',
            error_message=str(e),
        )
        # Retry the task
        self.retry(exc=e, countdown=60)
