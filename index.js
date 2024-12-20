const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

//MongoDB connection
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected succesfully'))
  .catch((err) => console.error('Error connecting to DB: ' + err));
//-----------------------------------------------------------
//Schemas

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true
  }
});

const ExerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true
  },
  description: {
    type: String,
    requiere: true
  },
  duration: {
    type: Number,
    require: true
  },
  date: Date,
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
   }
});

//Models
const User = new mongoose.model('User', UserSchema);
const Exercise = new mongoose.model('Exercise', ExerciseSchema);
//-----------------------------------------------------------

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(express.urlencoded({ extended: true }));


app.post('/api/users', async (req, res) => {
  const submitedUsername = req.body.username;
  // console.log(submitedUsername);

  if (!submitedUsername) {
    res.json({error: "Submited invalid username"});
  } else {
    console.log(submitedUsername);
    // await User.deleteMany({ username: "avaras" });
    const existingUser = await User.findOne({ username: submitedUsername }).exec();
    if ( existingUser ) {
      res.json( {username: existingUser.username, _id: existingUser._id} );
    } else {
      const newUser = new User({username: submitedUsername});
      // console.log(newUser.username);
      newUser.save().then( result => {
        console.log(result);
      });
      res.json({ username: newUser.username, _id: newUser._id });
    }
    

  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
