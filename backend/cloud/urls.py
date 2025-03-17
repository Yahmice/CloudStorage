"""
URL configuration for cloud project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from myapp.views import (
    UserProfileView, RegisterView, LoginView, logout_view,
    AdminView, AdminUserViewSet, FileListView, FileUploadView, 
    FileDetailView, FileDownloadView, FileShareView, FileRenameView,
    SharedFileView
)

# Создаем роутер для АПИ
router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin-panel/', AdminView.as_view(), name='admin-panel'),
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', logout_view, name='logout'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Основные операции с файлами
    path('api/files/', FileListView.as_view(), name='file-list'),
    path('api/files/upload/', FileUploadView.as_view(), name='file-upload'),
    path('api/files/<uuid:pk>/', FileDetailView.as_view(), name='file-detail'),
    
    # Дополнительные действия с файлами
    path('api/files/<uuid:pk>/download/', FileDownloadView.as_view(), name='file-download'),
    path('api/files/<uuid:pk>/share/', FileShareView.as_view(), name='file-share'),
    path('api/files/<uuid:pk>/rename/', FileRenameView.as_view(), name='file-rename'),
    
    # Доступ к файлам по общей ссылке
    path('api/files/shared/<uuid:share_link>/', SharedFileView.as_view(), name='shared-file'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
