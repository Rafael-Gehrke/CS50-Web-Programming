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

function load_posts(tab, page = 1) { 
    // Show the posts and hide other views
    document.querySelector('#new-post').style.display = 'block';
    document.querySelector('#page-heading').style.display = 'block';
    document.querySelector('#post-container').style.display = 'block';
    document.querySelector('#pagination-div').style.display = 'block';
    document.querySelector('#profile-container').style.display = 'none';
  
    // Show the tab name
    document.querySelector('#page-heading').innerHTML = `<h3>${tab.charAt(0).toUpperCase() + tab.slice(1)}</h3>`;

    fetch(`/api/posts/${tab}?page=${page}`)
    .then(response => response.json())
    .then(data => {
        // Print posts
        console.log(data);

        const postContainer = document.querySelector('#post-container');
        postContainer.innerHTML = ""; // Clear old posts
        
      // Update post HTML
      data.posts.forEach(post => {
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
        postContainer.append(element);
    });
    // Create Bootstrap pagination
    const paginationDiv = document.querySelector('#pagination-div');
    paginationDiv.innerHTML = ""; // Clear previous pagination

    const pagination = document.createElement('nav');
    pagination.innerHTML = `
        <ul class="pagination justify-content-center">
            <li class="page-item ${data.has_previous ? "" : "disabled"}">
                <a class="page-link" href="#" onclick="load_posts('${tab}', ${data.current_page - 1})">Previous</a>
            </li>
            ${Array.from({ length: data.total_pages }, (_, i) => `
                <li class="page-item ${data.current_page === i + 1 ? "active" : ""}">
                    <a class="page-link" href="#" onclick="load_posts('${tab}', ${i + 1})">${i + 1}</a>
                </li>
            `).join('')}
            <li class="page-item ${data.has_next ? "" : "disabled"}">
                <a class="page-link" href="#" onclick="load_posts('${tab}', ${data.current_page + 1})">Next</a>
            </li>
        </ul>
    `;

    paginationDiv.append(pagination);
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
    document.querySelector('#post-container').style.display = 'none';
    document.querySelector('#pagination-div').style.display = 'none';
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
        const follow_button = document.querySelector('#follow-button');
        // Follow button is hidden on the user's own profile
        if (data.is_current_user === true) {
            follow_button.style.display = 'none';
        }
        else {
            follow_button.style.display = 'block';
        }
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