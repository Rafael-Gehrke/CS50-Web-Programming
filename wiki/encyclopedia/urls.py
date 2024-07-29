from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("search/", views.search, name="search"),
    path("encyclopedia/<str:entry_name>/", views.entry_detail, name="entry_detail"), #Vai encyclopedia no inicio??
]
