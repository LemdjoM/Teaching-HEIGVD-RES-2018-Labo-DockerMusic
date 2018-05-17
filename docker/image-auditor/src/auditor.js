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
const PORT_UDP = 9907;
const ADDRESS_MULTICAST = "239.255.22.5";


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

function Auditor() {

   var listMusicians = new Map(); // map pour stocker les musiciens vivant 

   /**
    * cette fonction permet d'ajouter un musicien dans la map.
    */
   this.addMusician = function(musician) {
     listMusicians.set(musician.uuid, musician);
   } 
   
     /**
    * cette fonction permet d'enlévé un musicien de la map.
    */
   var removeMusician = function(musician) {
     listMusicians.delete(musician.uuid);
   }
   
   
    /**
    * cette fonction permet de vérifier si mon musicien est encore actif.
    */
   
    var isMusicianActive = function(musician) {
     var musicianObject = listMusicians.get(musician.uuid);

     /* if the musician is in the list, we check if he's active */
     if (typeof musicianObject !== "undefined") { // verifier si le musicien est dans la liste 
	 
	 // retourner true si mon musicien est encore actif
       return Date.now() - musicianObject.activeSince <= 5000; // time in ms
     }

     return false; // retourner false si nom 
   }
   
   
    /**
    * supprime tous les musiciens inactifs de la map.
    */
   this.removeUnactiveMusicians = function() {
     for (var musician of listMusicians.values()) {
       if (!isMusicianActive(musician)) {
         removeMusician(musician);
       }
     }
   }
   
   
      /**
    * Retourner un tableau de tous les musiciens de la liste(map).
    */
   this.getArrayMusicians = function() {
     var arrayMusician = [];

     for (var musician of listMusicians.values()) {
       musician.activeSince = moment(musician.activeSince); // Formate time

       arrayMusician.push(musician);
     }

     return arrayMusician;
   }
 }

var	udpSocket	=	dgram.createSocket("udp4");

var auditor = new Auditor();


/*Cree un socket udp et join le groupe multicast*/
udpSocket.bind(PORT_UDP,	function() {
	console.log("Auditor commence à ecouter...");
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
	console.log("The socket is bound and the server is listening for connection requests.");
	console.log("Socket value: %j", tcpSocket.address());
	socket.write(JSON.stringify(auditor.getArrayMusicians()));
	socket.end();
});

tcpSocket.listen(PORT_TCP);

//console.log(`TCP Server started at: ${PORT_TCP}`);

/* Nous supprimons chaque 5 seconde les musiciens inactifs de auditeur */
setInterval(auditor.removeUnactiveMusicians, 5000);
