from django.conf.urls import patterns, include, url

urlpatterns = patterns('games.views',
    url(r'^$', 'controller', name='controller_main'),
    url(r'^portal/$', 'portal', name='portal_main'),
    url(r'^accounts/login/$', 'login_view', name='login'),
    url(r'^accounts/logout/$', 'logout_view', name='logout'),
)