from rest_framework import serializers
from .models import DatabaseConnection, Task, ExecutionHistory


class DatabaseConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseConnection
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    database_connection = DatabaseConnectionSerializer()

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["id", "last_run", "periodic_task"]

    def create(self, validated_data):
        database_connection = validated_data.pop("database_connection", None)
        database_connection_data = validated_data.pop("database_connection_data", None)

        if database_connection_data:
            db_conn_serializer = DatabaseConnectionSerializer(
                data=database_connection_data
            )
            db_conn_serializer.is_valid(raise_exception=True)
            database_connection = db_conn_serializer.save()

        if not database_connection:
            raise serializers.ValidationError(
                {"database_connection": "This field is required."}
            )

        task = Task.objects.create(
            database_connection=database_connection, **validated_data
        )
        return task

    def update(self, instance, validated_data):
        database_connection_data = validated_data.pop("database_connection", None)
        if database_connection_data:
            database_connection, _ = DatabaseConnection.objects.get_or_create(
                name=database_connection_data["name"], defaults=database_connection_data
            )
            instance.database_connection = database_connection

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ExecutionHistorySerializer(serializers.ModelSerializer):
    task = TaskSerializer()

    class Meta:
        model = ExecutionHistory
        fields = "__all__"
