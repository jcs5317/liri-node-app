/*Make so liri.js can take in one of the following commands:
concert-this
spotify-this-song
movie-this
do-what-it-says*/
require("dotenv").config();
var keys = require("./keys.js");
var axios = require("axios");
var fs = require("fs");
var moment = require("moment");
moment().format();
var Spotify = require('node-spotify-api');
var spotify = new Spotify ({
    id: keys.spotify.id,
    secret: keys.spotify.secret
});

var command = process.argv[2]
var workAs = process.argv.slice(3).join(" ");

function whatToDo() {
    if (command === 'do-what-it-says') {
        fs.readFile('./random.txt', 'UTF8', function(err, data) {
            if (err) {
                console.log("I don't know what it says!")
            }
            command = data.substring(0, data.indexOf(","))
            workAs = data.substring(data.indexOf(",") + 2, data.length - 1)
            whatToDo();
        })
    }


let artist = process.argv[2];

axios.get(
    "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"
).then(function(response){
    console.log(JSON.stringify(response.data, null, 2));
})


//top of the liri.js file, add code to read and set any environment variables with the dotenv package:


//Add the code required to import the keys.js file and store it in a variable.

//You should then be able to access your keys information like so
var spotify = new Spotify(keys.spotify);

 
spotify.search({ type: 'track', query: 'All the Small Things' }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
   
  console.log(data); 
  });