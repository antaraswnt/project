from django.conf.urls import patterns, include, url

urlpatterns = patterns('games.views',
    url(r'^$', 'controller', name='controller_main'),
    url(r'^portal/$', 'portal', name='portal_main'),
    url(r'^accounts/login/$', 'login_view', name='login'),
    url(r'^accounts/logout/$', 'logout_view', name='logout'),

    url(r'^games/(?P<game_slug>[\w-]+)/display/$', 'game_display', name='game_display'),
    url(r'^games/(?P<game_slug>[\w-]+)/controller/$', 'game_controller', name='game_controller'),
    url(r'^api/games/$', 'get_game_list', name='get_game_list'),
    url(r'^api/games/(?P<game_slug>[\w-]+)/$', 'get_game_list', name='get_game_list'),
)