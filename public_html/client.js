/*
  Name: Nurkhat Jumabaev
  Course Name: CSc337
  Description: this is client side javascript file 
  for OSTAA project.
  Consists of two functions for adding item and adding user.
*/

/*
  the function adds new user collection to the database
  using fetch API
*/
function addUser(){
  // Get the values of the username and password inputs
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  console.log(username);

  // Send a POST request to add a new user
  fetch('add/user',
    {
      method : "POST",
      headers : {'Content-Type' : "application/json"},
      body: JSON.stringify({username: username, password : password})
    }
  )
}

/*
  the function adds new item collection to the database
  using fetch API
*/
async function addItem(event){
  let username;

  const cookies = document.cookie.split(';');
  const cookieName = 'sessionID'
  // Find the cookie with the given name
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(cookieName)) {
      // Get the value of the cookie
      const cookieValue = cookie.substring(cookieName.length + 1);
      // Decode the cookie value and return it
      const str = decodeURIComponent(cookieValue).substring(2);
      const obj = JSON.parse(str);
      username = obj.user;
    }
  }

  // Create the URL for the POST request to add an item
  const url = 'add/item/' + username;
  console.log(url);

  event.preventDefault();
    const form = document.getElementById('item-form');
    const formData = new FormData(form);
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    }).then(() =>{
      console.log('post item requested');
      window.location.href = '/home.html';
    })
  
    // Show an alert message if the POST request failed
    .catch(()=>{
      alert('something went wrong');
    })
    const result = await response.text();
    console.log(result);

} 

function logIn(){
  console.log('login function')
  const username = document.getElementById('username-login').value;
  const password = document.getElementById('password-login').value;
  const url = `/authenticate/${username}/${password}`;
  fetch(url).then(response => {
    if (response.redirected) {
      // If the response is a redirect, get the new URL
      const newUrl = response.url;
      // Redirect the user to the new URL
      window.location.href = newUrl;
      console.log('here maybe');
      const user_name = document.getElementById('user-name');
      user_name.innerText = username;
    }
  })
  .catch(error => {
    console.log('Error:', error);
  });
}
function welcome(){
  const cookies = document.cookie.split(';');
  const cookieName = 'sessionID'
  // Find the cookie with the given name
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(cookieName)) {
      // Get the value of the cookie
      const cookieValue = cookie.substring(cookieName.length + 1);
      // Decode the cookie value and return it
      const str = decodeURIComponent(cookieValue).substring(2);
      const obj = JSON.parse(str);
      console.log(document.getElementById('user-name'));
      if (document.getElementById('user-name') != null){
        console.log('working')
        const user_name = document.getElementById('user-name');
        user_name.innerText = obj.user;
      }
    }
  }
}

function searchListings(){
  if (document.getElementById('listings-content') !=undefined){
    document.getElementById('listings-content').innerHTML = '';
  }
  const keyword = document.getElementById('user-listings').value;
  fetch(`http://127.0.0.1:3000/search/items/${keyword}`).then(response =>{
    return response.json();
  }).then((data)=>{
    for (i in data){
      console.log(data[i]);
      let content = document.getElementById('listings-content');


      // Create a new div element
      const newDiv = document.createElement("div");
      newDiv.style.border = "1px solid";
      newDiv.style.borderColor = "gray";
      newDiv.style.textAlign = 'center';

      // Set some properties for the new div
      newDiv.className = "myDivs";


      // Append the new div to an existing element in the DOM
      content.appendChild(newDiv);

      let newP = document.createElement("p");
      let title = document.createTextNode(data[i].title);
      newP.style.fontSize = 20;
      newP.style.fontWeight = 'bold';
      newP.appendChild(title)
      newDiv.appendChild(newP);

      newImg = document.createElement("img");
      newImg.src = "./" + data[i].image.path;
      newImg.width = 300;
      console.log("./" + data[i].image.path);
      newDiv.appendChild(newImg);

      newP = document.createElement("p");
      let description = document.createTextNode(data[i].description);
      newP.appendChild(description)
      newDiv.appendChild(newP);

      newP = document.createElement('p');
      let price = document.createTextNode(data[i].price);
      newP.appendChild(price);
      newDiv.appendChild(newP);

      newButton = document.createElement('button');
      newButton = document.createElement('button');
      newButton.innerHTML = 'Buy Now';
      newButton.style.marginBottom = 20;
      newDiv.appendChild(newButton);

    }

  }).catch((error)=>{
    alert(error);
  })
}

// Set the timeout duration to 10 seconds (in milliseconds)
var timeoutDuration = 100000; 

// Initialize the timeout variable
var timeout;

// Define a function to reset the timeout
function resetTimeout() {
  clearTimeout(timeout);

  timeout = setTimeout(function(){
    
    window.location.href = "/index.html"; // Redirect to login page
  }, timeoutDuration);
}

// Attach an event listener to the document object
document.addEventListener("mousemove", resetTimeout);
document.addEventListener("keydown", resetTimeout);


function createList(){
  window.location.href = '/post.html';
}

function viewListings(){
  const username = document.getElementById('user-name').innerText
  console.log(username);
  fetch(`http://127.0.0.1:3000/get/listings/${username}`).then(response =>{
    return response.json();
  }).then((data)=>{
    console.log(data);
    for (i in data){
      console.log(data[i]);
      let content = document.getElementById('listings-content');


      // Create a new div element
      const newDiv = document.createElement("div");
      newDiv.style.border = "1px solid";
      newDiv.style.borderColor = "gray";
      newDiv.style.textAlign = 'center';

      // Set some properties for the new div
      newDiv.className = "myDivs";


      // Append the new div to an existing element in the DOM
      content.appendChild(newDiv);

      let newP = document.createElement("p");
      let title = document.createTextNode(data[i].title);
      newP.style.fontSize = 20;
      newP.style.fontWeight = 'bold';
      newP.appendChild(title)
      newDiv.appendChild(newP);

      newImg = document.createElement("img");
      newImg.src = "./" + data[i].image.path;
      newImg.width = 300;
      console.log("./" + data[i].image.path);
      newDiv.appendChild(newImg);

      newP = document.createElement("p");
      let description = document.createTextNode(data[i].description);
      newP.appendChild(description)
      newDiv.appendChild(newP);

      newP = document.createElement('p');
      let price = document.createTextNode(data[i].price);
      newP.appendChild(price);
      newDiv.appendChild(newP);

      newButton = document.createElement('button');
      newButton = document.createElement('button');
      newButton.innerHTML = 'Buy Now';
      newButton.style.marginBottom = 20;
      newDiv.appendChild(newButton);

    }

  }).catch((error)=>{
    alert(error);
  })
}


welcome();

