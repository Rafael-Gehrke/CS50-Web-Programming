from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("create_listing", views.create_listing, name="create_listing"),
    path("auctions/<int:id>/", views.listing_detail, name="listing_detail"),
    path("add_to_watchlist/<int:id>/", views.add_to_watchlist, name="add_to_watchlist"),
    path("remove_from_watchlist/<int:id>/", views.remove_from_watchlist, name="remove_from_watchlist"),
    path("listing/<int:id>/close", views.close_auction, name="close_auction"),
    path("my_listings", views.my_listings, name="my_listings"),
    path("watchlist", views.watchlist, name="watchlist"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
