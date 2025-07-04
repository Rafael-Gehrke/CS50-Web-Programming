from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models import Count, Exists, OuterRef
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator


from .models import User, Post, Follower, Like

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


def load_all_posts(request):
    if request.method == "GET":
        # Get page number from request (default to 1)
        page_number = request.GET.get("page", 1)
        posts_per_page = 10

        # Fetch all posts
        posts = Post.objects.all().order_by('-timestamp')

        # Apply pagination
        paginator = Paginator(posts, posts_per_page)
        page_obj = paginator.get_page(page_number)
        
        # Prepare the data for each post
        current_user = request.user if request.user.is_authenticated else None

        posts_data = [
            {
                "id": post.id,
                "user": post.user.username,
                "content": post.content,
                "timestamp": post.timestamp.strftime("%B %d, %Y, %I:%M %p"),
                "likes": post.like_count(),
                "is_liked_by_current_user": Like.objects.filter(user=current_user, post=post).exists(),
            }
            for post in page_obj
        ]

        # Return paginated response
        return JsonResponse({
            "posts": posts_data,
            "current_page": page_obj.number,
            "total_pages": paginator.num_pages,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
        }, status=200)    
        
    return JsonResponse({"error": "GET request required."}, status=400)


@csrf_exempt
def profile_api(request, username):
    user = get_object_or_404(User, username=username)
    is_following = Follower.objects.filter(follower=request.user, following=user).exists()
    posts = Post.objects.filter(user=user).order_by('-timestamp').annotate(
        likes_count=Count('likes_received'),  # Count likes per post
        liked_by_user=Exists(Like.objects.filter(user=request.user, post=OuterRef('id')))  # Check if current user liked the post
    ).values('user__username', 'content', 'timestamp', 'likes_count', 'liked_by_user')    
    is_current_user = request.user == user

   # Convert QuerySet to a list and format timestamps
    posts_list = [
        {
            **post,
            "timestamp": post["timestamp"].strftime("%B %d, %Y, %I:%M %p"),
            "liked_by_user": bool(post["liked_by_user"]),  # Ensure boolean serialization
        }
        for post in posts
    ]

    return JsonResponse({
        'username': user.username,
        'followers': user.followed_by.count(),
        'following': user.following.count(),
        'is_following': is_following,
        'posts': posts_list,
        'is_current_user': is_current_user
    })

@login_required
def following_posts(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == "GET":

        # Get the users the current user is following
        following_users = Follower.objects.filter(follower=request.user).values_list('following', flat=True)

        # Get posts from the followed users
        posts = Post.objects.filter(user__id__in=following_users).order_by("-timestamp")

        # Get page number from request (default to 1)
        page_number = request.GET.get("page", 1)
        posts_per_page = 10

        # Apply pagination
        paginator = Paginator(posts, posts_per_page)
        page_obj = paginator.get_page(page_number)
        
        # Prepare the data for each post
        current_user = request.user if request.user.is_authenticated else None

        posts_data = [
            {
                "id": post.id,
                "user": post.user.username,
                "content": post.content,
                "timestamp": post.timestamp.strftime("%B %d, %Y, %I:%M %p"),
                "likes": post.like_count(),
                "is_liked_by_current_user": Like.objects.filter(user=current_user, post=post).exists()
            }
            for post in page_obj
        ]

        # Return paginated response
        return JsonResponse({
            "posts": posts_data,
            "current_page": page_obj.number,
            "total_pages": paginator.num_pages,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
        }, status=200)
    return JsonResponse({"error": "GET request required."}, status=400)
    
@csrf_exempt
@login_required
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

    followers = Follower.objects.filter(following=user_to_follow).count()
    return JsonResponse({'is_following': is_following,
                         'followers': followers })

@csrf_exempt
@login_required
def toggle_like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    current_user = request.user

    like, liked = Like.objects.get_or_create(user=current_user, post=post)
    if not liked:
        like.delete()
        liked = False
    else:
        liked = True

    likes = Like.objects.filter(post=post).count()
    return JsonResponse({'liked': liked,
                         'likes': likes})

@csrf_exempt
@login_required
def edit_post(request, post_id):
    # Allow a user to edit their own post.
    try:
        post = Post.objects.get(id=post_id)
        
        # Ensure the user owns the post
        if post.user != request.user:
            return JsonResponse({"error": "You can only edit your own posts."}, status=403)
        
        # Handle POST request with updated content
        if request.method == "PUT":
            data = json.loads(request.body)
            new_content = data.get("content", "").strip()

            if not new_content:
                return JsonResponse({"error": "Content cannot be empty."}, status=400)

            post.content = new_content
            post.save()

            return JsonResponse({"message": "Post updated successfully.", "content": post.content}, status=200)

        return JsonResponse({"error": "PUT request required."}, status=400)

    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

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
