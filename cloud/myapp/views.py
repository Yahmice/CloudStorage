from rest_framework.views import APIView
from django.shortcuts import render, redirect
from rest_framework import viewsets, permissions, status
from django.contrib.auth import login
from rest_framework.response import Response
from .serializers import RegisterSerializer, LoginSerializer


def index(request):
    return render(request, 'base.html')


# Представление для управления пользователями
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

