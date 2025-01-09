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

app.post('/api/users/:_id/exercises', async (req, res) => {
  
  if ( !req.body.duration || !req.body.description || !req.params._id ) {
    res.json({error: " Error, need to fill every requiered field "});
  } else {
    const { description, duration } = req.body;
    const date = req.body.date ? new Date(req.body.date) : new Date();
    
    // console.log(description, duration, date.toDateString());
    try {
      const _id = req.params._id;
  
      const { username } = await User.findById(_id, "+username -_id").exec();
      
      // console.log(_id, username);     
      //Stored and saved exercise document
      const exercise = new Exercise({
        username: username,
        description: description,
        duration: duration,
        date: date,
        userId: _id
      });
      await exercise.save().then( result => {
        console.log(result);
      });

      //format response object
      const user = {
        _id: _id,
        username: username,
        date: exercise.date.toDateString(),
        duration: exercise.duration,
        description: exercise.description,
      };
      

      res.json(user);
    } catch (err) {
      res.status(400).send("ID inexistente o no válido");
    }
  }  
});

app.get('/api/users', async (req, res) => {
  const usersQuery = await User.find();
  const usersJson = [];
  usersQuery.map((user) => {
    usersJson.push({username: user.username, _id: user._id});
  });
  res.send(usersJson);
});

app.get('/api/users/:_id/logs', async (req, res) => {
  //Retrieving _id param
  const searchedId = req.params._id;
  if ( !searchedId ) {
    return res.status(400).send("ID inexistente o no válido");
  }
  //Finding user
  const foundUser = await User.findById(searchedId);

  // console.log(foundUser);
  //Finding exercises by User
  const exerciseQuery = await Exercise.find({userId: searchedId});
  
  //Mapping the log
  const log = [];
  exerciseQuery.map((exercise) => {
    log.push({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    });
  });

  // console.log(log);
  //Formating json for response
  const user = {
    _id: foundUser._id,
    username: foundUser.username,
    count: log.length,
    log
  }

  res.json(user);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
