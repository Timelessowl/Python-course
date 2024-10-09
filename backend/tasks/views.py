from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task, ExecutionHistory, DatabaseConnection
from .serializers import TaskSerializer, ExecutionHistorySerializer, DatabaseConnectionSerializer
from .tasks import execute_task


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tasks.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """
        Custom action to manually run a task.
        """
        task = self.get_object()
        execute_task.delay(task.id)
        return Response({'status': 'Task execution started'})


class ExecutionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing execution history.
    """
    queryset = ExecutionHistory.objects.all().order_by('-execution_time')
    serializer_class = ExecutionHistorySerializer

    def get_queryset(self):
        """
        Optionally restricts the returned executions to a given task,
        by filtering against a `task_id` query parameter in the URL.
        """
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('task_id')
        if task_id is not None:
            queryset = queryset.filter(task__id=task_id)
        return queryset

class DatabaseConnectionViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing DatabaseConnection instances.
    """
    queryset = DatabaseConnection.objects.all()
    serializer_class = DatabaseConnectionSerializer
