document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#new-post-form').onsubmit = () => {
        new_post(); 
        return false;
    }

    document.querySelector('#view_all').addEventListener('click', (event) => {
        event.preventDefault();
        load_posts('All Posts')});
    document.querySelector('#view_following').addEventListener('click', () => load_posts('following'));

    document.querySelector('#current_user').addEventListener('click', () => {
        const username = document.querySelector("#current_user").getAttribute("data-username");
        profile_page(username);
    });

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
        element.dataset.postId = post.id;
        const current_user = document.querySelector("#current_user").getAttribute("data-username");

        element.innerHTML = `
            <span class="post-title">
            <a href="#" onclick="profile_page('${post.user}')"><strong>${post.user}</strong></a>
            </span>
            <span class="post-content">${post.content}</span>
            <button class="like-button1">${post.is_liked_by_current_user === true ?"Unlike": "Like"}</button>

            <button class="like-button2">
            <svg id="heart-icon" width="64px" height="64px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" 
            stroke="#000000" stroke-width="0.00024000000000000003" transform="matrix(-1, 0, 0, 1, 0, 0)rotate(0)">
            <g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)"><rect x="-2.4" y="-2.4" width="28.80" height="28.80" rx="14.4" fill="#7ed0ec" strokewidth="0"></rect></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.048"></g>
            <g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M3.48877 6.00387C2.76311 7.24787 2.52428 8.97403 2.97014 10.7575C3.13059 11.3992 3.59703 12.2243 4.33627 13.174C5.06116 14.1052 5.9864 15.0787 6.96636 16.0127C8.90945 17.8648 11.0006 19.4985 12 20.254C12.9994 19.4985 15.0905 17.8648 17.0336 16.0127C18.0136 15.0787 18.9388 14.1052 19.6637 13.174C20.403 12.2243 20.8694 11.3992 21.0299 10.7575C21.4757 8.97403 21.2369 7.24788 20.5112 6.00387C19.8029 4.78965 18.6202 4 17 4C15.5904 4 14.5969 5.04228 13.8944 6.44721C13.5569 7.12228 13.3275 7.80745 13.1823 8.33015C13.1102 8.58959 13.0602 8.80435 13.0286 8.95172C12.9167 9.47392 12.3143 9.5 12 9.5C11.6857 9.5 11.0823 9.46905 10.9714 8.95172C10.9398 8.80436 10.8898 8.58959 10.8177 8.33015C10.6725 7.80745 10.4431 7.12229 10.1056 6.44722C9.40308 5.04228 8.40956 4 6.99998 4C5.37979 4 4.19706 4.78965 3.48877 6.00387ZM12 5.77011C12.0341 5.69784 12.0693 5.62535 12.1056 5.55279C12.9031 3.95772 14.4096 2 17 2C19.3798 2 21.1971 3.21035 22.2388 4.99613C23.2631 6.75212 23.5243 9.02597 22.9701 11.2425C22.7076 12.2927 22.0354 13.3832 21.2419 14.4025C20.4341 15.4402 19.4327 16.4891 18.4135 17.4605C16.3742 19.4042 14.1957 21.1022 13.181 21.8683C12.4803 22.3974 11.5197 22.3974 10.819 21.8683C9.80433 21.1022 7.62583 19.4042 5.58648 17.4605C4.56733 16.4891 3.56586 15.4402 2.75806 14.4025C1.96461 13.3832 1.2924 12.2927 1.02986 11.2425C0.475714 9.02597 0.736884 6.75213 1.76121 4.99613C2.80291 3.21035 4.62017 2 6.99998 2C9.59038 2 11.0969 3.95772 11.8944 5.55278C11.9307 5.62535 11.9659 5.69784 12 5.77011Z" fill="#383838"></path> 
            </g>
            </svg>
            </button>
            

            ${post.user === current_user ? `<button class="edit-button">Edit</button>` : ""}
            <span class="post-timestamp">${post.timestamp}</span>
            <span class="post-likes">${post.likes}</span>
        `;
            // Add event listener for edit button (if present)
            const editButton = element.querySelector(".edit-button");
            if (editButton) {
                editButton.addEventListener("click", () => edit_post(element, post.id));
            }
            // Add event listener for like button
            const likeButton = element.querySelector(".like-button2");
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
            element.querySelector('.like-button1').innerHTML = data.liked ? "Unlike":"Like";

            const heartIcon = element.querySelector('#heart-icon');
            if (data.liked) {
                heartIcon.setAttribute('fill', 'red');
                heartIcon.setAttribute('fill', 'red');
            } else {
                heartIcon.setAttribute('fill', 'gray');
            }
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
