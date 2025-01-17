document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').onsubmit = () => {
    send_email(); 
    return false;
  }

  document.querySelector('#reply-form').onsubmit = () => {
    reply_email;
    return false;
  }

});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
};

function load_mailbox(mailbox) { 
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
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

function load_email(id, mailbox) {
  // Show the email and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  // Fetch the email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    // Update email HTML
    document.querySelector('#email-heading').innerHTML = `
      <p><strong>From: </strong>${email.sender}</p>
      <p><strong>To: </strong>${email.recipients}</p>
      <p><strong>Subject: </strong>${email.subject}</p>
      <p><strong>Timestamp: </strong>${email.timestamp}</p>
      `;
    document.querySelector('#email-body').innerHTML = `${email.body}`;

    
    // Update archive button
    const archiveButton = document.querySelector('#archive');
    if (mailbox == "sent") {
      archiveButton.style.display = 'none';
      return;
    }
    archiveButton.style.display = 'block';
    archiveButton.innerHTML = email.archived ? "Unarchive" : "Archive";

    // Archive button function
    document.querySelector('#archive').addEventListener('click', () => {
      toggle_archive(id, email.archived);
    })

    // Archive button function
    document.querySelector('#reply').addEventListener('click', () => {
      reply_email(email);
    })
    });
  };

function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);    

      // Once the email has been sent, load the user’s sent mailbox.
      load_mailbox('sent');
  });
};

function toggle_archive(id, archived) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !archived
    })
  })
};

function reply_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = email.subject.startsWith("Re: ") ? email.subject : `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `\n\n-------- On ${email.timestamp} ${email.sender} wrote: \n${email.body}`;
};
