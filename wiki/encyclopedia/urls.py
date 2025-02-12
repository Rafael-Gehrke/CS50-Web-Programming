from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("search/", views.search, name="search"),
    path("wiki/<str:title>/", views.entry_detail, name="entry_detail"),
    path("new_page/", views.new_page, name="new_page"),
    path("random/", views.random, name="random"),
    path("edit/<str:title>/", views.edit, name="edit")
]