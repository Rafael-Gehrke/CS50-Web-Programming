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

function all_posts(page) { 
  // Show the mailbox and hide other views
  // document.querySelector('#emails-view').style.display = 'block';
  // document.querySelector('#email-view').style.display = 'none';
  // document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  // document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/posts/${page}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // Update email HTML
    emails.forEach(email => {
      const element = document.createElement('div');
      element.className = 'email';
      element.innerHTML = `
        <span class="email-title"><strong>${email.sender}</strong></span>
        <span class="email-subject">${email.subject}</span>
        <span class="email-timestamp">${email.timestamp}</span>
        `;

      // If the email has been read, it should appear with a gray background.
      if (email.read === true) {
        element.style.backgroundColor = '#a1a1a1';
      };

      element.addEventListener('click', function() {
        // console.log('This element has been clicked!');
        // Check email as 'read'
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        });
        load_email(email.id, mailbox);
      });
      document.querySelector('#emails-view').append(element);
    });
  });
};