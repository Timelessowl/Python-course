from django.contrib import admin
from .models import Task, ExecutionHistory


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'schedule', 'last_run')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(ExecutionHistory)
class ExecutionHistoryAdmin(admin.ModelAdmin):
    list_display = ('task', 'execution_time', 'status')
    list_filter = ('status', 'execution_time')
    search_fields = ('task__name',)
