from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("health/", views.health, name="health"),

    path("api/tasks/", views.get_tasks),
    path("api/tasks/create/", views.create_task),
    path("api/tasks/update/", views.update_task),
    path("api/tasks/delete/", views.delete_task),
]
