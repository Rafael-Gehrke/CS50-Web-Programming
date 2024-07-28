from django.shortcuts import render, redirect

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
    query = request.GET.get('q')
    return redirect('entry_detail', slug=query)
