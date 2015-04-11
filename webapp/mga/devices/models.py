from django.db import models
from django_extensions.db.fields import UUIDField

# Create your models here.
class Relay(models.Model):
    host = models.CharField(max_length=255)
    port = models.IntegerField(default=80)
    is_active = models.BooleanField(default=True)

    def __unicode__(self):
        return u'%s:%s' % (self.host, self.port)

class Device(models.Model):
    DEVICE_TYPES = (
        ('DSP', 'Display'),
        ('CON', 'Controller'),
    )

    uuid = UUIDField()
    relay = models.ForeignKey(Relay)
    device_type = models.CharField(max_length=3, choices=DEVICE_TYPES, default='CON')
    device_code = models.CharField(max_length=3)

    def __unicode__(self):
        return u'%s:%s' % (self.device_type, self.uuid)

    def get_json(self):
        json = {
            'uuid': self.uuid,
            'code': self.device_code,
            'relay': {
                'host': self.relay.host,
                'port': self.relay.port,
            }
        }
        return json
