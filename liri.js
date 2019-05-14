/*Make so liri.js can take in one of the following commands:
concert-this
spotify-this-song
movie-this
do-what-it-says*/
require('dotenv').config();

var keys = require('./keys.js');
var axios = require('axios');
var fs = require('fs');
var moment = require('moment');

//use key and function consrtuctor to get new calls from Spotify for artists
var Spotify = require('node-spotify-api');

var command = process.argv[2] || null;
var userInput = process.argv.slice(3).join(' ') || null;

liri(command, userInput);

function liri(command, userInput){
    if (command === null) {
        alertCommandError()
    } else {
        switch (command) {
            case 'do-what-it-says':
                whatToDo()
                break;
            case 'movie-this':
                movieThis(userInput)
                break;
            case 'spotify-this-song':
                spotifyThis(userInput);
                break;
            case 'concert-this':
                concertThis(userInput)
                break;
            default:
                console.log('I do not know "' + command + '" as a command')
                alertCommandError();
        }
    }
}



function alertCommandError() {
    console.log('\n#######################\n')
    console.log('Please input a liri command:')
    console.log('-----------------------------')
    console.log('do-what-it-says')
    console.log('movie-this')
    console.log('spotify-this-song')
    console.log('concert-this')
    console.log('\n#######################\n')
}

function logError(err) {
    var errorlog = [moment().format('MM/DD/YYYY hh:mm A'), command, userInput, err]
    errorlog = errorlog + ";\n"
    fs.appendFile('err.txt', errorlog, function (error) {
        if (error) throw error;
    });

    return console.log('Error occurred: please try again');
}

function logActions() {
    var actionLog = [moment().format('MM/DD/YYYY hh:mm A'), command, userInput]
    actionObj = actionObj + ";\n"

    fs.appendFile('log.txt', actionLog, function (error) {
        if (error) throw error;
    });
}
//function for do-what-it-says
function whatToDo() {
    if (userInput === 'do-what-it-says') {
        fs.readFile('./random.txt', 'UTF8', function (err, data) {
            if (err) {
                console.log("I don't know what it says!")
            }

            var fileData = data.split(", ");
            liri(fileData[0], fileData[1]);
     
    });
}
// function for spotify-this-song
function spotifyThis(userInput) {
    var spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret
    });

    if (userInput === null) {
        userInput = 'I Want it That Way';
    }

    spotify.search({ type: 'track', query: userInput, limit: 10 }, function (err, data) {
        if (err) {
            logError(err)
        }
        var songs = data.tracks.items;

        var output = "";

        songs.forEach(function (song) {
            output += `
Artist:, ${song.album.artists[0].name}
Album:, ${song.album.name}
Name:, ${song.name}
Preview:, ${song.external_urls.spotify}
=============================
            `
            console.log(output);
        })


        fs.appendFile('log.txt', output, 'utf8', function (error) {
            if (error) {
                console.log("Oops! Couldn't write.")
            }
            console.log("Yay! Appended data to file.")
        })

    });
}

/*---------*/
//function for concert-this
function concertThis() {
    if (userInput === '') {
        console.log('I do not know "' + command + '" must include an artist to search.')
    }
    else {

        axios.get("https://rest.bandsintown.com/artists/" + userInput + "/events?app_id=codingbootcamp")
            .then(function (response) {
                var results = response.data;
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

                    fs.appendFile('log.txt', output, 'utf8', function (error) {
                        if (error) {
                            console.log("Oops! Couldn't write.")
                        }
                        console.log("Yay! Appended data to file.")
                    })
                }
            })
    }
}
//Function for movie-this
function movieThis() {
    if (userInput === null) {
        userInput = "Mr. Nobody"
        console.log('To get liri search for a title your must include: "' + command + '" or go see "Mr. Nobody".')
    }
    else { }
    axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" + userInput)
        .then(function (response) {
            console.log(response.data.Title)
            results = response.data;
            var title = results.Title;
            var year = results.Year;
            ratingsArr = results.Ratings
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
        })
}