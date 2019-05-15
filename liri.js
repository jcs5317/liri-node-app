/*Make so liri.js can take in one of the following commands:
concert-this
spotify-this-song
movie-this
do-what-it-says*/
require('dotenv').config();

var keys   = require('./keys.js');
var axios  = require('axios');
var fs     = require('fs');
var moment = require('moment');


//use key and function consrtuctor to get new calls from Spotify for artists
var Spotify = require('node-spotify-api');

var command = process.argv[2] || null;
var userInput = process.argv.slice(3).join(' ') || null;

function liri(){
    if(command === null) {
        alertCommandError()
    } else {
        switch(command){
            case 'do-what-it-says':
                whatToDo()
                break;
            case 'movie-this':
                movieThis()
                break;
            case 'spotify-this-song':
                spotifyThis()
                break;
            case 'concert-this':
                concertThis()
                break;
            default:
                console.log('I do not know "'+command+'" as a command')
                alertCommandError();
        }
    }
}

liri()

function alertCommandError(){
    console.log(`
    \n######################################\n
        Please input a liri command:
        -----------------------------
        do-what-it-says
        movie-this
        spotify-this-song
        concert-this
    \n#####################################\n`)
}

function logError(err){
    var errorlog = [moment().format('mm/dd/yyyy hh:mm A'), command, userInput, err]
    errorlog = errorlog + ";\n"
    fs.appendFile('err.txt', errorlog, function (error) {
        if (error) throw error;
    });

    return console.log('Error occurred: please try again');
}

function logActions(){
    var actionLog = [moment().format('MM/DD/YYYY hh:mm A'),command,userInput]
    actionLog = actionLog+";\n"
    
    fs.appendFile('log.txt', actionLog, function (error) {
        if (error) throw error;
    });
}

function spotifyThis(){
    var spotify = new Spotify ({
        id: keys.spotify.id,
        secret: keys.spotify.secret
    });

    if(userInput === null) {
        userInput = 'I Want it That Way';
    }

    spotify.search({ type: 'track', query: userInput, limit: 10}, function(err, data) {
        if (err) {
            logError(err)
        }
        var songs = data.tracks.items;

        if(songs.length > 0){
        console.log(`
        \n################################
        \n --- ${command} ---
        \n-------------------------------
        \n~~~ ${userInput} ~~~~ \n`);

          songs.forEach(function(song){

            console.log(`\n******************************************************
            \nSong Name: ${song.name}
            \nAlbum: ${song.album.name} 
            \nArtist(s): ${song.artists[0].name}
            \nSong preview URL: ${song.preview_url}`);           
          });

          console.log(`\n******************************************************\n
            \n################################\n`);

        }else {
            console.log('\n################################\n')
            console.log('OOPS!, no song informations available for "'+ userInput +'"')
            console.log('\n################################\n') 
        }
      

        logActions();
        
    });
}



function whatToDo() {
    fs.readFile('./random.txt', 'UTF8', function (err, data) {
        if (err) {
            logError(err);
        }

        var fileData = data.split(',');
       
        if(fileData.length === 1){
            command = fileData[0]
            liri()
        }else {
            command = fileData[0]
            userInput = fileData[1]
            liri()
        }

        logActions();  
    });
} 

//key to get event and info for artist
//Function for concert-this
function concertThis() {
    if (userInput === '') {
        console.log('I do not know "' + command + '" must include an artist to search.')
    }
    else {

        axios.get("https://rest.bandsintown.com/artists/" + userInput + "/events?app_id=codingbootcamp")
            .then(function (response) {
                var results = response.data;

                if(results.length > 0) {

                    for (i = 0; i < results.length; i++) {
                        var venue = results[i].venue.name;
                        if (results[i].country === "United States") {
                            var location = results[i].venue.city + ", " + results[i].venue.region
                        } else {
                            var location = results[i].venue.city + ", " + results[i].venue.country
                        }

                        var date = moment(results[i].datetime)
                        date = date.format("MM/DD/YYYY")

                        var output = ("\nVenue: " + venue + 
                        "\nLocation: " + location + 
                        "\nDate: " + date + 
                        "\n---------------------------------");

                        console.log(output) 
                    }
                    
                  
                }else {
                    console.log(`no concert data for ${userInput} was found`)
                }
                fs.appendFile('log.txt', output, 'utf8', function (error) {
                    if (error) {
                        console.log("Oops! Couldn't write.")
                    }
                    console.log("Yay! Appended data to file.")
                })
                logActions()
            })
    }
}

//Function for movie-this
function movieThis() {
    if (userInput === null) {
        userInput = "Mr. Nobody"
        console.log('To get liri search for a title your must include: "' + command + '" or go see "Mr. Nobody".')
    }
    axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" + userInput)
        .then(function (response) {
            console.log(response.data.Title)

            results = response.data;

            var title = results.Title;
            var year = results.Year;

            var ratingsArr = results.Ratings

            var IMDB = ratingsArr.filter(function (item) {
                return item.Source === 'Internet Movie Database'
            }).map(function (item) {
                return item.Value.toString()
            })

            IMDB = IMDB.toString();

            var RT = ratingsArr.filter(function (item) {
                return item.Source === 'Rotten Tomatoes'
            }).map(function (item) {
                return item.Value.toString()
            })

            RT = RT.toString();

            country = results.Country;
            language = results.Language;
            plot = results.Plot;
            actors = results.Actors;

            var output = ("\nTitle: " + title + 
            "\nYear: " + year + 
            "\nIMDB Rating: " + IMDB + 
            "\nRotten Tomatoes Rating: " + RT + 
            "\nCountry: " + country + 
            "\nLanguage: " + language + 
            "\nPlot: " + plot + 
            "\nActors: " + actors + 
            "\n---------------------------------")

            console.log(output)
            fs.appendFile('log.txt', output, 'utf8', function (error) {
                if (error) {
                    console.log("Oops! Couldn't write.")
                }
                console.log("Yay! Appended data to file.")
            })
            logActions()
        })
}
 
        

