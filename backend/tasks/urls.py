from django.urls import include, path
from rest_framework import routers
from .views import TaskViewSet, ExecutionHistoryViewSet

router = routers.DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'executions', ExecutionHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
