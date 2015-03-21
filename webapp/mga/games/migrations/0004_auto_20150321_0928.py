# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_auto_20150104_1219'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='large_image_url',
            field=models.URLField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='game',
            name='small_image_url',
            field=models.URLField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
