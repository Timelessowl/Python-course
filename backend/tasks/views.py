from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Task, ExecutionHistory
from .serializers import TaskSerializer, ExecutionHistorySerializer
import psycopg2

@api_view(['POST'])
def check_connection(request):
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

        # Attempt to connect to the PostgreSQL database
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

class TaskCreateView(generics.CreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TaskListView(generics.ListAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
