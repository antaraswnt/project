from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def home(request):
    value = request.GET.get('value', '')
    return HttpResponse('<html><body><p>' + value + '</p></body></html>');