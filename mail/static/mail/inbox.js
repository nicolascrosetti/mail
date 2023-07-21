document.addEventListener('DOMContentLoaded', function() {
  //Save HTML elements in vars

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  // By default, load the inbox
  load_mailbox('inbox');

  //Sends email
  document.querySelector('#compose-form').onsubmit = () => {
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
        })
      })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      });

      setTimeout(() => load_mailbox('sent'),
                500);
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
}

function reply_email(sender,subject,timestamp,body){
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Prefill composition fields
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = `RE: ${subject}`;
  document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: ${body} `;
}

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
  
      // ... do something else with emails ...
        emails.forEach(email => {
          createEmail(email,mailbox);
        });
        
        const entries = document.querySelectorAll('.entry');
        entries.forEach(entry => {
          if(mailbox == 'inbox' || mailbox == 'archive'){
            const button = document.getElementById(entry.id).querySelector('button');
            button.onclick = () => {
              if(mailbox == 'inbox'){
                fetch(`/emails/${entry.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: true
                  })
                })
              }
              if(mailbox == 'archive'){
                fetch(`/emails/${entry.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: false
                  })
                })
              }
              setTimeout(() => load_mailbox('inbox'),
                500);
            }
          }

          entry.addEventListener('click', () => {
            const button = '.archiveButton';
            if (!event.target.matches(button)) {
              email_view(entry.id);
            }
          });
        });
        
        
    
  }); 
}

function createEmail(email,mailbox){
  const entry = document.createElement('li');
  entry.className = 'entry';
  entry.className += ' list-group-item';
  entry.id = email.id;

  entry.innerHTML = ` <p>${email.sender}</p>
                      <h6>${email.subject}</h6>
                      <p>${email.timestamp}</p> `;

  if (!email.read){
    entry.style.backgroundColor = "white";
  }else{
    entry.style.backgroundColor = "#c4c4c4";
    console.log(entry.style.backgroundColor);
  }

  if(mailbox == 'inbox'){
    const archive_button = document.createElement('button');
    archive_button.className = 'archiveButton' + ' btn' + ' btn-danger';
    archive_button.innerHTML = 'Archive';
    entry.append(archive_button);
  }

  if(mailbox == 'archive'){
    const archive_button = document.createElement('button');
    archive_button.className = 'archiveButton' + ' btn' + ' btn-success';
    archive_button.innerHTML = 'Unarchive';
    entry.append(archive_button);
  }

  document.querySelector("#emails-view").append(entry);
}

function email_view(id){
  document.querySelector('#email-view').innerHTML = '';

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // ... do something else with email ...
    const mail = document.createElement('div');
    mail.innerHTML = `<ul class="list-group">
                        <li class="list-group-item"><strong>Sender:</strong> ${email.sender}</li>
                        <li class="list-group-item"><strong>Recipients:</strong> ${email.recipients}</li>
                        <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
                        <li class="list-group-item">${email.timestamp}</li>
                        <li class="list-group-item">${email.body}</li>
                        <button class="btn btn-primary" id="replyButton">Reply</button>
                      </ul>`;

    document.querySelector('#email-view').append(mail);

    if(!email.read){
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }

    document.querySelector('#replyButton').addEventListener('click', () =>{
      reply_email(email.sender,email.subject,email.timestamp,email.body);
    });

  });


}