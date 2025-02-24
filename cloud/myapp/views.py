from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CustomUser, UserFile
from .serializers import UserSerializer, UserFileSerializer


# Представление для управления пользователями
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # Только для админов


# Представление для управления файлами
class UserFileViewSet(viewsets.ModelViewSet):
    serializer_class = UserFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return UserFile.objects.all()
        return UserFile.objects.filter(user=user)

    @action(detail=True, methods=['patch'])
    def rename(self, request, pk=None):
        file = self.get_object()
        new_name = request.data.get('new_name')
        if new_name:
            file.original_name = new_name
            file.save()
            return Response({'status': 'file renamed'})
        return Response({'error': 'new_name is required'}, status=status.HTTP_400_BAD_REQUEST)
