from django.db import models, connections
from django.core.exceptions import ValidationError
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json
from datetime import datetime


class Task(models.Model):
    """
    Model to store task details.
    """
    name = models.CharField(max_length=255)
    query = models.TextField()
    schedule = models.CharField(max_length=100)  # Cron expression
    is_active = models.BooleanField(default=True)
    last_run = models.DateTimeField(null=True, blank=True)
    database_connection = models.ForeignKey(
        'DatabaseConnection', on_delete=models.CASCADE, related_name='tasks'
    )
    periodic_task = models.ForeignKey(
        PeriodicTask,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scheduled_tasks'
    )

    def save(self, *args, **kwargs):
        super(Task, self).save(*args, **kwargs)
        self.create_or_update_periodic_task()

    def delete(self, *args, **kwargs):
        if self.periodic_task:
            self.periodic_task.delete()
        super(Task, self).delete(*args, **kwargs)

    def create_or_update_periodic_task(self):
        schedule, created = CrontabSchedule.objects.get_or_create(
            **self._parse_cron_expression(self.schedule)
        )
        task_name = f'Task {self.id}: {self.name}'
        task_kwargs = {
            'crontab': schedule,
            'name': task_name,
            'task': 'tasks.tasks.execute_task',
            'args': json.dumps([self.id]),
            'enabled': self.is_active,
        }
        if self.periodic_task:
            # Update existing PeriodicTask
            for key, value in task_kwargs.items():
                setattr(self.periodic_task, key, value)
            self.periodic_task.save()
        else:
            # Create new PeriodicTask
            self.periodic_task = PeriodicTask.objects.create(**task_kwargs)
            super(Task, self).save(update_fields=['periodic_task'])

    def _parse_cron_expression(self, cron_expression):
        """
        Parses a cron expression and returns a dictionary
        suitable for CrontabSchedule.
        """
        fields = cron_expression.strip().split()
        if len(fields) != 5:
            raise ValueError('Invalid cron expression. Expected 5 fields.')
        return {
            'minute': fields[0],
            'hour': fields[1],
            'day_of_month': fields[2],
            'month_of_year': fields[3],
            'day_of_week': fields[4],
        }

    def __str__(self):
        return self.name


class ExecutionHistory(models.Model):
    """
    Model to store execution history of tasks.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILURE', 'Failure'),
    ]
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name='executions'
    )
    execution_time = models.DateTimeField(default=datetime.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    result = models.TextField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)

    def __str__(self):
        return (
            f'{self.task.name} - '
            f'{self.execution_time.strftime("%Y-%m-%d %H:%M:%S")}'
        )


class DatabaseConnection(models.Model):
    """
    Model to store external database connection details.
    """
    name = models.CharField(max_length=255)
    host = models.CharField(max_length=255)
    port = models.PositiveIntegerField(default=5432)
    database_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.name
