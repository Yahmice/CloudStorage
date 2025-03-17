from django.urls import path, include
from rest_framework.routers import DefaultRouter
from myapp.views import FileStorageViewSet, SharedFileView

router = DefaultRouter()
router.register(r'files', FileStorageViewSet, basename='file')
router.register(r'files/shared/(?P<share_link>[^/]+)', SharedFileView, basename='shared-file')

urlpatterns = [
    path('', include(router.urls)),
] 