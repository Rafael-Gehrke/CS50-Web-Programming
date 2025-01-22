from django.contrib import admin

from .models import Post

# Register your models here.

@admin.register(Post)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('user', 'content')