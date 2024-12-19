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
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
