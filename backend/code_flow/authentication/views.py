from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer,LoginSerializer
from .models import User


class RegisterView(APIView):
    def post(self,request):
        serializer = RegisterSerializer(data = request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]


            if User.find_by_email(email=email):
                return Response({"error ": "User already exist"},status=status.HTTP_400_BAD_REQUEST)
            user_id = User.create_user(email,password=password)
            return Response({"message":"User created","user_id":user_id},status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from .models import User

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            if User.find_by_email(email):
                return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

            user_id = User.create_user(email, password)
            return Response({"message": "User created", "user_id": user_id}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            # Find the user and their stored password
            user, stored_password = User.find_by_email(email)

            # Ensure the user exists and verify the password
            if user and stored_password and User.verify_password(stored_password, password):
                # Create a token payload manually
                refresh = RefreshToken()
                refresh['user_id'] = user.id
                refresh['email'] = user.email

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)

            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

