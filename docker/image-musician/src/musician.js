/* 
    This program simulates a musician, who plays an instrument in an orchestra. 
	When the app is started, it is assigned an instrument (piano, flute, etc.). 
	As long as it is running, every second it will emit a sound 
	Of course, the sound depends on the instrument.
	
	Usage : to start a musician, type the following command in the docker terminal 
		docker run -d res/musician instrument
*/

// Node.js module to work with UDP 
var dgram = require('dgram');

// allows to generate uuids
const uuid = require('uuid/v1');

// creation d'un socket datagram. Nous l'utiliserons pour envoyer nos datagrams
var socket = dgram.createSocket('udp4');

//UDP protocol
const PORT_UDP = 9907;
const ADDRESS_MULTICAST = "239.255.22.5";


//functions and classes

/**
 * Class that represents an instrument
 */
function Instrument(name, sound) {
  this.name = name;
  this.sound = sound;
}

/**
 *  musician class
 */
function Musician(instrument) {
  this.uuid = uuid();
  this.instrument = instrument;
}

var dgram    = require("dgram");

//  variables and constants

var socket   = dgram.createSocket("udp4");

var playload;   // string JSON sent by UDP
var message;    // buffer that contains the string JSON sent by UDP
var instrument; // the instrument of the musician
var argument;   // the argument that is passed on the script
var musician;   // the musician who plays an instrument


const INSTRUMENTS = ["piano", "trumpet", "flute", "violin", "drum"];

/* instruments sound */
var Sounds = {
  piano   : "ti-ta-ti",
  trumpet : "pouet",
  flute   : "trulu",
  violin  : "gzi-gzi",
  drum    : "boum-boum"
};

//------------------------------------------------------------------------------
// Main Script

/* if the argument wasn't given, we print an error and exit the program */
if (typeof process.argv[2] === "undefined") {
  console.log("Error: missing argument for instrument");
  return;
}

argument = process.argv[2].toLowerCase();

/* if the argument doesn't match with any instruments then we print an error
   and we exit the program, else we create the instrument */
if (~INSTRUMENTS.indexOf(argument)) {
  instrument = new Instrument(argument, Sounds[argument]);

} else {

  console.log("Error: instrument \"" + argument + "\" doesn't exist");
  return;
}

musician = new Musician(instrument);

/* create the JSON string sent by datagram UDP */
playload = JSON.stringify({uuid : musician.uuid, sound : musician.instrument.sound});
message  = new Buffer(playload);


/* we use this rule to send every 3 seconds a datagram UDP
   which contains the JSON string */
setInterval(function() {
  socket.send(message, 0, message.length,	PORT_UDP, ADDRESS_MULTICAST);
}, 3000);




