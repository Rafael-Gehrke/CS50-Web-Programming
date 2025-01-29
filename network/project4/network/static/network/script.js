document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#new-post-form').onsubmit = () => {
        new_post(); 
        return false;
    }

    document.querySelector('#view_all').addEventListener('click', (event) => {
        event.preventDefault();
        load_posts('All Posts')});
    document.querySelector('#view_following').addEventListener('click', () => load_posts('following'));

    // By default, load all posts
    load_posts('All Posts');
    
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
    // Show the posts and hide other views
    document.querySelector('#new-post').style.display = 'block';
    document.querySelector('#page-heading').style.display = 'block';
    document.querySelector('#page-content').style.display = 'block';
    document.querySelector('#profile-container').style.display = 'none';
  
    // Show the tab name
    document.querySelector('#page-heading').innerHTML = `<h3>${tab.charAt(0).toUpperCase() + tab.slice(1)}</h3>`;
    //document.querySelector('#page-content').innerHTML = "";

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
            <span class="post-title">
            <a href="#" onclick="profile_page('${post.user}')"><strong>${post.user}</strong></a>
            </span>
            <span class="post-subject">${post.content}</span>
            <span class="post-timestamp">${post.timestamp}</span>
            <span class="post-likes">${post.likes}</span>
          `;
        document.querySelector('#page-content').append(element);
    });
});
};

function toggle_follow(username) {
    fetch(`/api/toggle_follow/${username}/`, {
        method: "POST",
        //headers: { "X-CSRFToken": getCSRFToken(), "Content-Type": "application/json" },
    })
        .then((response) => response.json())
        .then((data) => {
            //is_following = data.is_following;
            document.querySelector('#follow-button').innerHTML = data.is_following ? "Unfollow":"Follow"; 
            document.querySelector('#followers').innerHTML = `${data.followers} follower${data.followers === 1 ? "" : "s"}`;
        })
        .catch((error) => console.error("Error toggling follow:", error));
};

function profile_page(username) {
    document.querySelector('#new-post').style.display = 'none';
    document.querySelector('#page-heading').style.display = 'none';
    document.querySelector('#page-content').style.display = 'none';
    document.querySelector('#profile-container').style.display = 'block';
    
    document.querySelector('#user-posts').innerHTML = "";

    fetch(`api/profile/${username}/`)
    .then((response) => response.json())
    .then((data) => {
        // Print result
        console.log(data);

        document.querySelector('#profile-heading').innerHTML = `${data.username}'s Profile `;
        document.querySelector('#followers').innerHTML = `${data.followers} follower${data.followers === 1 ? "" : "s"}`;
        document.querySelector('#following').innerHTML = `${data.following} following`;
        document.querySelector('#user-posts-heading').innerHTML = `${data.username}'s Posts`;
        const follow_button = document.querySelector('#follow-button')
        follow_button.onclick = () => toggle_follow(data.username);
        follow_button.innerHTML = data.is_following ? "Unfollow":"Follow"; 

        data.posts.forEach(post => {
            const element = document.createElement('div');
            element.className = 'post';
            element.innerHTML = `
                <span class="post-title"><strong>${post.user}</strong></span>
                <span class="post-subject">${post.content}</span>
                <span class="post-timestamp">${post.timestamp}</span>
                <span class="post-likes">${post.likes}</span>
                `;
            
            document.querySelector('#user-posts').append(element);
        
        });
    })
};