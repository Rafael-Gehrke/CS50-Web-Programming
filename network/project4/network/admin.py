from django.contrib import admin

from .models import Post, Follower, Like

# Register your models here.

@admin.register(Post)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('user', 'content')

@admin.register(Follower)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following')

@admin.register(Like)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('user', 'post')