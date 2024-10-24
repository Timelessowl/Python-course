from rest_framework import serializers
from .models import Task, DatabaseConnection, ExecutionHistory, QueryResult, QueryResultConfig

class DatabaseConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseConnection
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

class TaskSerializer(serializers.ModelSerializer):
    database_connection = DatabaseConnectionSerializer()

    class Meta:
        model = Task
        fields = ['id', 'name', 'query', 'schedule', 'is_active', 'last_run', 'database_connection']

    def create(self, validated_data):
        db_conn_data = validated_data.pop('database_connection')
        db_conn = DatabaseConnection.objects.create(**db_conn_data)
        task = Task.objects.create(database_connection=db_conn, **validated_data)
        return task

    def update(self, instance, validated_data):
        db_conn_data = validated_data.pop('database_connection', None)
        if db_conn_data:
            db_conn = instance.database_connection
            for attr, value in db_conn_data.items():
                setattr(db_conn, attr, value)
            db_conn.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ExecutionHistorySerializer(serializers.ModelSerializer):
    task_name = serializers.CharField(source='task.name', read_only=True)

    class Meta:
        model = ExecutionHistory
        fields = ['id', 'task_name', 'execution_time', 'status', 'result', 'error_message']


class QueryResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryResult
        fields = ['id', 'task', 'execution_time', 'status', 'result_data', 'error_message']

class QueryResultConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryResultConfig
        fields = ['id', 'table_name']
