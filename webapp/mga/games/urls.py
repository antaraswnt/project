from django.conf.urls import patterns, include, url

urlpatterns = patterns('games.views',
    url(r'^$', 'home', name='home'),
)