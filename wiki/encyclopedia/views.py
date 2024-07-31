from django.shortcuts import render, redirect
from django.http import Http404
from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })
    
def entry_detail(request, entry_name):
    entry_content = util.get_entry(entry_name)
    return render(request, 'encyclopedia/entry_detail.html', {
       'entry_content': entry_content,
       'entry_name': entry_name,
       "entries": util.list_entries()
    })

def search(request):
    query = request.GET.get('q','').strip().lower()
    
    # If the query matches the name of an encyclopedia entry, the user should be redirected to that entry’s page.
    if util.get_entry(query):
        return redirect('entry_detail', query)
    # If the query does not match the name of an encyclopedia entry, the user should instead be taken to a search results page that displays a list of all encyclopedia entries that have the query as a substring. For example, if the search query were ytho, then Python should appear in the search results.
    #substring_matches = []
    entries = util.list_entries()
    
    substring_matches = [entry for entry in entries if query in entry.lower()]
    print(f"Substring matches: {substring_matches}")
    
    return render(request, 'encyclopedia/substring_results.html', {
        'substring_matches': substring_matches,
        'query': query
        })

def new_page(request):
    return redirect('new_page')
