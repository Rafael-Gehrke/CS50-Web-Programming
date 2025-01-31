from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    content = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def like_count(self):
        return self.likes_received.count()

class Like(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likes_sent")
    post = models.ForeignKey("Post", on_delete=models.PROTECT, related_name="likes_received")

class Follower(models.Model):
    follower = models.ForeignKey("User", on_delete=models.PROTECT, related_name="following")
    following = models.ForeignKey("User", on_delete=models.PROTECT, related_name="followed_by")

# Comments??

