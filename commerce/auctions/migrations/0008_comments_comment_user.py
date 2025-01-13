# Generated by Django 5.0.7 on 2025-01-10 19:20

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0007_listings_winner'),
    ]

    operations = [
        migrations.AddField(
            model_name='comments',
            name='comment_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comments', to=settings.AUTH_USER_MODEL),
        ),
    ]
