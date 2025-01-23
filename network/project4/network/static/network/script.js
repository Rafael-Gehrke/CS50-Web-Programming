document.addEventListener('DOMContentLoaded', function() {
  // By default, load all posts
  // load_all_posts();

  // Disable form default
  document.querySelector('#new_post_form').onsubmit = () => {
    new_post(); 
    return false;
  }

});

function new_post() {
    const content = document.querySelector('#post_content').value;
  
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

        document.querySelector('#post_content').value = '';
  
        // Once the email has been sent, load the user’s sent mailbox.
        // load_mailbox('sent');
    });
};

// function all_posts(page) { 
//   // Show the mailbox and hide other views
//   // document.querySelector('#emails-view').style.display = 'block';
//   // document.querySelector('#email-view').style.display = 'none';
//   // document.querySelector('#compose-view').style.display = 'none';

//   // Show the mailbox name
//   // document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

//   fetch(`/posts/${page}`)
//   .then(response => response.json())
//   .then(emails => {
//     // Print emails
//     console.log(emails);

//     // Update email HTML
//     emails.forEach(email => {
//       const element = document.createElement('div');
//       element.className = 'email';
//       element.innerHTML = `
//         <span class="email-title"><strong>${email.sender}</strong></span>
//         <span class="email-subject">${email.subject}</span>
//         <span class="email-timestamp">${email.timestamp}</span>
//         `;

//       // If the email has been read, it should appear with a gray background.
//       if (email.read === true) {
//         element.style.backgroundColor = '#a1a1a1';
//       };

//       element.addEventListener('click', function() {
//         // console.log('This element has been clicked!');
//         // Check email as 'read'
//         fetch(`/emails/${email.id}`, {
//           method: 'PUT',
//           body: JSON.stringify({
//               read: true
//           })
//         });
//         load_email(email.id, mailbox);
//       });
//       document.querySelector('#emails-view').append(element);
//     });
//   });
// };

// function loadProfile(username) {
//   // Fetch data from the server
//   fetch(`/${username}/`)
//       .then((response) => {
//           if (!response.ok) {
//               throw new Error("Failed to load profile");
//           }
//           return response.json();
//       })
//       .then((data) => {
//           // Clear previous content
//           const profileContainer = document.getElementById("profile-container");
//           profileContainer.innerHTML = "";

//           // Render profile details
//           const profileHeader = document.createElement("h2");
//           profileHeader.textContent = `Profile of ${data.username}`;
//           profileContainer.appendChild(profileHeader);

//           const email = document.createElement("p");
//           email.textContent = `Email: ${data.email}`;
//           profileContainer.appendChild(email);

//           const postsHeader = document.createElement("h3");
//           postsHeader.textContent = "Posts:";
//           profileContainer.appendChild(postsHeader);

//           const postsList = document.createElement("ul");
//           data.posts.forEach((post) => {
//               const postItem = document.createElement("li");
//               postItem.textContent = `${post.content} (Posted on ${post.timestamp})`;
//               postsList.appendChild(postItem);
//           });
//           profileContainer.appendChild(postsList);
//       })
//       .catch((error) => {
//           console.error(error);
//           alert("An error occurred while loading the profile.");
//       });
// }