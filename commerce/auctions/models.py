from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Listings(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=2000)
    starting_bid = models.DecimalField(max_digits=10, decimal_places=2)
    current_bid = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=64)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listings")
    active = models.BooleanField(default=True)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="won_auctions")

    def __str__(self):
        return f"{self.title} (ID: {self.id})"
    
class Bids(models.Model):
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bids")
    bid_value = models.DecimalField(max_digits=8, decimal_places=2)
    bid_listing = models.ForeignKey(Listings, on_delete=models.CASCADE, null=True, related_name="bids")
    timestamp = models.DateTimeField(auto_now_add=True)
    
class Comments(models.Model):
    comment = models.CharField(max_length=200)
    comment_listing = models.ForeignKey(Listings, on_delete=models.CASCADE, null=True, related_name="comments")

class Watchlist(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlist") 
    listing = models.ForeignKey(Listings, on_delete=models.CASCADE, related_name="watchlist")