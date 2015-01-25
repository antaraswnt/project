import json
import settings

from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.cache import never_cache
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

# Create your views here.
@never_cache
def portal(request):
    return render(request, 'games/portal.html', {})

@never_cache
@login_required
def controller(request):
    return render(request, 'games/controller.html', {})
    
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponse(json.dumps({'success': True}))
            else:
                return HttpResponse(json.dumps({'success': False, 'error': 'Account disabled for the user.'}))
        else:
            return HttpResponse(json.dumps({'success': False, 'error': 'Invalid login credentials.'}))
    else:
        return render(request, 'games/login.html', {})

def logout_view(request):
    logout(request)
    return render(request, 'games/logout.html', {})