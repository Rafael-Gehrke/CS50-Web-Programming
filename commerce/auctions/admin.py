from django.contrib import admin
from .models import User, Listings, Bids, Comments

# Register your models here.

@admin.register(User)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'username')  
                    
@admin.register(Listings)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'category')

@admin.register(Bids)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'bidder', 'bid_value', 'bid_listing', 'timestamp')

@admin.register(Comments)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('comment', 'comment_listing', 'comment_user')