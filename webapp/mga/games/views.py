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

@never_cache
def game_display(request, game_slug):
    game_template = '%s/%s-display.html' % (game_slug, game_slug)
    return render(request, game_template, {})

@never_cache
def game_controller(request, game_slug):
    game_template = '%s/%s-controller.html' % (game_slug, game_slug)
    return render(request, game_template, {})

def get_game_list(request):
    games = Game.objects.all()
    game_list = []
    for game in games:
        game_list.append(game.get_json())
    return HttpResponse(json.dumps({'success': True, 'games': game_list}))