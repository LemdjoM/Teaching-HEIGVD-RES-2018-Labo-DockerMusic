/**
 This programm simulates someone who listens to the orchestra. This application has two responsibilities.
 Firstly, it must listen to Musicians and keep track of active musicians. 
 A musician is active if it has played a sound during the last 5 seconds. 
 Secondly, it must make this information available to you. 
 Concretely, this means that it should implement a very simple TCP-based protocol.
**/

// charge la librairie TCP 
var net = require('net');
// charge la librairie UDP 
var dgram = require('dgram');
//charge la librairie time
var moment   = require("moment");

//TCP protocol
const PORT_TCP = 2205;
//UDP protocol
const PORT_UDP = 3333;
const ADDRESS_MULTICAST = "230.185.192.108";


var instrumentsAndSound = new Map([
  ["ti-ta-ti" , "piano"],
  ["pouet"    , "trumpet"],
  ["trulu"    , "flute"],
  ["gzi-gzi"  , "violin"],
  ["boum-boum", "drum"]
]);

//Classe Misician 
function Musician (uuid, instrument, activeSince) {
  this.uuid = uuid; 
	this.instrument = instrument;
	this.activeSince = activeSince;
}

// classe Auditor 
 function Auditor() {

	// liste des musiciens actifs
   var listMusicians = new Map(); 

   /**
    * Cette fonction permet d'ajouter un musicien à la liste.
    */
   this.addMusician = function(musician) {
     listMusicians.set(musician.uuid, musician);
   }

   /**
    * Cette fonction permet de retirer un musicien de la liste.
    */
   var removeMusician = function(musician) {
     listMusicians.delete(musician.uuid);
   }

   /**
    * Cette fonction vérifie si un musicien est actif checks if a musician is active.
	* Un musicien est actif s'il joue un son durant les 5 dernières secondes
    **/
   var isMusicianActive = function(musician) {
     var musicianObject = listMusicians.get(musician.uuid);

	 /*Si le musicien est dans la liste, nous vérifions s'il est actif*/
     if (typeof musicianObject !== "undefined") {
       return Date.now() - musicianObject.activeSince <= 5000; // temps en ms
     }

     return false;
   }

   /**
    * cette fonction enlève tous les musiciens inactifs.
    */
   this.removeUnactiveMusicians = function() {
     for (var musician of listMusicians.values()) {
       if (!isMusicianActive(musician)) {
         removeMusician(musician);
       }
     }
   }

   /**
    *  cette fonction retourne un tableau avec tous les musiciens.
    */
   this.getArrayMusicians = function() {
     var arrayMusician = [];

     for (var musician of listMusicians.values()) {
       musician.activeSince = moment(musician.activeSince); // Formate le temps

       arrayMusician.push(musician);
     }

     return arrayMusician;
   }
 }


var	udpSocket	=	dgram.createSocket("udp4");

var auditor = new Auditor();


/*Cree un socket udp et join le groupe multicast*/
udpSocket.bind(PORT_UDP,	function() {
  udpSocket.addMembership(ADDRESS_MULTICAST);
});


/*Quand un datagram arrive , il ajoute un musicien a la liste de l'auditeur*/
udpSocket.on("message", function(msg, rinfo) {
  var newMusicianFromGroup = JSON.parse(msg.toString());

  var musician = new Musician(newMusicianFromGroup.uuid,
                              instrumentsAndSound.get(newMusicianFromGroup.sound),
                              Date.now());

  auditor.addMusician(musician);
});


/*Cree le serveur TCP et quand le segment TCP arrive, il envoie au client un 
    tableau  de tous les musiciens actifs*/
var tcpSocket = net.createServer(function(socket) {
  socket.write(JSON.stringify(auditor.getArrayMusicians()));
  //socket.write("Hello world!");
  socket.end();
});

tcpSocket.listen(PORT_TCP);

console.log(`TCP Server started at: ${PORT_TCP}`);

/* Nous supprimons chaque 3 seconde les musiciens inactifs de auditeur */
setInterval(auditor.removeUnactiveMusicians, 3000);
