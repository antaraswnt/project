from django.db import models

# Create your models here.
class Game(models.Model):
    title = models.CharField(max_length=100)
    slug = models.CharField(max_length=30)
    display_url = models.URLField(max_length=200)
    control_url = models.URLField(max_length=200)
    is_active = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % (self.title)