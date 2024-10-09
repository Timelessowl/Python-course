from django.urls import include, path
from rest_framework import routers
from .views import TaskViewSet, DatabaseConnectionViewSet, ExecutionHistoryViewSet

router = routers.DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'database-connections', DatabaseConnectionViewSet)
router.register(r'execution-histories', ExecutionHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
