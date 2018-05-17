/* 
    This program simulates a musician, who plays an instrument in an orchestra. 
	When the app is started, it is assigned an instrument (piano, flute, etc.). 
	As long as it is running, every second it will emit a sound 
	Of course, the sound depends on the instrument.
	
	Usage : to start a musician, type the following command in the docker terminal 
		docker run -d res/musician instrument
*/

// module  Node.js pour travailler avec UDP 
var dgram = require('dgram');

// module Node.js pour générer les uuids
var uuid = require('node-uuid');

// creation d'un socket datagram. Nous l'utiliserons pour envoyer nos datagrams
var socket = dgram.createSocket('udp4');


// Declaration des fonctions et classes

/**
 * Classe instrument
 */
function Instrument(nom, son) {
  this.nom = nom;
  this.son = son;
}

/**
 * Classe musicien
 */
function Musicien(instrument) {
  this.uuid = uuid.v1();
  this.instrument = instrument;
}

var playload;   // string JSON envoyé par UDP
var message;    // buffer qui contient la string JSON envoyée par UDP 
var instrument; // instrument du musicien 
var param;   // l'argument qui est passé au script 
var musicien;   // le musicien qui joue d'un instrument 

// protocol UDP
const PORT_UDP = 3333;
const ADDRESS_MULTICAST = ""239.255.22.5"";

const INSTRUMENTS = ["piano", "trumpet", "flute", "violin", "drum"];

/* instruments et sons */
var sons = {
  piano   : "ti-ta-ti",
  trumpet : "pouet",
  flute   : "trulu",
  violin  : "gzi-gzi",
  drum    : "boum-boum"
};

/* si l'argument n'a pas été donné, nous affichons un message d'erreur et fermons le rogramme */
if (typeof process.argv[2] === "undefined") {
  console.log("Erreur: l'argument pour instrument est manquant ");
  return;
}

param = process.argv[2].toLowerCase();

   
/* si l'argument ne correspond à aucun instrument, nous affichons un message d'erreur 
   et fermons le programme, sinon nous créons l'instrument*/
if (~INSTRUMENTS.indexOf(param)) {
  instrument = new Instrument(param, sons[param]);

} else {

  console.log("Erreur: l'instrument \"" + argument + "\" n'existe pas");
  return;
}

/*Cree un musicien en lui assignant un instrument */
musicien = new Musicien(instrument);

/* cree la string JSON qui va être envoyée par datagram UDP */
playload = JSON.stringify({uuid : musicien.uuid, son : musicien.instrument.son});
message  = new Buffer(playload);

/* Nous utilisons la règle pour envoyer chaque 3 secondes un datagram UDP
   qui contient la string JSON */
setInterval(function() {
  socket.send(message, 0, message.length,	PORT_UDP, ADDRESS_MULTICAST);
}, 3000);

