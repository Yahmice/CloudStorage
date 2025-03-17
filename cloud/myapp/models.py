from django.contrib.auth.models import AbstractUser
from django.db import models
from .validators import validate_username, validate_email
import uuid
from django.utils import timezone


# Расширение встроенной модели User
class CustomUser(AbstractUser):
    username = models.CharField(
        max_length=20,
        unique=True,
        validators=[validate_username],
        verbose_name='Логин'
    )
    email = models.EmailField(
        unique=True,
        validators=[validate_email],
        verbose_name='Email'
    )
    is_admin = models.BooleanField(default=False, verbose_name='Администратор')

    def __str__(self):
        return self.username
    # Получаем информацию о хранилище пользователя
    def get_storage_info(self):
        storage = self.storage.first()
        if storage:
            return {
                'file_count': storage.file_count,
                'total_size': storage.total_size,
            }
        return {'file_count': 0, 'total_size': 0}

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'


class FileStorage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='files/')
    comment = models.TextField(blank=True, null=True)
    size = models.BigIntegerField()
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='files')
    upload_date = models.DateTimeField(auto_now_add=True)
    last_download = models.DateTimeField(null=True, blank=True)
    share_link = models.UUIDField(unique=True, null=True, blank=True)
    share_link_expiry = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"

    def save(self, *args, **kwargs):
        if not self.share_link:
            self.share_link = uuid.uuid4()
        super().save(*args, **kwargs)

    def update_last_download(self):
        self.last_download = timezone.now()
        self.save() 