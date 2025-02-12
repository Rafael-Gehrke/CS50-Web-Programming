from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect

from . import util
from django.urls import reverse
from django import forms
from django.contrib import messages

from markdown2 import Markdown
from random import randint

class NewPageForm(forms.Form):
    title = forms.CharField(label="Title")
    content = forms.CharField(widget=forms.Textarea(attrs={"rows":"5"}))

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })
    
def entry_detail(request, title):
    entry_content = util.get_entry(title)
    return render(request, 'encyclopedia/entry_detail.html', {
       'entry_content': Markdown().convert(entry_content),
       'title': title,
    })

def search(request):
    query = request.GET.get('q','').strip().lower()
    
    # If the query matches the name of an encyclopedia entry, the user should be redirected to that entry’s page.
    if util.get_entry(query):
        return redirect('entry_detail', query)
    # If the query does not match the name of an encyclopedia entry, the user should instead be taken to a search results page that displays a list of all encyclopedia entries that have the query as a substring. For example, if the search query were ytho, then Python should appear in the search results.
    entries = util.list_entries()
    
    substring_matches = [entry for entry in entries if query in entry.lower()] # list comprehension
    
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
            if title.lower() in [entry.lower() for entry in util.list_entries()]:
                messages.add_message(
                    request,
                    messages.WARNING,
                    message=f'Entry "{title}" already exists',
                )
                return render(request, "encyclopedia/new_page.html", {
                    "form": form
                })
            else:
                # Otherwise, the encyclopedia entry should be saved to disk, and the user should be taken to the new entry’s page.
                util.save_entry(title, content)
                return redirect("entry_detail", title)
        else:
            return render(request, "encyclopedia/new_page.html", {
                "form": form
            })
        
    # GET method -> empty form
    form = NewPageForm()
    return render(request, "encyclopedia/new_page.html", {
        "form": form 
    })

def random(request):
    entries = util.list_entries()
    random_entry = entries[randint(0, len(entries)-1)]
    return redirect("entry_detail", random_entry)
    
def edit(request, title):
    if request.method == "GET":
        content = util.get_entry(title)
        form = NewPageForm({"title": title, "content": content})
        return render(request,"encyclopedia/edit.html",{"form": form, "title": title})

    form = NewPageForm(request.POST)
    if form.is_valid():
        title = form.cleaned_data["title"]
        content = form.cleaned_data["content"]
        util.save_entry(title=title, content=content)
        return redirect("entry_detail", title)

    else:
        return render(request,"encyclopedia/edit.html",{"form": form, "title": title})
