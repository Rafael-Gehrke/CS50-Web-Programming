🛒 Auction Site – CS50 Web Project
This project was developed as part of the CS50’s Web Programming with Python and JavaScript course. It is an online auction platform, where users can create listings, place bids, watch items, and interact through comments.

🚀 Features
✅ User registration and authentication
✅ Create auction listings with:
Title, Description, Starting bid, Optional image URL, Optional category
✅ Active Listings page displaying all ongoing auctions
✅ Listing detail page with:
Current price, Bid history, Comments, Option to add/remove from Watchlist
Ability for the owner to close the auction
✅ Watchlist page to track favorite listings
✅ Comment system on each listing page
✅ Categories page to filter listings by category
✅ Admin interface via Django Admin to manage listings, bids, and comments

- Technologies Used
Backend: Django (Python)
Frontend: HTML, CSS, JavaScript
Database: SQLite
Authentication: Django built-in auth system

- Models
User – Django’s built-in user model.
Listing – Represents an auction item (title, description, starting bid, current price, image URL, category, owner, active status).
Bid – Tracks bids placed on listings (user, amount, listing).
Comment – Stores user comments on listings (user, content, listing).