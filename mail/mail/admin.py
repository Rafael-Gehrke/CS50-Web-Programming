from django.contrib import admin
from .models import Email
# Register your models here.

@admin.register(Email)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('user', 'sender', 'subject')