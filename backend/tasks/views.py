from rest_framework import viewsets,permissions
from .models import Task
from .serializers import TaskSerializer

# Create your views here.

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class=TaskSerializer
    permission_classes=[permissions.IsAuthenticated]
    search_fields=['title','description']

    def get_queryset(self):
        queryset=Task.objects.filter(user=self.request.user)
        status=self.request.query_params.get('status')
        if status == 'completed':
            queryset=queryset.filter(completed=True)
        elif status=='pending':
            queryset=queryset.filter(completed=False)
        return queryset
    
    def perform_create(self,serializer):
        serializer.save(user=self.request.user)
    




    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)