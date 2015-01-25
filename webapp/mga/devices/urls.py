from django.conf.urls import patterns, include, url

urlpatterns = patterns('devices.views',
    url(r'^register/', 'register_device', name='register_device'),
)