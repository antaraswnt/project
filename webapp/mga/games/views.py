from django.shortcuts import render
from django.http import HttpResponse
import settings

# Create your views here.
def home(request):
    return render(request, 'games/index.html', {})