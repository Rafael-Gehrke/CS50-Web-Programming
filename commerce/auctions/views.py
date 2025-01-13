from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from django.db.models import Count
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django import forms
from django.core.exceptions import ObjectDoesNotExist

from .models import User, Listings, Bids, Watchlist, Comments
from .constants import CATEGORIES, CATEGORY_DICT

class ListingBidForm(forms.Form):
    new_bid = forms.DecimalField(
        label="Bid",
        max_digits=10,
        decimal_places=2,
        widget=forms.NumberInput(attrs={
            'placeholder': 'Bid',
            'class': 'form-control',
            'required': True
            }
        )
    )

class NewListingForm(forms.Form):
    title = forms.CharField(
        label="Listing Title",
        widget=forms.TextInput(attrs={
            'placeholder': 'Listing Title',
            'class': 'form-control',
            'required': True
        })
    )
    description = forms.CharField(
        label="Description",
        widget=forms.Textarea(attrs={
            'placeholder': 'Enter a detailed description of the listing',
            'class': 'form-control',
            'rows': 5,
            'required': True
        })
    )
    starting_bid = forms.DecimalField(
        label="Starting Bid",
        max_digits=10,
        decimal_places=2,
        widget=forms.NumberInput(attrs={
            'placeholder': 'Starting Bid',
            'class': 'form-control',
            'required': True
        })
    )
    image_url = forms.URLField(
        label="Image URL",
        required=False,
        widget=forms.URLInput(attrs={
            'placeholder': 'https://example.com/image.jpg',
            'class': 'form-control'
        })
    )
    category = forms.ChoiceField(
        label="Category",
        choices=CATEGORIES,
        widget=forms.Select(attrs={
            'class': 'form-control',
            'required': True
        })
    )

class CommentForm(forms.Form):
    comment = forms.CharField(
        widget=forms.Textarea(attrs={
            'label':'Leave a comment:',
            'class': 'form-control',
            'rows': 5,
            'required': True
        })
    )

def index(request):
    return render(request, "auctions/index.html", {
        "listings": Listings.objects.filter(active=True)
    })

def categories_index(request):
    categories_data = Listings.objects.filter(active=True).values('category').annotate(item_count=Count('id'))

    categories = [
        {
            "value": category['category'],
            "name": CATEGORY_DICT.get(category['category'], "Unknown Category"),
            "item_count": category['item_count']
        }
        for category in categories_data
    ]

    return render(request, "auctions/categories_index.html", {
        "categories": categories
    })

def category_view(request, category):
    category_display_name = CATEGORY_DICT.get(category, "Unknown Category")
    listings = Listings.objects.filter(active=True, category=category)
    return render(request, "auctions/category_view.html", {
        "category":category_display_name,
        "listings": listings
    })

def create_listing(request):
    if request.method == "POST":
        form = ListingBidForm(request.POST)
        title = request.POST.get("title")
        description = request.POST.get("description")
        starting_bid = request.POST.get("starting_bid")
        image_url = request.POST.get("image_url")
        category = request.POST.get("category")

        # Attempt to create new listing
        try:
            listing = Listings(
                title=title,
                description=description,
                starting_bid=starting_bid,
                current_bid=starting_bid, 
                image_url=image_url,
                category=category,
                seller=request.user,
                active=True
            )
            listing.save()
            # Redirect to the new listing page
            return redirect("listing_detail", id=listing.id)
                    
        except:
            return render(request, "auctions/create_listing.html", { 
               "message": "Error"
          })
    # GET method -> empty form
    form = NewListingForm()
    return render(request, "auctions/create_listing.html",{
        "form": form
    })

def listing_detail(request, id):
    listing = get_object_or_404(Listings, id=id)
    bids_count = Bids.objects.filter(bid_listing=listing.id).count()
    try: 
        current_bidder = Bids.objects.filter(bid_listing=listing.id).latest('timestamp')
    except ObjectDoesNotExist:
        current_bidder = None

    if (request.method == "POST" and 'place_bid' in request.POST):
        bid_form = ListingBidForm(request.POST)

        # Bid must be as large as the starting bid, and greater than other bids.
        bid_form.fields['new_bid'].min_value = listing.current_bid
        if bid_form.is_valid():
            # Process the bid
            new_bid_value = bid_form.cleaned_data['new_bid']
            # Check if new bid is higher than the previous one
            if new_bid_value <= listing.current_bid:
                messages.error(request, "Your bid must be higher than the current bid.")
                return redirect(reverse("listing_detail", args=[listing.id]))

            # Save the new bid
            new_bid = Bids(
                bid_value=new_bid_value,
                bid_listing=listing,
                bidder=request.user
            )
            new_bid.save()

            # Update the listing's current bid
            listing.current_bid = new_bid_value
            listing.save()

            bids_count += 1
            current_bidder = Bids.objects.filter(bid_listing=listing.id).latest('timestamp')
            messages.success(request, "Bid placed successfully!")
            return redirect(reverse("listing_detail", args=[listing.id]))

    if (request.method == "POST" and 'add_comment' in request.POST):
        comment_form = CommentForm(request.POST)
        if comment_form.is_valid():
            # Process the comment
            new_comment_content = comment_form.cleaned_data['comment']
            
            # Save the new comment
            new_comment = Comments(
                comment=new_comment_content,
                comment_user=request.user,
                comment_listing=listing
            )
            new_comment.save()
            return redirect(reverse("listing_detail", args=[listing.id]))
        
    else:
        # GET method -> empty form
        bid_form = ListingBidForm()
        bid_form.fields['new_bid'].min_value = listing.current_bid
        category_display_name = CATEGORY_DICT.get(listing.category, "Unknown Category")
        watchlisted = False
        if request.user.is_authenticated:
            #Check user's watchlist
            if Watchlist.objects.filter(user=request.user, listing=listing).exists():
                watchlisted = True

        comments = Comments.objects.filter(comment_listing=listing)
        comment_form = CommentForm()

        return render(request, 'auctions/listing_detail.html', {
            "bid_form": bid_form,
            "listing": listing,
            "bids_count": bids_count,
            "current_bidder": current_bidder,
            "watchlisted":watchlisted,
            "comment_form":comment_form,
            "comments": comments,
            "category": category_display_name
        })

def add_to_watchlist(request, id):
    listing = get_object_or_404(Listings, id=id)

    # Check if the item is already in the user's watchlist
    if not Watchlist.objects.filter(user=request.user, listing=listing).exists():
        Watchlist.objects.create(user=request.user, listing=listing)
        messages.success(request, "Item added to your watchlist.")

    return redirect('listing_detail', id=id)

def remove_from_watchlist(request, id):
    listing = get_object_or_404(Listings, id=id)

    # Check if the item is already in the user's watchlist
    watchlist_entry = Watchlist.objects.filter(user=request.user, listing=listing).first()
    if watchlist_entry:
        watchlist_entry.delete()
        messages.success(request, "Item removed from your watchlist.")
        
    return redirect('listing_detail', id=id)

def close_auction(request, id):
    listing = get_object_or_404(Listings, id=id)
    
    # Check if the logged-in user is the creator of the listing
    if request.user != listing.seller:
        messages.error(request, "You are not authorized to close this auction.")
        return redirect('listing_detail', id=listing.id)

    # Close the auction (make it inactive)
    listing.active = False

    # Identify the highest bidder
    highest_bid = Bids.objects.filter(bid_listing=listing).order_by('-bid_value').first()
    if highest_bid:
        listing.winner = highest_bid.bidder  # Assuming you have a `winner` field in the Listings model

    # Save the listing
    listing.save()

    messages.success(request, "Auction closed successfully.")
    return redirect('listing_detail', id=listing.id)

def watchlist(request):
    user_watchlist = Watchlist.objects.filter(user=request.user)
    listings =[item.listing for item in user_watchlist if item.listing.active]
    return render(request, "auctions/watchlist.html",{
        "listings":listings
    })

def my_listings(request):
    my_listings = Listings.objects.filter(seller=request.user)
    return render(request, "auctions/my_listings.html",{
        "my_listings":my_listings
    })

def my_wins(request):
    my_wins = Listings.objects.filter(winner=request.user)
    return render(request, "auctions/my_wins.html",{
        "my_wins":my_wins
    })

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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")

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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
