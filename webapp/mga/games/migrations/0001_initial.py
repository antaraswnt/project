# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=100)),
                ('slug', models.CharField(max_length=30)),
                ('description', models.CharField(max_length=255, null=True, blank=True)),
                ('display_url', models.URLField()),
                ('control_url', models.URLField()),
                ('is_active', models.BooleanField(default=False)),
                ('large_image_url', models.URLField(null=True, blank=True)),
                ('small_image_url', models.URLField(null=True, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
