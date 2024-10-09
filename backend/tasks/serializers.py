from rest_framework import serializers
from .models import Task, ExecutionHistory, DatabaseConnection


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
        fields = '__all__'

    def create(self, validated_data):
        db_conn_data = validated_data.pop('database_connection')
        db_conn = DatabaseConnection.objects.create(**db_conn_data)
        task = Task.objects.create(
            database_connection=db_conn, **validated_data
            )
        return task

    def update(self, instance, validated_data):
        db_conn_data = validated_data.pop('database_connection', None)
        if db_conn_data:
            for attr, value in db_conn_data.items():
                setattr(instance.database_connection, attr, value)
            instance.database_connection.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ExecutionHistorySerializer(serializers.ModelSerializer):
    task_name = serializers.CharField(source='task.name', read_only=True)

    class Meta:
        model = ExecutionHistory
        fields = '__all__'
