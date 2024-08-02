from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect

from . import util
from django.urls import reverse
from django import forms

class NewPageForm(forms.Form):
    title = forms.CharField(label="Title")
    content = forms.Textarea()

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
    
    substring_matches = [entry for entry in entries if query in entry.lower()] # list comprehension
    print(f"Substring matches: {substring_matches}")
    
    return render(request, 'encyclopedia/substring_results.html', {
        'substring_matches': substring_matches,
        'query': query
        })

def new_page(request):
    if request.method == "POST":
    # When the page is saved, if an encyclopedia entry already exists with the provided title, the user should be presented with an error message.
        form = NewPageForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            content = form.cleaned_data["content"]
            # Testar se a entry já existe!
            if title in util.list_entries: # Entry já existe, erro! Verificar Case sensitivity??????????
                return render(request, "encyclopedia/new_page.html", {
                    "form": form
                })
            else:
                util.save_entry(title, content)
                return HttpResponseRedirect(reverse("encyclopedia/title"))
        else: # ISSO???
            return render(request, "encyclopedia/new_page.html", {
                "form": form
            })

    return render(request, "encyclopedia/new_page.html")
    
    # Otherwise, the encyclopedia entry should be saved to disk, and the user should be taken to the new entry’s page.