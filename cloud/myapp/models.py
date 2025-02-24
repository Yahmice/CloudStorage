from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
import os


# Расширение встроенной модели User
class CustomUser(AbstractUser):
    is_admin = models.BooleanField(default=False)


# Модель для файлового хранилища
class UserFile(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='user_files/')
    original_name = models.CharField(max_length=255)
    comment = models.CharField(max_length=255, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_name

    def save(self, *args, **kwargs):
        self.original_name = os.path.basename(self.file.name)
        super().save(*args, **kwargs)