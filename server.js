/*
  Name: Nurkhat Jumabaev
  Course Name: CSc337
  Description: this is server side javascript file 
  for OSTAA project.

  IMPORTANT: INSTALL BODY-PARSER MODULE AS WELL 
  I DELETED IT BECAUSE I COULD NOT UPLOAD ON GRADESCOPE
*/

// import necessary modules

const sessions = {};
function addSessionID(user){
  const sessionID = Math.floor(Math.random()* 100000);
  const sessionStart = Date.now();
  sessions[user] = {'sid': sessionID, 'start': sessionStart};
  return sessionID;
}

function doesUserHaveSession(user, sessionID){
  
  let entry = sessions[user];
  if (entry.sid != undefined){
    return entry.sid == sessionID;
  }
}



const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { response } = require("express");
app.use(cookieParser());
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/private_html/image')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage: storage });


// configure mongoose
mongoose.set('strictQuery', true);
const connection_string = "mongodb://127.0.0.1:27017/ostaa";
mongoose.connect(connection_string, {useNewUrlParser:true});

// handle mongoose connection error
mongoose.connections.concat('error', () =>{
  console.log('error');
})

// define mongoose schemas
const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: {
    path: String,
    contentType: String
  },
  price: Number,
  stat: String
})

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  listings: [String],
  purchases: [String]
})

// create mongoose models from schemas
const Item = mongoose.model("Item", itemSchema);
const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());


app.get('/authenticate/:user/:password', async (req, res)=>{
  const user = req.params.user;
  console.log(user);
  const password = req.params.password;
  console.log(password)
  const allUsers = await User.find({}).exec();
  for (i in allUsers){
    // filter users whose username contains the given keyword
    if (allUsers[i].username !=undefined && 
      allUsers[i].username == user){
      console.log(allUsers[i].username);
      if (allUsers[i].password == password){
        console.log(allUsers[i].password);
        const sessionID = addSessionID(user);
        res.cookie('sessionID', {"user": user, "sid": sessionID}, {maxAge:100000});
        res.redirect('/home.html');
      }
    }
  }


})

app.post('/add/user', (req, res)=>{
  // create a new user object and save it to the database
  User.create({username: req.body.username, 
    password: req.body.password});
  res.redirect('/')
})

function authenticate(req, res, next){
  const c = req.cookies;
  
  if (c.sessionID){
    let result = doesUserHaveSession(c.sessionID.user, c.sessionID.sid)
    if (result){
      next();
      return;
    }
  }
  req.url = '/index.html';
  res.redirect('/index.html');
  return;
}



// use body-parser middleware to parse incoming JSON data

app.use(express.static(__dirname + '/public_html'));


app.get('/index.html', (req, res)=>{
  
})

// define routes and their handlers
app.use('*', authenticate);

app.use(express.static(__dirname + '/private_html'));

app.get('/home.html', (req, res)=>{
  res.sendFile(__dirname + '/home.html');
})

app.get('/post.html', (req, res)=>{
  res.sendFile(__dirname + '/post.html')
})


app.get('/get/users', async (req, res)=>{
  // fetch all users from the database and return as JSON data
  const data = await User.find();
  res.json(data);
})

app.post('/add/item/:USERNAME', upload.single('image'), async (req, res) => {
  // get the username from the request parameters
  const username = req.params.USERNAME;

  // create a new item object and set its properties
  const newItem = new Item({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    stat: req.body.stat
  });

  // set the image data and content type from the uploaded file
  console.log(req.file);
  newItem.image.path = req.file.fieldname + "/" + req.file.originalname;
  newItem.image.contentType = req.file.mimetype;

  // save the new item to the database
  newItem.save().then(() => {
    console.log('new Item saved');
    res.send('Item added successfully');
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error adding item');
  });

  // add the new item to the user's listings array
  const user = await User.findOne({ username: username }).exec();
  user.listings.push(newItem.id);
  user.save();
});

app.get('/get/items', async (req, res)=>{
  console.log('get items');
  // fetch all items from the database and return as JSON data
  const data = await Item.find();
  res.json(data);
})

app.get('/search/items/:KEYWORD', async (req, res)=>{
  // get the search keyword from the request parameters
  const keyword = req.params.KEYWORD;

  // find all items whose description contains the search keyword
  const allItems = await Item.find({}).exec();
  const neededItems = [];
  for (i in allItems){
    if (allItems[i].description !=undefined && 
      allItems[i].description.includes(keyword)){
      neededItems.push(allItems[i]);
    }
  }
  console.log(neededItems);

  // return the matching items as JSON data
  res.json(neededItems);
})

// search for users that match a certain keyword
app.get('/search/users/:KEYWORD', async (req, res)=>{
  const keyword = req.params.KEYWORD;
  const allUsers = await User.find({}).exec();
  const neededUsers = [];
  for (i in allUsers){
    // filter users whose username contains the given keyword
    if (allUsers[i].username !=undefined && 
      allUsers[i].username.includes(keyword)){
      neededUsers.push(allUsers[i]);
    }
  }
  // return the matching users
  res.json(neededUsers);
})

// get all listings of a particular user
app.get('/get/listings/:USERNAME', async (req, res) =>{
    const username = req.params.USERNAME;
    console.log(username);
    const user = await User.findOne({username: username}).exec();
    const listings = [];
    for (i in user.listings){
      // find the item for each listing 
      // and add it to the result array
      const item = await Item.findById(user.listings[i]);
      listings.push(item);
    }
    // return the user's listings
    res.json(listings);
})

// get all purchases made by a particular user
app.get('/get/purchases/:USERNAME', async (req, res) =>{
  const username = req.params.USERNAME;
    const user = await User.findOne({username: username}).exec();
    const purchases = [];
    for (i in user.purchases){
      // find the item for each purchase 
      // and add it to the result array
      const item = await Item.findById(user.purchases[i]);
      purchases.push(item);
    }
    // return the user's purchases
    res.json(purchases);
})


// start the server
app.listen(3000, ()=>{
  console.log('server is running');
})
