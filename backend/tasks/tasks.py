from celery import shared_task
from django.db import connection
from django.utils import timezone
from .models import Task, ExecutionHistory
from celery.exceptions import MaxRetriesExceededError


@shared_task(bind=True, max_retries=3)
def execute_task(self, task_id):
    """
    Celery task to execute the SQL query of a given Task.
    """
    try:
        task = Task.objects.get(id=task_id)
        query = task.query.strip()
        # Simple validation to allow only SELECT queries
        if not query.lower().startswith('select'):
            raise ValueError('Only SELECT queries are allowed.')

        with connection.cursor() as cursor:
            cursor.execute(query)
            if cursor.description:
                columns = [col[0] for col in cursor.description]
                result = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
            else:
                result = []

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
        try:
            self.retry(exc=e, countdown=60)
        except MaxRetriesExceededError:
            pass  # Handle max retries exceeded if needed
