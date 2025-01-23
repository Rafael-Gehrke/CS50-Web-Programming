from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.shortcuts import get_object_or_404


from .models import User, Post, Follower

def index(request):
    # GET
    return render(request, "network/index.html")

@csrf_exempt
@login_required
def new_post(request):
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    data = json.loads(request.body)
    content = data.get("content", "")

    # Create post
    post = Post(
        user=request.user,
        content=content,
    )
    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)

# @login_required
# def all_posts(request):

#     # Filter emails returned based on mailbox
#     posts = Post.objects.all.order_by('-timestamp')
#     print(posts)
#     return JsonResponse([post.serialize() for post in posts], safe=False)

def load_all_posts(request):
    if request.method == "GET":
        # Fetch all posts
        posts = Post.objects.all().order_by('-timestamp')

        # Prepare the data for each post
        posts_data = [
            {
                "id": post.id,
                "user": post.user.username,
                "content": post.content,
                "timestamp": post.timestamp.strftime("%B %d, %Y, %I:%M %p"),
                "likes": post.likes.count()
            }
            for post in posts
        ]

        return JsonResponse({"posts": posts_data}, status=200)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)

@csrf_exempt
def profile_api(request, username):
    user = get_object_or_404(User, username=username)
    is_following = Follower.objects.filter(follower=request.user, following=user).exists()
    posts = list(Post.objects.filter(user=user).order_by('-timestamp').values('content', 'timestamp'))

    return JsonResponse({
        'username': user.username,
        'followers': user.followed_by.count(),  # Assuming Follow model has a related_name "followed_by"
        'following': user.following.count(),  # Assuming Follow model has a related_name "following"
        'is_following': is_following,
        'posts': posts
    })

# @csrf_exempt
# @login_required
# def following(request):
    followed_by_user = Follower.objects.filter(follower=request.user)
    posts = list(Post.objects.filter(user=followed_by_user).order_by('-timestamp'))

    # Prepare the data for each post
    posts_data = [
        {
            "id": post.id,
            "user": post.user.username,
            "content": post.content,
            "timestamp": post.timestamp.strftime("%B %d, %Y, %I:%M %p"),
            "likes": post.likes.count()
        }
        for post in posts
    ]

    return JsonResponse({"posts": posts_data}, status=200)

def following_posts(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)

    # Get the users the current user is following
    following_users = Follower.objects.filter(follower=request.user).values_list('following', flat=True)

    # Get posts from the followed users
    posts = Post.objects.filter(user__id__in=following_users).order_by("-timestamp")
    
    # Serialize posts
    data = [
        {
            "id": post.id,
            "user": post.user.username,
            "content": post.content,
            "timestamp": post.timestamp.strftime("%B %d, %Y, %I:%M %p"),
            "likes": post.likes,
        }
        for post in posts
    ]

    return JsonResponse({"posts": data})


@csrf_exempt
def toggle_follow(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    current_user = request.user

    if current_user == user_to_follow:
        return JsonResponse({'error': 'Users cannot follow themselves'}, status=400)

    follow, created = Follower.objects.get_or_create(follower=current_user, following=user_to_follow)
    if not created:
        follow.delete()
        is_following = False
    else:
        is_following = True

    return JsonResponse({'is_following': is_following})

# def profile_page(request, username):
#     user = User.objects.get(username=username)
#     user_posts = Post.objects.filter(user__username=username)

#     # Prepare the data for each post
#     user_data = [
#         {
#             "id": user.id,
#             "user": user.username,
#         }
#     ]
#     posts_data = [
#         {
#             "id": post.id,
#             "user": post.user.username,
#             "content": post.content,
#             "timestamp": post.timestamp.strftime("%B %d, %Y, %I:%M %p"),
#             "likes": post.likes.count(),  # Assuming likes is a ManyToMany field
#         }
#         for post in user_posts
#     ]

#     return JsonResponse({"user": user_data, "posts": posts_data}, status=200)
#     # else:
    #     return JsonResponse({"error": "GET request required."}, status=400)



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
