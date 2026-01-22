from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)

        status = self.request.query_params.get('status')
        if status == 'completed':
            queryset = queryset.filter(completed=True)
        elif status == 'pending':
            queryset = queryset.filter(completed=False)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        total = queryset.count()
        completed = queryset.filter(completed=True).count()

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)

        return self.get_paginated_response({
            "tasks": serializer.data,
            "stats": {
                "total": total,
                "completed": completed
            }
        })

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


