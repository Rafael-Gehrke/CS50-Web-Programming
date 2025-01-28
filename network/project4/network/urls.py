
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts", views.new_post, name="new_post"),
    path("all_posts/", views.load_all_posts, name="load_all_posts"),
    path("following/", views.following_posts, name="following_posts"),
    #path("<str:username>/", views.profile_page, name="profile_page"),
    path("api/profile/<str:username>/", views.profile_api, name="profile_api"),
    path("api/toggle_follow/<str:username>/", views.toggle_follow, name="toggle_follow"),
    path("api/following_posts/", views.following_posts, name="following_posts")
]