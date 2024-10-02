from django.contrib import admin
from .models import Task, ExecutionHistory, DatabaseConnection


@admin.register(DatabaseConnection)
class DatabaseConnectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'host', 'port', 'database_name', 'username')
    search_fields = ('name', 'host', 'database_name', 'username')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'schedule', 'last_run', 'database_connection')
    list_filter = ('is_active', 'database_connection')
    search_fields = ('name',)
