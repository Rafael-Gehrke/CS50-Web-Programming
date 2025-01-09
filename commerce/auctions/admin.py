from django.contrib import admin
from .models import User, Listings, Bids

# Register your models here.
@admin.register(Listings)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'category')  # Fields displayed in the admin list view

@admin.register(Bids)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'bidder', 'bid_value', 'bid_listing', 'timestamp')