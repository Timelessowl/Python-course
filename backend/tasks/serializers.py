from rest_framework import serializers
from .models import Task, ExecutionHistory


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.
    """
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('last_run', 'periodic_task')


class ExecutionHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for the ExecutionHistory model.
    """
    task_name = serializers.CharField(source='task.name', read_only=True)

    class Meta:
        model = ExecutionHistory
        fields = '__all__'
