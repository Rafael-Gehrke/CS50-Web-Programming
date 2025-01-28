document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#new-post-form').onsubmit = () => {
        new_post(); 
        return false;
    }

    document.querySelector('#view_all').addEventListener('click', (event) => {
        event.preventDefault();
        load_posts('All Posts')});
    document.querySelector('#view_following').addEventListener('click', () => load_posts('following'));
    
});

function new_post() {
    const content = document.querySelector('#post-content').value;
  
    fetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
          content: content
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);

        document.querySelector('#post-content').value = '';
    })
}

function load_posts(tab) { 
    // Show the mailbox and hide other views
    // document.querySelector('#emails-view').style.display = 'block';
    // document.querySelector('#email-view').style.display = 'none';
    // document.querySelector('#compose-view').style.display = 'none';
  
    // Show the tab name
    document.querySelector('#page-heading').innerHTML = `<h3>${tab.charAt(0).toUpperCase() + tab.slice(1)}</h3>`;
    document.querySelector('#page-content').innerHTML = "";

    fetch(`/api/posts/${tab}`)
    .then(response => response.json())
    .then(posts => {
      // Print posts
      console.log(posts);
  
      // Update post HTML
      posts.posts.forEach(post => {
        const element = document.createElement('div');
        element.className = 'post';
        element.innerHTML = `
            <span class="post-title"><strong>${post.user}</strong></span>
            <span class="post-subject">${post.content}</span>
            <span class="post-timestamp">${post.timestamp}</span>
            <span class="post-likes">${post.likes}</span>
          `;
  
        // element.addEventListener('click', function() {
        //   // console.log('This element has been clicked!');
        //   // Check post as 'read'
        //   fetch(`/posts/${post.id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify({
        //         read: true
        //     })
        //   });
        //   load_post(post.id, tab);
        // });
        document.querySelector('#page-content').append(element);
    });
});
};

