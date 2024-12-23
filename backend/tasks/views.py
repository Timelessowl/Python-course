import psycopg2
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Task, ExecutionHistory, DatabaseConnection
from .serializers import (
    TaskSerializer,
    DatabaseConnectionSerializer,
    ExecutionHistorySerializer,
)
from .tasks import execute_task


class CreateTask(APIView):
    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save()
            return Response({"id": task.id}, status=status.HTTP_201_CREATED)
        else:
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )


class TaskList(APIView):
    def get(self, request):
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TaskDetail(APIView):
    def put(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        task.delete()
        return Response(
            {"message": "Запрос удален."}, status=status.HTTP_204_NO_CONTENT
        )


class RunTask(APIView):
    def post(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        celery_result = execute_task.delay(task.id)
        ExecutionHistory.objects.create(
            task=task,
            status="PENDING",
            celery_task_id=celery_result.id,
            retry_count=0,
        )
        return Response(
            {"message": f'Запрос "{task.name}" успешно запущен.'},
            status=status.HTTP_200_OK,
        )


class ExecutionHistoryList(APIView):
    def get(self, request):
        histories = ExecutionHistory.objects.all()
        serializer = ExecutionHistorySerializer(histories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CheckDatabaseConnection(APIView):
    def post(self, request):
        data = request.data
        required_fields = [
            "database_name",
            "username",
            "password",
            "host",
            "port",
        ]
        if not all(field in data for field in required_fields):
            return Response(
                {
                    "is_connection_successful": False,
                    "error": "Недостаточно данных для подклбчения.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            psycopg2.connect(
                dbname=data["database_name"],
                user=data["username"],
                password=data["password"],
                host=data["host"],
                port=data["port"],
            ).close()
            return Response(
                {"is_connection_successful": True}, status=status.HTTP_200_OK
            )
        except psycopg2.Error as e:
            return Response(
                {"is_connection_successful": False, "error": str(e)},
                status=status.HTTP_200_OK,
            )


class DatabaseConnectionList(APIView):
    def get(self, request):
        connections = DatabaseConnection.objects.all()
        serializer = DatabaseConnectionSerializer(connections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
