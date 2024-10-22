from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Task, ExecutionHistory, QueryResult, QueryResultConfig
from .tasks import execute_task
from .serializers import (
    TaskSerializer,
    ExecutionHistorySerializer,
    QueryResultSerializer,
    QueryResultConfigSerializer
)
import psycopg2
from django.shortcuts import get_object_or_404


def get_or_create_query_result_config():
    """
    Retrieves the QueryResultConfig object.
    If it doesn't exist, creates one with default values.
    """
    obj, created = QueryResultConfig.objects.get_or_create(
        id=1, 
        defaults={'table_name': 'query_results'}
    )
    return obj


@api_view(['POST'])
def check_connection(request):
    """
    Checks the connection to a PostgreSQL database with provided parameters.
    """
    try:
        data = request.data

        database_name = data.get('database_name')
        username = data.get('username')
        password = data.get('password')
        host = data.get('host')
        port = data.get('port')

        if not all([database_name, username, password, host, port]):
            return Response(
                {'is_connection_successful': False, 'error': 'Missing connection parameters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        connection = psycopg2.connect(
            dbname=database_name,
            user=username,
            password=password,
            host=host,
            port=port
        )
        connection.close()
        return Response({'is_connection_successful': True}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'is_connection_successful': False, 'error': str(e)}, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_task(request):
    """
    Creates a new Task.
    """
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def list_tasks(request):
    """
    Retrieves a list of all Tasks.
    """
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def list_query_results(request):
    """
    Retrieves a list of all QueryResults.
    """
    query_results = QueryResult.objects.all()
    serializer = QueryResultSerializer(query_results, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_query_result(request):
    """
    Creates a new QueryResult.
    """
    serializer = QueryResultSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
def query_result_config(request):
    """
    Retrieves or updates the QueryResultConfig.
    """
    config = get_or_create_query_result_config()
    if request.method == 'GET':
        serializer = QueryResultConfigSerializer(config)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = QueryResultConfigSerializer(config, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def run_task_view(request, task_id):
    """
    Triggers the execution of a specific Task.
    """
    try:
        task = Task.objects.get(id=task_id, is_active=True)
        execute_task.delay(task.id)
        return Response(
            {'message': f'Task "{task.name}" has been triggered successfully.'},
            status=status.HTTP_200_OK
        )
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found or not active.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to run the task.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def list_execution_histories(request):
    """
    Retrieves a list of all ExecutionHistory entries.
    """
    execution_histories = ExecutionHistory.objects.all()
    serializer = ExecutionHistorySerializer(execution_histories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
