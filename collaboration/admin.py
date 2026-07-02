from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "status", "updated_at")
    list_filter = ("status", "user")
    search_fields = ("title", "description")
