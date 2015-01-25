from django.conf.urls import patterns, include, url

urlpatterns = patterns('games.views',
    url(r'^$', 'controller', name='controller_main'),
    url(r'^portal/$', 'portal', name='portal_main'),
    url(r'^accounts/login/$', 'login_view', name='login'),
    url(r'^accounts/logout/$', 'logout_view', name='logout'),

    url(r'^games/chat-display/$', 'chat_display', name='chat_display'),
    url(r'^games/chat-controller/$', 'chat_controller', name='chat_controller'),
)