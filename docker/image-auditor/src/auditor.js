/**
 This programm simulates someone who listens to the orchestra. This application has two responsibilities.
 Firstly, it must listen to Musicians and keep track of active musicians. 
 A musician is active if it has played a sound during the last 5 seconds. 
 Secondly, it must make this information available to you. 
 Concretely, this means that it should implement a very simple TCP-based protocol.
**/

// TCP 
var net = require('net');
// UDP 
var dgram = require('dgram');
//format time
var moment   = require("moment");

//TCP port
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

// Misician class 
function Musician (uuid, instrument, activeSince) {
  this.uuid = uuid; 
	this.instrument = instrument;
	this.activeSince = activeSince;
}

function Auditor() {

   var listMusicians = new Map(); // map pour stocker les musiciens actifs 

   /**
    * add a musician to the list.
    */
   this.addMusician = function(musician) {
     listMusicians.set(musician.uuid, musician);
   } 
   
     /**
    * removes musician to the list.
    */
   var removeMusician = function(musician) {
     listMusicians.delete(musician.uuid);
   }
   
   
    /**
    * checks if a musician is still alive.
    */
   
    var isMusicianActive = function(musician) {
     var musicianObject = listMusicians.get(musician.uuid);

     /* if the musician is in the list, we check if he's active */
     if (typeof musicianObject !== "undefined") {  
	 
	 // retourn true if a musician is inactve during last 5 seconds
       return Date.now() - musicianObject.activeSince <= 5000; // time in ms
     }

     return false; // else 
   }
   
   
    /**
    * remove all inactive musicians (map).
    */
   this.removeUnactiveMusicians = function() {
     for (var musician of listMusicians.values()) {
       if (!isMusicianActive(musician)) {
         removeMusician(musician);
       }
     }
   }
   
   
    /**
    * give an array of all musicians(map).
    */
   this.getArrayMusicians = function() {
     var arrayMusician = [];

     for (var musician of listMusicians.values()) {
       musician.activeSince = moment(musician.activeSince); 

       arrayMusician.push(musician);
     }

     return arrayMusician;
   }
 }

var	udpSocket	=	dgram.createSocket("udp4");

var auditor = new Auditor();


/*Create a udp socket and join the multicast group */
udpSocket.bind(PORT_UDP,	function() {
	console.log("Auditor commence à ecouter...");
  udpSocket.addMembership(ADDRESS_MULTICAST);
});


/*when a datagram arrives, add a musician to the auditor*/
udpSocket.on("message", function(msg, rinfo) {
  var newMusicianFromGroup = JSON.parse(msg.toString());

  var musician = new Musician(newMusicianFromGroup.uuid,
                              instrumentsAndSound.get(newMusicianFromGroup.sound),
                              Date.now());

  auditor.addMusician(musician);
});


/*Create TCP server and when a TCP segment arrives , send 
    list of all active musicians to the client*/
var tcpSocket = net.createServer(function(socket) {
	console.log("The socket is bound and the server is listening for connection requests.");
	console.log("Socket value: %j", tcpSocket.address());
	socket.write(JSON.stringify(auditor.getArrayMusicians()));
	socket.end();
});

tcpSocket.listen(PORT_TCP);


/* remove every 3 seconds inactive musicieans from the auditor */
setInterval(auditor.removeUnactiveMusicians, 3000);
