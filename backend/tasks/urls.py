from django.urls import path
from .views import (
    CreateTask,
    TaskList,
    TaskDetail,
    RunTask,
    ExecutionHistoryList,
    CheckDatabaseConnection,
)

urlpatterns = [
    path('tasks/', TaskList.as_view(), name='task-list'),
    path('tasks/create/', CreateTask.as_view(), name='task-create'),
    path('tasks/<int:task_id>/', TaskDetail.as_view(), name='task-detail'),
    path('tasks/<int:task_id>/run/', RunTask.as_view(), name='task-run'),
    path('executions/', ExecutionHistoryList.as_view(), name='execution-history'),
    path('check-connection/', CheckDatabaseConnection.as_view(), name='check-connection'),
]
