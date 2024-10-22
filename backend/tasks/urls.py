from django.urls import path
from .views import (
    check_connection,
    create_task,
    list_tasks,
    list_query_results,
    create_query_result,
    query_result_config,
    run_task_view,
    list_execution_histories
)

urlpatterns = [
    path('check-connection/', check_connection, name='check_connection'),
    path('tasks/', list_tasks, name='task_list'),
    path('tasks/create/', create_task, name='create_task'),
    path('query-results/', list_query_results, name='query_result_list'),
    path('query-results/create/', create_query_result, name='create_query_result'),
    path('tasks/<int:task_id>/run/', run_task_view, name='run_specific_task'),  # New endpoint
    path('execution-histories/', list_execution_histories, name='list_execution_histories'),  # Add this line

    path('query-results-config/', query_result_config, name='query_result_config'),
]