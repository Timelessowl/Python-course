from django.urls import path
from .views import check_connection, TaskCreateView, TaskListView

urlpatterns = [
    path('check-connection/', check_connection, name='check_connection'),
    path('tasks/', TaskListView.as_view(), name='task_list'),
    path('tasks/create/', TaskCreateView.as_view(), name='create_task'),
]