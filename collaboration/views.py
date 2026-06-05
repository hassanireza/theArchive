from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Task
import json


@login_required
def index(request):
    return render(request, "collaboration/index.html")


@login_required
def get_tasks(request):
    tasks = Task.objects.filter(user=request.user)

    data = [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
        }
        for task in tasks
    ]

    return JsonResponse(data, safe=False)


@login_required
@require_POST
def create_task(request):
    data = json.loads(request.body)

    task = Task.objects.create(
        user=request.user,
        title=data.get("title"),
        description=data.get("description", ""),
        status=data.get("status", "todo"),
    )

    return JsonResponse({
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
    })


@login_required
@require_POST
def update_task(request):
    data = json.loads(request.body)

    task = get_object_or_404(
        Task,
        id=data["id"],
        user=request.user
    )

    if "status" in data:
        task.status = data["status"]

    if "title" in data:
        task.title = data["title"]

    task.save()

    return JsonResponse({
        "success": True
    })


@login_required
@require_POST
def delete_task(request):
    data = json.loads(request.body)

    task = get_object_or_404(
        Task,
        id=data["id"],
        user=request.user
    )

    task.delete()

    return JsonResponse({
        "success": True
    })