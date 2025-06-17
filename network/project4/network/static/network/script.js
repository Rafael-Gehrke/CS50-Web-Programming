document.addEventListener('DOMContentLoaded', function() {
    const newPostForm = document.querySelector('#new-post-form');
    if (newPostForm) {
        newPostForm.onsubmit = () => {
            new_post(); 
            return false;
        }
    }

    document.querySelector('#view_all').addEventListener('click', (event) => {
        event.preventDefault();
        load_posts('All Posts')});
    const viewFollowing = document.querySelector('#view_following');
    if (viewFollowing) {
        viewFollowing.addEventListener('click', () => load_posts('following'));
    }
    
    const current_user = document.querySelector("#current_user");
    console.log(current_user);
    if (current_user) {
        current_user.addEventListener('click', () => {
            const username = document.querySelector("#current_user").getAttribute("data-username");
            profile_page(username);
        });
    };

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
    const newPost = document.querySelector('#new-post');
    if (newPost) {
        newPost.style.display = 'block';
    }
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
        element.dataset.postId = post.id;

        const current_user = document.querySelector("#current_user")
        if (current_user){
            current_user.getAttribute("data-username");
        }

        element.innerHTML = `
            <header class="post-header">
                <a href="#" onclick="profile_page('${post.user}')" class="post-user">
                    <strong>${post.user}</strong>
                </a>
                <span class="post-timestamp">${post.timestamp}</span>
            </header>

            <p class="post-content">${post.content}</p>
            
            <div class="post-actions">
                <button class="like-button">
                    <svg id="heart-icon" ${post.is_liked_by_current_user === true ? "class=liked": ""} viewBox="0 0 471.701 471.701">
                        <g>
                            <path d="M433.601,67.001c-24.7-24.7-57.4-38.2-92.3-38.2s-67.7,13.6-92.4,38.3l-12.9,12.9l-13.1-13.1
                                c-24.7-24.7-57.6-38.4-92.5-38.4c-34.8,0-67.6,13.6-92.2,38.2c-24.7,24.7-38.3,57.5-38.2,92.4c0,34.9,13.7,67.6,38.4,92.3
                                l187.8,187.8c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-3.9l188.2-187.5c24.7-24.7,38.3-57.5,38.3-92.4
                                C471.801,124.501,458.301,91.701,433.601,67.001z M414.401,232.701l-178.7,178l-178.3-178.3c-19.6-19.6-30.4-45.6-30.4-73.3
                                s10.7-53.7,30.3-73.2c19.5-19.5,45.5-30.3,73.1-30.3c27.7,0,53.8,10.8,73.4,30.4l22.6,22.6c5.3,5.3,13.8,5.3,19.1,0l22.4-22.4
                                c19.6-19.6,45.7-30.4,73.3-30.4c27.6,0,53.6,10.8,73.2,30.3c19.6,19.6,30.3,45.6,30.3,73.3
                                C444.801,187.101,434.001,213.101,414.401,232.701z"/>
                        </g>
                    </svg>
                </button>
                <span class="post-likes">${post.likes}</span>

                ${post.user === current_user ? `<button class="edit-button">Edit</button>` : ""}
            </div>
        `;
            // Add event listener for edit button (if present)
            const editButton = element.querySelector(".edit-button");
            if (editButton) {
                editButton.addEventListener("click", () => edit_post(element, post.id));
            }
            // Add event listener for like button
            const likeButton = element.querySelector(".like-button");
            if (likeButton) {
                likeButton.addEventListener("click", () => toggle_like(element, post.id));
            }

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

function toggle_like(element, post_id) {
    fetch(`/api/toggle_like/${post_id}/`, {
        method: "POST",
        //headers: { "X-CSRFToken": getCSRFToken(), "Content-Type": "application/json" },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            element.querySelector('.post-likes').innerHTML = data.likes;

            const heart = element.querySelector('#heart-icon');
            heart.classList.toggle('liked');
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
                <span class="post-title"><strong>${post.user__username}</strong></span>
                <span class="post-content">${post.content}</span>
                <span class="post-timestamp">${post.timestamp}</span>
                <span class="post-likes">${post.likes}</span>
                `;
            
            document.querySelector('#user-posts').append(element);
        
        });
    })
};

function edit_post(postElement, postId) {
    const contentElement = postElement.querySelector(".post-content");
    const originalContent = contentElement.innerText;

    // Replace content with a textarea and "Save" button
    contentElement.innerHTML = `<textarea class="edit-textarea">${originalContent}</textarea>`;
    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.classList.add("save-button");

    // Replace edit button with save button
    const editButton = postElement.querySelector(".edit-button");
    editButton.replaceWith(saveButton);

    // Save the post when clicking "Save"
    saveButton.addEventListener("click", () => {
        const updatedContent = postElement.querySelector(".edit-textarea").value.trim();

        // Send update request to the backend
        fetch(`/api/edit_post/${postId}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: updatedContent }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Update UI with new content
                contentElement.innerHTML = data.content;
                saveButton.replaceWith(editButton);
            }
        })
        .catch(error => console.error("Error editing post:", error));
    });
}
