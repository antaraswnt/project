from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'views.home', name='home'),
    url(r'^games/', include('games.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
