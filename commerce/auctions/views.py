from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django import forms
from django.core.exceptions import ObjectDoesNotExist

from .models import User, Listings, Bids, Watchlist

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
    CATEGORIES = [
    ('', 'Select a category...'),
    ('electronics', 'Electronics'),
    ('fashion', 'Fashion'),
    ('home_garden', 'Home & Garden'),
    ('toys_hobbies', 'Toys & Hobbies'),
    ('sports_outdoors', 'Sports & Outdoors'),
    ('automotive', 'Automotive'),
    ('health_beauty', 'Health & Beauty'),
    ('books_movies_music', 'Books, Movies & Music'),
    ('collectibles_antiques', 'Collectibles & Antiques'),
    ('business_industrial', 'Business & Industrial'),
    ('pet_supplies', 'Pet Supplies'),
    ('real_estate', 'Real Estate'),
    ('other', 'Other Categories'),
    ]
    category = forms.ChoiceField(
        label="Category",
        choices=CATEGORIES,
        widget=forms.Select(attrs={
            'class': 'form-control',
            'required': True
        })
    )

def index(request):
    return render(request, "auctions/index.html", {
        "listings": Listings.objects.filter(active=True)
    })

def create_listing(request):
    if request.method == "POST":
        form = ListingBidForm(request.POST)
        title = request.POST.get("title")
        description = request.POST.get("description")
        starting_bid = request.POST.get("starting_bid")
        image_url = request.POST.get("image_url")
        category = request.POST.get("category")
            # LISTAR AS CATEGORIAS EXISTENTES??

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

    if (request.method == "POST"):
        form = ListingBidForm(request.POST)

        # Bid must be as large as the starting bid, and greater than other bids.
        form.fields['new_bid'].min_value = listing.current_bid #Mas se não tiver nenhuma outra bid e a current for zero?
        if form.is_valid():
            # Process the bid
            new_bid_value = form.cleaned_data['new_bid']
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

    else:
        # GET method -> empty form
        form = ListingBidForm()
        form.fields['new_bid'].min_value = listing.current_bid
        watchlisted = False
        if request.user.is_authenticated:
            #Check user's watchlist
            if Watchlist.objects.filter(user=request.user, listing=listing).exists():
                watchlisted = True

        return render(request, 'auctions/listing_detail.html', {
            "form": form,
            "listing": listing,
            "bids_count": bids_count,
            "current_bidder": current_bidder,
            "watchlisted":watchlisted
        })

def add_to_watchlist(request, id):
    listing = get_object_or_404(Listings, id=id)

    # Check if the item is already in the user's watchlist
    if Watchlist.objects.filter(user=request.user, listing=listing).exists():
        messages.info(request, "This item is already in your watchlist.") #### AQUI VAI SER... REMOVE FROM WATCHLIST
    else:
        Watchlist.objects.create(user=request.user, listing=listing)
        messages.success(request, "Item added to your watchlist.")

    return redirect('listing_detail', id=id)  # Redirect to the item's detail page or another page

def remove_from_watchlist(request, id):
    print(f"Received request to remove listing {id} from watchlist")  # Debug

    listing = get_object_or_404(Listings, id=id)

    # Check if the item is already in the user's watchlist
    watchlist_entry = Watchlist.objects.filter(user=request.user, listing=listing).first()
    if watchlist_entry:
        watchlist_entry.delete()
        messages.success(request, "Item removed from your watchlist.")
        
    return redirect('listing_detail', id=id)  # Redirect to the item's detail page or another page

def close_auction(request, id):
    # Fetch the listing
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
