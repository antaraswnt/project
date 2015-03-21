from django.db import models

# Create your models here.
class Game(models.Model):
    title = models.CharField(max_length=100)
    slug = models.CharField(max_length=30)
    description = models.CharField(max_length=255,null=True,blank=True)
    display_url = models.URLField(max_length=200)
    control_url = models.URLField(max_length=200)
    is_active = models.BooleanField(default=False)
    large_image_url = models.URLField(max_length=200,null=True,blank=True)
    small_image_url = models.URLField(max_length=200,null=True,blank=True)

    def __unicode__(self):
        return u'%s' % (self.title)

    def get_json(self):
        json = {
            'title' : self.title,
            'slug' : self.slug,
            'description' : self.description,
            'display_url' : self.display_url,
            'controller_url' : self.control_url,
            'large_image_url' : self.large_image_url,
            'small_image_url' : self.small_image_url,
        }
        return json