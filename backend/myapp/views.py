from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.http import FileResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser, FileStorage
from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    UserUpdateSerializer, AdminUserSerializer, FileStorageUploadSerializer,
    FileStorageSerializer
)
import uuid
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.conf import settings


class IsOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user.is_admin or
            obj.owner == request.user
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'detail': 'CSRF cookie set'})

    @method_decorator(csrf_protect)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)  # Автоматический вход после регистрации
            return Response({
                'user_id': user.id,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'detail': 'CSRF cookie set'})

    @method_decorator(csrf_protect)
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                login(request, user)
                response = Response({
                    'user_id': user.id,
                    'username': user.username
                })
                return response
            return Response({
                'error': 'Неверное имя пользователя или пароль'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ensure_csrf_cookie
def logout_view(request):
    try:
        logout(request)
        return Response({'message': 'Успешный выход из системы'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def toggle_admin(self, request, pk=None):
        user = self.get_object()
        user.is_admin = not user.is_admin
        user.save()
        return Response({'status': 'success', 'is_admin': user.is_admin})

    @action(detail=True, methods=['get'])
    def storage_info(self, request, pk=None):
        user = self.get_object()
        return Response(user.get_storage_info())


class FileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_admin:
            files = FileStorage.objects.all()
        else:
            files = FileStorage.objects.filter(owner=request.user)
        
        serializer = FileStorageSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)


class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            file_obj = request.FILES.get('file')
            comment = request.data.get('comment', '')
            
            if not file_obj:
                return Response(
                    {'error': 'Файл не был предоставлен'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Создаем объект FileStorage
            file_storage = FileStorage(
                original_name=file_obj.name,
                file=file_obj,
                comment=comment,
                size=file_obj.size,
                owner=request.user
            )
            file_storage.save()

            serializer = FileStorageSerializer(file_storage, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FileDetailView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_object(self, pk):
        return FileStorage.objects.get(pk=pk)

    def get(self, request, pk):
        file_storage = self.get_object(pk)
        serializer = FileStorageSerializer(file_storage, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        file_storage = self.get_object(pk)
        file_storage.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_object(self, pk):
        return FileStorage.objects.get(pk=pk)

    def get(self, request, pk):
        file_storage = self.get_object(pk)
        file_storage.update_last_download()
        response = FileResponse(file_storage.file, as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{file_storage.original_name}"'
        return response


class FileShareView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_object(self, pk):
        return FileStorage.objects.get(pk=pk)

    def get(self, request, pk):
        file_storage = self.get_object(pk)
        if not file_storage.share_link:
            file_storage.share_link = uuid.uuid4()
            file_storage.share_link_expiry = timezone.now() + timedelta(days=7)
            file_storage.save()
        
        base_url = settings.BASE_URL if hasattr(settings, 'BASE_URL') else request.build_absolute_uri('/')[:-1]
        share_url = f"{base_url}/api/files/shared/{file_storage.share_link}/"
        print(f"Генерация ссылки: {share_url}")
        return Response({'share_link': share_url})


class FileRenameView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_object(self, pk):
        return FileStorage.objects.get(pk=pk)

    def patch(self, request, pk):
        file_storage = self.get_object(pk)
        new_name = request.data.get('name')
        
        if not new_name:
            return Response(
                {'error': 'Новое имя файла не указано'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_storage.name = new_name
        file_storage.save()
        
        serializer = FileStorageSerializer(file_storage, context={'request': request})
        return Response(serializer.data)


class SharedFileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, share_link):
        try:
            print(f"Попытка доступа к файлу по ссылке: {share_link}")
            file_storage = FileStorage.objects.get(
                share_link=share_link,
                share_link_expiry__gt=timezone.now()
            )
            file_storage.update_last_download()
            response = FileResponse(file_storage.file, as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{file_storage.original_name}"'
            return response
        except FileStorage.DoesNotExist:
            print(f"Файл не найден для ссылки: {share_link}")
            return Response(
                {'error': 'Файл не найден или ссылка истекла'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Ошибка при доступе к файлу: {str(e)}")
            return Response(
                {'error': f'Произошла ошибка: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 