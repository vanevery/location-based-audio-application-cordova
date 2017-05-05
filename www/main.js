// Overall Settings

var DEBUGGING = false;

var GEO_LOC_CONFIGURATION =
{

	desiredAccuracy: 0,
	distanceFilter: 0,
	disableElasticity: true,
	disableStopDetection: true,
	locationUpdateInterval: 500,
	fastestLocationUpdateInterval: 250,
	stationaryRadius: 20, 
	activityType: 'Fitness',
	activityRecognitionInterval: 10000,
	stopTimeout: 15,
	stopDetectionDelay: 1,
	preventSuspend: true,
	heartbeatInterval: 60,
	debug: false,
	stopOnTerminate: true,
	startOnBoot: false

};	
		
var TILE_LOCATION = "tiles/";

// Mapping Related 
var DEFAULT_ZOOM = 15;

var REGION_COLOR = '#FF0000'; // Red
var REGION_ARRAY_COLOR = '#FFFF00'; // Yello
var RADIUS_COLOR = '#FF00FF';  // Purple
var PATH_COLOR = '#00FF00';  // Green
var POSITION_RADIUS_COLOR = '#0000FF'; // blue
var POINT_COLOR = '#B40404'; // Redish

var GOOD_COLOR = '#00FF00'; // Green
var DEBUG_COLOR = '#00FFFF'; // Blue
var SOLO_COLOR = '#FFFFFF'; // White

// Audio Related
var FADE_INTERVAL = 100; // milliseconds

var MAX_NUM_AUDIO_PLAYERS = 25;
var WALKING_SPEED = .0015; //kmeters per second
var TIME_AHEAD = 30; // 30 seconds  - Cut in half
var DISTANCE_TO_LOAD = WALKING_SPEED * TIME_AHEAD;
var CHECK_LOAD_FREQUENCY = 2000; // 2 seconds

var WARNING_BAD_GPS_COUNT = 10;
var GPS_MIN_ACCURACY = 50;

var NUM_TO_GET_FIX = 10;
			
var PROJECT_BOUNDS = [{"lat":42.34952120735293,"lng":-71.09325885772705},{"lat":42.35164618013347,"lng":-71.09383821487427},{"lat":42.352550064686774,"lng":-71.08989000320435},{"lat":42.351218019755436,"lng":-71.0893964767456},{"lat":42.35064713471441,"lng":-71.09124183654785},{"lat":42.347459597941295,"lng":-71.0910701751709},{"lat":42.346634935244786,"lng":-71.08926773071289},{"lat":42.341464687989166,"lng":-71.09076976776123},{"lat":42.34056064400165,"lng":-71.09188556671143},{"lat":42.33640504669669,"lng":-71.09823703765869},{"lat":42.33754707026739,"lng":-71.10081195831299},{"lat":42.342717639670866,"lng":-71.10484600067139},{"lat":42.34129022434778,"lng":-71.10647678375244},{"lat":42.340758900368165,"lng":-71.10802173614502},{"lat":42.34270177967866,"lng":-71.11093997955322},{"lat":42.346365331601866,"lng":-71.10390186309814},{"lat":42.34176603305614,"lng":-71.09930992126465},{"lat":42.34319343757722,"lng":-71.09587669372559},{"lat":42.34592127607232,"lng":-71.09579086303711}];
				  
var MAX_OUTOFBOUNDS_READINGS = NUM_TO_GET_FIX + 5;

var ZOOM_IN_LEVEL = 17;

// Built in variables

var updateMapAndPlayAudio = false;
var zoomedIn = false;

var displayedOutOfRange = false;
var numOutOfBoundsReadings = 0;

var numGotten = 0;
var gotGPSReading = false;

var currentlyPlaying = null;

var deviceReady = false;

var currentSolo = -1;

var translucency = "0.5";

var recentered = false;

var lastCheckLoadTime = 0;
		
// These are the center of the map
var latCenter = 42.3432779;
var lngCenter = -71.098;

var diffLat = 0;
var diffLng = 0;
var currentLat = 0;
var currentLng = 0;
var currentAcc = 100;

var audioContext = null;

var fadeIns = [];
var fadeOuts = [];

function addFadeIn(index) {
	if (fadeIns.indexOf(index) == -1) {
		fadeIns.push(index);	
	}
	
	locations[index].fadein = true;
}


function rmFadeIn(index) {
	locations[index].lastfadeintimestamp = -1;

	var ri = fadeIns.indexOf(index);
	fadeIns.splice(ri, 1);

	locations[index].fadein = false;
}

function addFadeOut(index) {
	if (fadeOuts.indexOf(index) == -1) {
		fadeOuts.push(index);
	}
	locations[index].fadeout = true;
}

function rmFadeOut(index) {
	locations[index].lastfadeouttimestamp = -1;

	var ri = fadeOuts.indexOf(index);
	fadeOuts.splice(ri, 1);
	locations[index].fadeout = false;

}

var fadeInterval = setInterval(function() {
	for (var i = 0; i < fadeIns.length; i++) {
		fadeIn(fadeIns[i]);
	}
	
	for (var j = 0; j < fadeOuts.length; j++) {
		fadeOut(fadeOuts[j]);
	}
	
}, FADE_INTERVAL);



////  Mapping /////

var map, marker, circle, customOverlay, translucentMap;

	function TranslucentMapType(tileSize) {
		this.tileSize = tileSize;
	}
	
	TranslucentMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
		var div = ownerDocument.createElement('div');
		div.style.width = this.tileSize + 'px';
		div.style.height = this.tileSize + 'px';
// 		div.style.border = "thick solid #000000";

		if (zoom == 19 && displayMapLayer)
		{					
			var startcoordx = 158589;
			var startcoordy = 193933;
			var numcoordx = 23;
			var numcoordy = 29;

			if (coord.x >= startcoordx 
				&& coord.x < startcoordx + numcoordx 
				&& coord.y >= startcoordy
				&& coord.y < startcoordy + numcoordy) 
			{				 
				// Change to our tile numbering				 	
				var tileNum = (coord.x - startcoordx) + ((coord.y - startcoordy) * numcoordx) + 1;
		
				if (tileNum < 10) {
					tileNum = "0" + tileNum;
				}
				//console.log("tileNum:" + tileNum);

				var tileFileName = TILE_LOCATION + 'zm19/zm19__'+tileNum+'.png';
				//console.log("tileFileName: " + tileFileName);
				
				div.innerHTML = '<img src="'+tileFileName+'" class="translucent" style="opacity: '+translucency+'">';
			}
			
		} else if (zoom == 18 && displayMapLayer) {
			
			var startcoordx = 79294;
			var startcoordy = 96966;
			var numcoordx = 12;
			var numcoordy = 15;

			if (coord.x >= startcoordx 
				&& coord.x < startcoordx + numcoordx 
				&& coord.y >= startcoordy
				&& coord.y < startcoordy + numcoordy) 
			{				 

				// Change to our tile numbering				 	
				//{x: 19296, y: 24645 // Need numbers in Boston
				var tileNum = (coord.x - startcoordx) + ((coord.y - startcoordy) * numcoordx) + 1;
		
				if (tileNum < 10) {
					tileNum = "0" + tileNum;
				}
				//console.log("tileNum:" + tileNum);

				var tileFileName = TILE_LOCATION + 'zm18/zm18__'+tileNum+'.png';
				//console.log("tileFileName: " + tileFileName);

// 							return tileFileName;	
				div.innerHTML = '<img src="'+tileFileName+'" class="translucent" style="opacity: '+translucency+'">';
	
			}
		} else if (zoom == 17 && displayMapLayer) {
		
			var startcoordx = 39647; //39653
			var startcoordy = 48483; 
			var numcoordx = 6;
			var numcoordy = 8;

			if (coord.x >= startcoordx 
				&& coord.x < startcoordx + numcoordx 
				&& coord.y >= startcoordy
				&& coord.y < startcoordy + numcoordy) 
			{				 

				// Change to our tile numbering				 	
				//{x: 19296, y: 24645 // Need numbers in Boston
				var tileNum = (coord.x - startcoordx) + ((coord.y - startcoordy) * numcoordx) + 1;
		
				if (tileNum < 10) {
					tileNum = "0" + tileNum;
				}
				//console.log("tileNum:" + tileNum);

				var tileFileName = TILE_LOCATION + 'zm17/zm17__'+tileNum+'.png';
				//console.log("tileFileName: " + tileFileName);

// 							return tileFileName;	
				div.innerHTML = '<img src="'+tileFileName+'" class="translucent" style="opacity: '+translucency+'">';
	
			}
		} else if (zoom == 16 && displayMapLayer) {
		
			var startcoordx = 19823; // 19826
			var startcoordy = 24241;
			var numcoordx = 4;
			var numcoordy = 5;

			if (coord.x >= startcoordx 
				&& coord.x < startcoordx + numcoordx 
				&& coord.y >= startcoordy
				&& coord.y < startcoordy + numcoordy) 
			{				 

				// Change to our tile numbering				 	
				//{x: 19296, y: 24645 // Need numbers in Boston
				var tileNum = (coord.x - startcoordx) + ((coord.y - startcoordy) * numcoordx) + 1;
		
				if (tileNum < 10) {
					tileNum = "0" + tileNum;
				}
				//console.log("tileNum:" + tileNum);

				var tileFileName = TILE_LOCATION + 'zm16/zm16__'+tileNum+'.png';
				//console.log("tileFileName: " + tileFileName);

// 							return tileFileName;	
				div.innerHTML = '<img src="'+tileFileName+'" class="translucent" style="opacity: '+translucency+'">';
	
			}
		}  else if (zoom == 15 && displayMapLayer) {
		
			var startcoordx = 9911; // 9913
			var startcoordy = 12120;
			var numcoordx = 3;
			var numcoordy = 3;

			if (coord.x >= startcoordx 
				&& coord.x < startcoordx + numcoordx 
				&& coord.y >= startcoordy
				&& coord.y < startcoordy + numcoordy) 
			{				 

				// Change to our tile numbering				 	
				//{x: 19296, y: 24645 // Need numbers in Boston
				var tileNum = (coord.x - startcoordx) + ((coord.y - startcoordy) * numcoordx) + 1;
		
				if (tileNum < 10) {
					tileNum = "0" + tileNum;
				}
				//console.log("tileNum:" + tileNum);

				var tileFileName = TILE_LOCATION + 'zm15/zm15__'+tileNum+'.png';
				//console.log("tileFileName: " + tileFileName);

// 							return tileFileName;	
				div.innerHTML = '<img src="'+tileFileName+'" class="translucent" style="opacity: '+translucency+'">';
	
			}
		}	

		//console.log(div);
		return div;					
	};

function initMap() {
	console.log("initMap");
	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: latCenter, lng: lngCenter},
		zoom: DEFAULT_ZOOM,
		zoomControl: true,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		rotateControl: false,
		fullscreenControl: false,
		minZoom: 15, 
		maxZoom: 19,

		// Custom Map Styles
		styles: [
		  {
			"elementType": "labels",
			"stylers": [
			  {
				"visibility": "off"
			  }
			]
		  }]			
	});						

	map.overlayMapTypes.insertAt(0, new TranslucentMapType(new google.maps.Size(256, 256)));

	prepareLocations();

	marker = new google.maps.Marker({
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 7,
			fillColor: '#8BAF1A',
			fillOpacity: 0.8,
			strokeColor: '#8BAF1A',
			strokeWeight: 5		  
		},
		position: {lat: currentLat, lng: currentLng},
		map: map
	});

	if (DEBUGGING) {

		// Draw radius around current position for loading visual
		circle = new google.maps.Circle({
			strokeColor: POSITION_RADIUS_COLOR,
			strokeOpacity: 0.2,
			strokeWeight: 2,
			fillColor: POSITION_RADIUS_COLOR,
			fillOpacity: 0.15,
			map: map,
			center: {lat: currentLat, lng: currentLng},
			radius: DISTANCE_TO_LOAD * 1000
		});					
		circle.setMap(map);
	}
}

////  Prepare Locations  ////////

function prepareLocations() {
	console.log("prepareLocations");
	if (map && deviceReady) {
		for (var i = 0; i < locations.length; i++) {
			//log(locations[i]);

			locations[i].index = i;
			
			if (!locations[i].hasOwnProperty("status")) {
				locations[i].status = "default";
			}
			
			if (!locations[i].hasOwnProperty("volume")) {
				locations[i].volume = 1;
			} else if (locations[i].volume == 0) {
				locations[i].volume = 1;
			}			
			
			if (!locations[i].hasOwnProperty("solo")) {
				locations[i].solo = false;
			} else {
				//console.log(locations[i].solo);
			}
						
			if (!locations[i].hasOwnProperty("mode")) {
				// Only matters with region_array
				locations[i].mode = "sequential";
				// Other possibilities is "random", or "single_random"
			}
			
			// audio_array for region_array
			if (locations[i].hasOwnProperty("audio_array")) {

				locations[i].current_index = 0;
				
				prepareArray(locations[i]);
			}

			if (!locations[i].hasOwnProperty("loop")) {
				locations[i].loop = false;
			}

			if (!locations[i].hasOwnProperty("fadetype")) {
				locations[i].fadetype = "volume";
			}

			if (!locations[i].hasOwnProperty("frequencymin")) {
				locations[i].frequencymin = 0;
			}

			if (!locations[i].hasOwnProperty("frequencymax")) {
				locations[i].frequencymax = 32768;
			}

			if (!locations[i].hasOwnProperty("fadein")) {
				locations[i].fadein = false;
			}

			if (!locations[i].hasOwnProperty("fadeout")) {
				locations[i].fadeout = false;
			}
			
			if (!locations[i].hasOwnProperty("fadeTimeout")) {
				locations[i].fadeTimeout = null;
			}
			
			if (!locations[i].hasOwnProperty("probability")) {
				locations[i].probability = 100;
			}
			
			if (!locations[i].hasOwnProperty("within")) {
				locations[i].within = false;
			}
		
			if (!locations[i].hasOwnProperty("distancefade")) {
				locations[i].distancefade = false;
			}
			
			if (locations[i].hasOwnProperty("maxdistance")) {
				locations[i].maxdistance = Number(locations[i].maxdistance);
			}
								
			if (locations[i].type == "region") {
			
				locations[i].center = polygonCenter(locations[i].bounds);
				locations[i].lat = locations[i].center.lat;
				locations[i].lng = locations[i].center.lng;
			
				if (!locations[i].hasOwnProperty("radius")) {
					locations[i].radius = polygonRadius(locations[i].bounds, locations[i].center);
				}						
			
				if (DEBUGGING) {
					var color = REGION_COLOR;
					if (locations[i].solo == true) {
						color = SOLO_COLOR;
					} else if (locations[i].status == "good") {
						color = GOOD_COLOR;
					} else if (locations[i].status == "debug") {
						color = DEBUG_COLOR;
					}
				
					var polygon = new google.maps.Polygon({
						paths: locations[i].bounds,
						strokeColor: color,
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: color,
						fillOpacity: 0.35
					});
					polygon.setMap(map);
					locations[i].polygon = polygon;
					
					// Draw radius
					var radiusCircle = new google.maps.Circle({
						strokeColor: RADIUS_COLOR,
						strokeOpacity: 0.2,
						strokeWeight: 2,
						fillColor: RADIUS_COLOR,
						fillOpacity: 0.15,
						map: map,
						center: locations[i].center,
						radius: locations[i].radius
					});	
					radiusCircle.setMap(map);
					locations[i].circle = radiusCircle;	
				}		
			}
			else if (locations[i].type == "path") {

				locations[i].currentPathIndex = 0;

				locations[i].center = polygonCenter(locations[i].bounds);
										
				if (!locations[i].hasOwnProperty("radius")) {
					locations[i].radius = locations[i].maxdistance + polygonRadius(locations[i].bounds, locations[i].center);
				}

					var color = PATH_COLOR;
					if (locations[i].solo == true) {
						color = SOLO_COLOR;
					} else if (locations[i].status == "good") {
						color = GOOD_COLOR;
					} else if (locations[i].status == "debug") {
						color = DEBUG_COLOR;
					}

				if (DEBUGGING) {
					// Draw the path
					var polygon = new google.maps.Polygon({
						paths: locations[i].path,
						strokeColor: color,
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: color,
						fillOpacity: 0.35
					});
					polygon.setMap(map);
					locations[i].polygon = polygon;		

					// Place a marker
					var locmarker = new google.maps.Marker({
						position: {lat: locations[i].lat, lng: locations[i].lng},
						map: map,
						title: locations[i].label,
						icon: {
							  path: google.maps.SymbolPath.CIRCLE,
							  scale: 10
						}								
					});		
					locations[i].marker = locmarker;								
				
					// Draw radius
					var radiusCircle = new google.maps.Circle({
						strokeColor: RADIUS_COLOR,
						strokeOpacity: 0.2,
						strokeWeight: 2,
						fillColor: RADIUS_COLOR,
						fillOpacity: 0.15,
						map: map,
						center: {lat: locations[i].lat, lng: locations[i].lng},
						radius: locations[i].maxdistance * 1000
					});					
					radiusCircle.setMap(map);							
					locations[i].circle = radiusCircle;
				}
																		
				locations[i].moveInterval = setInterval(function(enclosedlocation) {

					if (enclosedlocation.currentPathIndex < enclosedlocation.path.length - 1) {
						enclosedlocation.currentPathIndex++;
					} else {
						enclosedlocation.currentPathIndex = 0;
					}
					
					enclosedlocation.lat =  enclosedlocation.path[enclosedlocation.currentPathIndex].lat;
					enclosedlocation.lng =  enclosedlocation.path[enclosedlocation.currentPathIndex].lng;
					
					if (DEBUGGING) {
						enclosedlocation.marker.setPosition( enclosedlocation.path[enclosedlocation.currentPathIndex] );	
						enclosedlocation.circle.setCenter(enclosedlocation.path[enclosedlocation.currentPathIndex]);
					}
					
					update();
				}, locations[i].speed, locations[i]);
								
			} else if (locations[i].type == "algopath") {
				// Need to figure out what to do about loading these
				// Maybe always load???

				locations[i].center = {lat: locations[i].lat, lng: locations[i].lng};
				
				if (!locations[i].hasOwnProperty("radius")) {
					locations[i].radius = locations[i].maxdistance;
				}

				if (DEBUGGING) {
					// Place a marker
					var locmarker = new google.maps.Marker({
						position: {lat: locations[i].lat, lng: locations[i].lng},
						map: map,
						title: locations[i].label,
						icon: {
							  path: google.maps.SymbolPath.CIRCLE,
							  scale: 10
						}								
					});		
					locations[i].marker = locmarker;	
					
					// Draw radius
					var radiusCircle = new google.maps.Circle({
						strokeColor: RADIUS_COLOR,
						strokeOpacity: 0.2,
						strokeWeight: 2,
						fillColor: RADIUS_COLOR,
						fillOpacity: 0.15,
						map: map,
						center: {lat: locations[i].lat, lng: locations[i].lng},
						radius: locations[i].maxdistance * 1000
					});					
					radiusCircle.setMap(map);							
					locations[i].circle = radiusCircle;
				}
											
				locations[i].moveInterval = setInterval(function(enclosedlocation) {
					enclosedlocation.lat = eval(enclosedlocation.lat_formula);
					enclosedlocation.lng = eval(enclosedlocation.lng_formula);
					enclosedLocation.center = {lat: enclosedlocation.lat, lng: enclosedlocation.lng};
					if (DEBUGGING) {
						enclosedlocation.marker.setPosition( {lat: enclosedlocation.lat, lng: enclosedlocation.lng} );	
						enclosedlocation.circle.setCenter( {lat: enclosedlocation.lat, lng: enclosedlocation.lng} );	
					}
					update();
				}, locations[i].speed,locations[i]);

			
			} else if (locations[i].type == "point" || locations[i].type == "point_array") {
			
				locations[i].center = {lat: locations[i].lat, lng: locations[i].lng};
			
				if (!locations[i].hasOwnProperty("radius")) {
					locations[i].radius = locations[i].maxdistance;
				}

					var color = POINT_COLOR;
					if (locations[i].solo == true) {
						color = SOLO_COLOR;
					} else if (locations[i].status == "good") {
						color = GOOD_COLOR;
					} else if (locations[i].status == "debug") {
						color = DEBUG_COLOR;
					}

				if (DEBUGGING) {
					var locmarker = new google.maps.Marker({
						position: {lat: locations[i].lat, lng: locations[i].lng},
						map: map,
						title: locations[i].label,
						icon: {
							  path: google.maps.SymbolPath.CIRCLE,
							  scale: 5,
							  strokeColor:color
						}								
					});		
					locations[i].marker = locmarker;	
					
					var radiusCircle = new google.maps.Circle({
						strokeColor: REGION_COLOR,
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: REGION_COLOR,
						fillOpacity: 0.35,
						map: map,
						center: {lat: locations[i].lat, lng: locations[i].lng},
						radius: locations[i].maxdistance * 1000
					});					
					radiusCircle.setMap(map);							
					locations[i].circle = radiusCircle;
				}
																		
			} else if (locations[i].type == "region_array") {
			
				locations[i].center = polygonCenter(locations[i].bounds);
				locations[i].lat = locations[i].center.lat;
				locations[i].lng = locations[i].center.lng;
			
				if (!locations[i].hasOwnProperty("radius")) {
					locations[i].radius = polygonRadius(locations[i].bounds, locations[i].center);
				}

					var color = REGION_ARRAY_COLOR;
					if (locations[i].solo == true) {
						color = SOLO_COLOR;
					} else if (locations[i].status == "good") {
						color = GOOD_COLOR;
					} else if (locations[i].status == "debug") {
						color = DEBUG_COLOR;
					}

				if (DEBUGGING)
				{
					var polygon = new google.maps.Polygon({
						paths: locations[i].bounds,
						strokeColor: color,
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: color,
						fillOpacity: 0.35
					});
					polygon.setMap(map);
					locations[i].polygon = polygon;
					
					// Draw radius
					var radiusCircle = new google.maps.Circle({
						strokeColor: RADIUS_COLOR,
						strokeOpacity: 0.2,
						strokeWeight: 2,
						fillColor: RADIUS_COLOR,
						fillOpacity: 0.15,
						map: map,
						center: locations[i].center,
						radius: locations[i].radius
					});							
					radiusCircle.setMap(map);
					locations[i].circle = radiusCircle;
				}
			}
			
			// Instantiate player	
			if (!(locations[i].type == "region_array" || locations[i].type == "point_array")) {
				locations[i].player = new MediaPlayer(locations[i].audio, i.toString(), locations[i].loop);
			} else {
				locations[i].player = new MediaPlayer(locations[i].audio, i.toString()+" "+locations[i].current_index, false);
			}

// 			Make sure it isn't already loaded
// 			locations[i].player.unload();
			
			document.getElementById("loading").innerHTML = (i+1) + " of " + locations.length;						
		}			

		window.BackgroundGeolocation.changePace(true);
	}
}

/////  Fade In and Fade Out  //////////
		
function fadeOut(index) {
	
	// If we have a fadein going on, cancel it
	if (locations[index].fadein) {
	
		rmFadeIn(index);
	}	

	// If we are greater than 0 then we can do a fadeout
	if (!locations[index].player.paused && locations[index].player.currentVolume > 0) {

		if (locations[index].player.currentVolume < FADE_INTERVAL/locations[index].fadeouttime) {
			locations[index].player.setVolume(0);
			locations[index].player.stop();
			rmFadeOut(index);

			if (locations[index].solo && currentSolo == index) {
				console.log(index + " faded out, no more solo");
				currentSolo = -1;
				update();
				if (DEBUGGING) {
					document.getElementById("solo").innerHTML = "No Solo";
				}
			}			
			
		}
		else {

            var amountToFadeOut = (FADE_INTERVAL/locations[index].fadeouttime);
            if (locations[index].lastfadeouttimestamp && locations[index].lastfadeouttimestamp > -1) {
                var multiplier = (Date.now() - locations[index].lastfadeouttimestamp)/FADE_INTERVAL;
                amountToFadeOut = amountToFadeOut * multiplier;
            }
            locations[index].lastfadeouttimestamp = Date.now();

			// Lower the volume
			locations[index].player.setVolume(locations[index].player.currentVolume - amountToFadeOut);
					//1/(location.fadeouttime/FADE_INTERVAL);
					
		}
				
	} else if (!locations[index].player.paused && locations[index].player.currentVolume <= 0) {
	
//		console.log(index + " volume at 0 pausing");
		
		rmFadeOut(index);			
		
		locations[index].player.setVolume(0);	
		locations[index].player.stop();
		
		if (locations[index].solo && currentSolo == index) {
			console.log(index + " faded out, no more solo");
			currentSolo = -1;
			update();
			if (DEBUGGING) {
				document.getElementById("solo").innerHTML = "No Solo";
			}
		}
	} else if (locations[index].player.paused && locations[index].player.currentVolume <= 0) {
	    rmFadeOut(index);
	    if (DEBUGGING) {
            console.log(index + " rmFadeOut " + index + " didn't meet if/else if " + locations[index].player.currentVolume + " " + locations[index].player.paused);
        }
	}
}

function fadeIn(index) {
	
	//console.log("fadeIn: " + index + " " + locations[index].player.audio);

	if (currentSolo > -1) {
		console.log("Have a current solo, not playing");
		if (DEBUGGING) {
			document.getElementById("solo").innerHTML = "<b>Solo</b> " + locations[currentSolo].audio;
		}
	}

	if (currentSolo == -1 || index == currentSolo) 
	{
		if (locations[index].solo) {
			console.log("found solo " + index + "fade out the rest");
			currentSolo = index;		
			if (DEBUGGING) {
				document.getElementById("solo").innerHTML = "<b>Solo</b> " + locations[currentSolo].audio;
			}

			// Doing this too much while solo fades in
			for (var l = 0; l < locations.length; l++) {
				if (l != currentSolo && locations[l].player.loaded && !locations[l].player.paused) {
					addFadeOut(l);
				}
			}							
		}
		
		if (locations[index].player.paused) {
			locations[index].player.play(
				function() {
					// success
				},
				function() {
					// error
				},
				function(stopCalled) {
				
					console.log(index + "complete callback stopCalled:" + stopCalled);
				
					// Was solo and either stopped or ended
					if (currentSolo == index && (stopCalled || locations[index].loop == false)) {
						console.log(index + " was currentSolo");
						currentSolo = -1;	
						update();	
						if (DEBUGGING) {
							document.getElementById("solo").innerHTML = "No Solo";
						}

					}			
			
					if (locations[index].type == "region_array" || locations[index].type == "point_array") {
						// When it ends
						if (!stopCalled) {
							console.log(index + " array file ended");
							// Should call unload 
							locations[index].player.unload();

							if (locations[index].current_index < locations[index].audio_array.length - 1) {
								locations[index].current_index++;
								locations[index].audio = locations[index].audio_array[locations[index].current_index];

								console.log("new source: " + locations[index].audio);
								
								locations[index].player = new MediaPlayer(locations[index].audio, index.toString()+" "+locations[index].current_index, false);
								
								loadLocationAudio(locations[index], function() {
									addFadeIn(index);
								});
						
							} else {  
		
								console.log("played through: " + index);

								locations[index].current_index = 0;							
								locations[index].audio = locations[index].audio_array[locations[index].current_index];
								locations[index].player = new MediaPlayer(locations[index].audio, index.toString()+" "+locations[index].current_index, false);
								
								loadLocationAudio(locations[index], function() {
									if (locations[index].loop === true) {
										addFadeIn(index);
									}
								});
							}								
						}
					}					
				}
			); // Play
		} // Is paused

		// If we have a fadeout going on, cancel it
		rmFadeOut(index);		

		// If we are less than min then we can do a fadein
		if (locations[index].player.currentVolume < locations[index].volume) {
		
			if (locations[index].player.currentVolume + FADE_INTERVAL/locations[index].fadeintime > locations[index].volume) {
				locations[index].player.setVolume(locations[index].volume);		

				rmFadeIn(index);		
			} else {

			    var amountToFadeIn = FADE_INTERVAL/locations[index].fadeintime;
			    if (locations[index].lastfadeintimestamp && locations[index].lastfadeintimestamp > -1) {
			        var multiplier = (Date.now() - locations[index].lastfadeintimestamp)/FADE_INTERVAL;
			        amountToFadeIn = amountToFadeIn * multiplier;
			    }
    			locations[index].lastfadeintimestamp = Date.now();

				// Raise the volume
				locations[index].player.setVolume(locations[index].player.currentVolume + amountToFadeIn);
			}			
			
		} else {
			
			rmFadeIn(index);		
		}
	}
}

////// Audio Array Methods /////

// Call when setting up locations
function prepareArray(location) {
	if (location.type == "region_array" || location.type == "point_array") {

		// Start position for random
		if (location.mode == "random" || location.mode == "single_random") {
			shuffle(location.audio_array); 
		}
				
		location.audio = location.audio_array[location.current_index];
	}
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
  }

  return array;
}   	

////// Update Everything, Called by Position Updated //////

function update() {
	console.log("update");
	
	var pos = {
		lat: currentLat,
		lng: currentLng
	};
	
	if (Date.now() - lastCheckLoadTime > CHECK_LOAD_FREQUENCY) 
	{
		checkLoadLocations();		
		lastCheckLoadTime = Date.now();
	}

	for (var i = 0; i < locations.length; i++) {
		// Only check if it is loaded
		
		if (locations[i].player.loaded) 
		{			
			if (locations[i].type == "region" || locations[i].type == "region_array") {
				// Inside region
				if (inside(pos, locations[i].bounds) && (currentSolo == -1 || i == currentSolo)) {
					// Were they already inside
					if (!locations[i].within) {
						//log("wasn't within previously");
						locations[i].within = true;
						// Check probability
						if (locations[i].probability == 100 || Math.random()*100 <= locations[i].probability) {												
							addFadeIn(i);
						}
					} else {
						// They were already within
					}
				} else {
					locations[i].within = false;
					addFadeOut(i);
				}
			} else if (locations[i].type == "algopath" || locations[i].type == "path" || locations[i].type == "point" || locations[i].type == "point_array") {
				if (inrange(pos, locations[i])  && (currentSolo == -1 || i == currentSolo)) {
					if (!locations[i].distancefade) {
					// Were they already inside
						if (!locations[i].within) {
							locations[i].within = true;
							// Check probability
							if (locations[i].probability == 100 || Math.random()*100 <= locations[i].probability) {																		
								addFadeIn(i);
							}
						} else {
							// They were already within
						}
					} else {
						// Distance Fade
						if (locations[i].player.paused) {
							if (currentSolo == -1) {

								if (locations[i].solo) {
									console.log("found solo " + i);
									currentSolo = i;		

									if (DEBUGGING) {
										document.getElementById("solo").innerHTML = "<b>Solo</b> " + locations[currentSolo].audio;
									}

			
									// fade out everything else
									for (var l = 0; l < locations.length; l++) {
										if (l != currentSolo && locations[l].player.loaded && !locations[l].player.paused) {
											addFadeOut(l);
										}
									}							
								}

								locations[i].player.play();
								//log(i + " play");
							}
						}
						locations[i].player.setVolume((locations[i].maxdistance - geoDistance(pos.lat, pos.lng, locations[i].lat, locations[i].lng))/locations[i].maxdistance * locations[i].volume);
						console.log("distance fade: " + i + " " + locations[i].player.currentVolume);
					}
				} else {
					locations[i].within = false;
					if (!locations[i].distancefade) {
						addFadeOut(i);
					} else {
						// Distance Fade
						console.log("DISTANCE FADE OUT OF AREA" + i);
						locations[i].player.setVolume(0);													
						locations[i].player.stop();
					}
				}
			}
		}
	}        		
}

//////  Geo Calculations  ///////

function inrange(point, emitter) {
	
	if (geoDistance(point.lat, point.lng, emitter.lat, emitter.lng) < emitter.maxdistance) {
		return true;
	} else {
		return false;
	}
}

function inside(point, vs) {
	var inside = false;
	var y = point.lat;
	var x = point.lng;

	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = vs[i].lng, yi = vs[i].lat;
		var xj = vs[j].lng, yj = vs[j].lat;

		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}
	return inside;
};

function geoDistance(lat1, lng1, lat2, lng2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var radlng1 = Math.PI * lng1/180
	var radlng2 = Math.PI * lng2/180
	var theta = lng1-lng2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	//if (unit=="K") { dist = dist * 1.609344 }
	//if (unit=="N") { dist = dist * 0.8684 }
	// This is returning miles not KM at the moment
	// Now it is KM..
	dist = dist * 1.609344;
	return dist
}

function polygonRadius(bounds, center) {
	var maxDistance = 0;
	for (var i = 0; i < bounds.length; i++) {
		var currentDistance = 1000 * geoDistance(center.lat, center.lng, bounds[i].lat, bounds[i].lng);
		if (currentDistance > maxDistance) {
			maxDistance = currentDistance;					
		}
	}
	return maxDistance;
}

function polygonArea(bounds) {
	var area = 0,
		i,
		j,
		point1,
		point2;

	for (i = 0, j = bounds.length - 1; i < bounds.length; j=i,i++) {
		point1 = bounds[i];
		point2 = bounds[j];
		area += point1.lng * point2.lat;
		area -= point1.lat * point2.lng;
	}
	area /= 2;

	return area;
};

function polygonCenter(bounds) {
	var x = 0,
		y = 0,
		i,
		j,
		f,
		point1,
		point2;

	for (i = 0, j = bounds.length - 1; i < bounds.length; j=i,i++) {
		point1 = bounds[i];
		point2 = bounds[j];
		f = point1.lng * point2.lat - point2.lng * point1.lat;
		x += (point1.lng + point2.lng) * f;
		y += (point1.lat + point2.lat) * f;
	}

	f = polygonArea(bounds) * 6;
	
	return {lat:(y / f), lng:(x / f)};
};			


///// Load and Unload Location Audio ///////

function unloadLocationAudio(location) {
	if (location.player.loaded) {

		console.log("unloadLocationAudio " + location.index);
	
		// First make sure it isn't still playing
		if (!location.player.paused) {
		
			console.log("still playing " + location.index + " so either start fadeOut or wait");	
		
// 			if (!location.fadeout) {			
				console.log("fadeout not happening so starting it");
				// This should never happen, really..
				// It's there but not paused (playing) and not fading out so start fadeout
				//fadeOut(location.index);
				addFadeOut(location.index);
// 			} else {
// 				console.log("fadeout should be happening!");
// 			}
		
			// We'll get to unloading it once we can
		
		} else {

			// Clear out the player
			location.player.stop(function() {
				location.player.unload();
			});		
		}
	}
}

function loadLocationAudio(location, _callback) {
	console.log("loadLocationAudio");
	
	var cb = function(){};
	if (typeof _callback != "undefined") {
		cb = _callback;
	}
		
	if (!location.player.loaded) {
		location.player.audio = location.audio;
		location.player.load(cb);
	}
}

function checkLoadLocations() {
	// Load/Unload Audio Files
	console.log("checkLoadLocations");
	
	var numLoaded = 0;
	
	// Unload first
	for (var i = 0; i < locations.length; i++) 
	{
		if (locations[i].player && locations[i].player.loaded == true) {
			if (geoDistance(locations[i].center.lat, locations[i].center.lng, currentLat, currentLng) > DISTANCE_TO_LOAD + locations[i].radius/1000)
			{					
				console.log(DISTANCE_TO_LOAD + " distance:" + geoDistance(locations[i].center.lat, locations[i].center.lng, currentLat, currentLng));
				console.log("Unloading: " + i);
				unloadLocationAudio(locations[i]);
			} else {
				numLoaded++;
			}
		}
	}							

	// Now load
	for (var i = 0; i < locations.length && numLoaded < MAX_NUM_AUDIO_PLAYERS; i++) 
	{
		if (locations[i].player.loaded == false && 
			geoDistance(locations[i].lat, locations[i].lng, currentLat, currentLng) <= DISTANCE_TO_LOAD + locations[i].radius/1000) 
		{
			console.log(DISTANCE_TO_LOAD + " distance:" + geoDistance(locations[i].center.lat, locations[i].center.lng, currentLat, currentLng));

			console.log("Loading: " + i);
			loadLocationAudio(locations[i]);
			numLoaded++;
		}
	}
	
	if (DEBUGGING) {
		document.getElementById("numfiles").innerHTML = numLoaded + " files loaded";
	}							
}

////// Position to Map and Audio //////

function positionUpdated() {

	if (updateMapAndPlayAudio) {
		var mapPos = {
			lat: currentLat,
			lng: currentLng
		};					

		if (!zoomedIn) {
			map.setZoom(ZOOM_IN_LEVEL);
			zoomedIn = true;
		}
		
		marker.setPosition(mapPos);
		map.setCenter(mapPos);
 		map.panBy(0,0);

		if (DEBUGGING) 
		{
			document.getElementById('currentLocation').innerHTML = currentLat + " " + currentLng;

			circle.setCenter(mapPos);
		}
	
		update();
	}

}


////// Position Callbacks //////

var badGPSCount = 0;
var accurateGPSFix = false;
// HTML5 Version
//function locationWatchPositionCallback(currentPosition) 
// Background Geolocation Version
function locationWatchPositionCallback(currentPosition, taskId)
{
	console.log(currentPosition);
	
	if (currentPosition.coords.accuracy <= GPS_MIN_ACCURACY 
		|| (!accurateGPSFix && currentPosition.coords.accuracy <= currentAcc)) {
		
		currentLat = currentPosition.coords.latitude;
		currentLng = currentPosition.coords.longitude;
		currentAcc = currentPosition.coords.accuracy;
		
		gotGPSReading = true;
				
		if (!accurateGPSFix && currentAcc < GPS_MIN_ACCURACY) {
			accurateGPSFix = true;
		}

		currentLat += diffLat;
		currentLng += diffLng;
		
		var boundsPos = {
			lat: currentLat,
			lng: currentLng
		};
		
		if (!inside(boundsPos, PROJECT_BOUNDS)) {
			numOutOfBoundsReadings++;
		}
		
		if (numOutOfBoundsReadings >= MAX_OUTOFBOUNDS_READINGS && !displayedOutOfRange) {
			displayedOutOfRange = true;
			outOfBounds();
			window.BackgroundGeolocation.finish(taskId);
			window.BackgroundGeolocation.stop();
		}

		badGPSCount = 0;

		positionUpdated();
		
		if (numGotten < NUM_TO_GET_FIX) {
			numGotten++;
			setTimeout(function() {
					window.BackgroundGeolocation.changePace(true);		
					window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);
				}, 3000);
		}
		
	} else {
		badGPSCount++;
		console.log("badGPSCount: " + badGPSCount);
	}
	
		// Must signal completion of your callbackFn.
		window.BackgroundGeolocation.finish(taskId);
}


function locationWatchPositionErrorCallback(errorCode) {
	console.log('An location error occurred: ' + errorCode);
}



//////  Start //////////

function onDeviceReady() {
	console.log("onDeviceReady YES!");

	currentlyPlaying = document.getElementById("currentlyplaying");

	deviceReady = true;

	console.log(device.platform);

	/////// Keep screen awake ///////
	//window.plugins.insomnia.keepAwake();

    // Startup the NativeAudio plugin
    //window.plugins.NativeAudio.setOptions(function() {}, function() {}, {});

	prepareLocations();			
	checkLoadLocations();
	lastCheckLoadTime = Date.now();

		// Listen to location events & errors.
		window.BackgroundGeolocation.on('location', locationWatchPositionCallback, locationWatchPositionErrorCallback);

		// BackgroundGeoLocation is highly configurable.
		window.BackgroundGeolocation.configure(GEO_LOC_CONFIGURATION, function(state) {
			// This callback is executed when the plugin is ready to use.
			console.log('****BackgroundGeolocation ready:*****', state);
			if (!state.enabled) {
				window.BackgroundGeolocation.start();
			}
			
			window.BackgroundGeolocation.changePace(true);		
			window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);		

		});	

	window.BackgroundGeolocation.on('heatbeat', 
		function(params) {
			console.log("heartbeat");
			console.log(params);
			window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);
		},
		function(err) {
			console.log(err);
		} 
	);


	window.BackgroundGeolocation.on('motionchange', function(isMoving, location, taskId) {
	    if (isMoving) {
    	    console.log('Device has just started MOVING', location);
			window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);    	    
	    } else {
    	    console.log('Device has just STOPPED', location);
			window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);
	    }
    	window.BackgroundGeolocation.finish(taskId);
    });

	document.addEventListener("resume", function() {
		console.log("resume");

		numOutOfBoundsReadings = 0		
		displayedOutOfRange = false;
		
		currentAcc = 100;
		numGotten = 0;
		window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);			
		
		window.BackgroundGeolocation.getState(function(state) {
		
			if (!state.enabled) {
				console.log("Restarting GeoLocation");
				window.BackgroundGeolocation.start();
			}
			
			window.BackgroundGeolocation.changePace(true);		
			window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);
		});			
	});

	document.addEventListener("pause", function() {
		console.log("pause");
 		window.BackgroundGeolocation.changePace(true);
	});

	window.BackgroundGeolocation.changePace(true);

	setTimeout(function() {
		inBounds();
		
		updateMapAndPlayAudio = true;
		if (gotGPSReading) {
			// Don't want to call update if we don't have any GPS readings
			update();
		}
	}, 7000);
	
}

function onWindowLoad() {
	document.addEventListener('deviceready', onDeviceReady);
	//onDeviceReady();
}

window.addEventListener('load', onWindowLoad);

///////// Overall Methods /////////

function log(message) {
// 	document.getElementById('log').innerHTML = message + " " + document.getElementById('log').innerHTML;
	if (DEBUGGING) {
		console.log(message);
	}
}

///////// NativeAudio Player Class ////////////

function MediaPlayer(_audio, _label, _loop) {

	var thisMediaPlayer = this;

	thisMediaPlayer.audio = _audio;
	thisMediaPlayer.assetLabel = _label;
	thisMediaPlayer.loop = _loop
	
	thisMediaPlayer.stopCalled = false;
	
	thisMediaPlayer.paused = true;
	thisMediaPlayer.loaded = false;
	
	thisMediaPlayer.startTimestamp = 0;
	thisMediaPlayer.position = 0;

	thisMediaPlayer.currentVolume = 0;
	
	thisMediaPlayer.element = null;
	
	if (device.platform == "iOS" || device.platform == "Android") {
		thisMediaPlayer.setVolume = function(volume, successCb, errorCb) {
			window.plugins.NativeAudio.setVolumeForComplexAsset(thisMediaPlayer.assetLabel, volume, 
				function() {
					thisMediaPlayer.currentVolume = volume;
					if (typeof successCb !== "undefined") {
						successCb();
					}
				}, 
				function() {
					if (typeof errorCb !== "undefined") {
						errorCb();
					}
				}
			);
		};
		
	} else if (device.platform == "NOTAndroid") {

		thisMediaPlayer.setVolume = function(volume, successCb, errorCb) {
			if (thisMediaPlayer.element != null) {
				thisMediaPlayer.element.volume = volume;
				thisMediaPlayer.currentVolume = volume;
				if (typeof successCb !== "undefined") {
					successCb();
				}
				
				thisMediaPlayer.div.innerHTML = thisMediaPlayer.audio.split('/').pop() + " " + thisMediaPlayer.currentVolume;				
			}
			
/*
			if (typeof errorCb !== "undefined") {
				errorCb();
			}
*/
		};
	}
	
	if (device.platform == "iOS" || device.platform == "Android") {	
		thisMediaPlayer.stop = function(successCb, errorCb) {
		
			thisMediaPlayer.stopCalled = true;
		
			window.plugins.NativeAudio.pause(thisMediaPlayer.assetLabel, 
				function() {
					thisMediaPlayer.paused = true;
					thisMediaPlayer.position = Date.now() - thisMediaPlayer.startTimestamp;
				
					if (typeof successCb !== "undefined") {
						successCb();
					}
				},
				function() {
					if (typeof errorCb !== "undefined") {
						errorCb();
					}
				}	
			);
		
			if (DEBUGGING) {
				try {
					currentlyPlaying.removeChild(document.getElementById(thisMediaPlayer.assetLabel));			
				} catch(err) {
					console.log(err);
				}
			}
		};
	} else if (device.platform == "NOTAndroid") {
		thisMediaPlayer.stop = function(successCb, errorCb) {
		
			thisMediaPlayer.stopCalled = true;
				
			if (thisMediaPlayer.element != null) {
				thisMediaPlayer.paused = true;
				thisMediaPlayer.position = Date.now() - thisMediaPlayer.startTimestamp;
				thisMediaPlayer.element.pause();
				if (typeof successCb !== "undefined") {
					successCb();
				}
			}

/*	
			if (typeof errorCb !== "undefined") {
				errorCb();
			}
*/
// 			if (DEBUGGING) {
// 				try {
// 					document.getElementById("currentlyplaying").removeChild(document.getElementById(thisMediaPlayer.assetLabel));			
// 				} catch(err) {
// 					console.log(err);
// 				}
// 			}	
		};
	
	}
		
	if (device.platform == "iOS" || device.platform == "Android") {
		thisMediaPlayer.load = function(successCb, errorCb) {		
			if (!thisMediaPlayer.loaded) {
							
				window.plugins.NativeAudio.preloadComplex(thisMediaPlayer.assetLabel, 
					thisMediaPlayer.audio, 
					0, // volume
					1, // voices
					0, // delay
					function(msg) {
						thisMediaPlayer.loaded = true;
						//console.info(msg); 
						if (typeof successCb !== "undefined") {
							successCb();
						}
					}, 
					function(msg){ 
						// Error is often that it is already loaded
						thisMediaPlayer.loaded = true;
						
						console.log('Error: ' + msg ); 
						console.log("Error on: " + thisMediaPlayer.assetLabel + " " + thisMediaPlayer.audio);
						if (typeof errorCb !== "undefined") {
							errorCb();
						}
					}
				);	
			}
		};	
	} else if (device.platform == "NOTAndroid") {
		thisMediaPlayer.load = function(successCb, errorCb) {		
			if (!thisMediaPlayer.loaded) {

				var audio = document.createElement("audio");
				audio.src = thisMediaPlayer.audio;

				audio.preload = "auto";
				audio.loop = thisMediaPlayer.loop;
				audio.muted = false;
				audio.controls = true;
				audio.volume = 0;
				audio.autoplay = false;
				audio.load();

				thisMediaPlayer.element = audio;

				var div = document.createElement("div");
				div.innerHTML = thisMediaPlayer.audio.split('/').pop() + " " + thisMediaPlayer.currentVolume;				
// 				div.innerHTML = audio.src.split('/').pop();
				div.id = audio.src.split('/').pop();
				document.getElementById("locations").appendChild(div);
				thisMediaPlayer.div = div;

				document.getElementById("locations").appendChild(audio);					

				thisMediaPlayer.loaded = true;

				// Should use some kind of callback from mediaplayer
				if (typeof successCb !== "undefined") {
					successCb();
				}

				/*
					console.log('Error: ' + msg ); 
					if (typeof errorCb !== "undefined") {
						errorCb();
					}

				*/
			}
		};		
	}
	
	if (device.platform == "iOS" || device.platform == "Android") {
		thisMediaPlayer.unload = function(successCb, errorCb) {
			if (thisMediaPlayer.paused && thisMediaPlayer.loaded) {
				window.plugins.NativeAudio.unload(thisMediaPlayer.assetLabel,
					function() {
						thisMediaPlayer.loaded = false;
						if (typeof successCb !== "undefined") {
							successCb();
						}				
					},
					function() {
						if (typeof errorCb !== "undefined") {
							errorCb();
						}				
					}
				);
			} else {
				console.log("Can't unload, not paused or not loaded");
			}
		};
	} else if (device.platform == "NOTAndroid") {

		thisMediaPlayer.unload = function(successCb, errorCb) {

			if (thisMediaPlayer.paused && thisMediaPlayer.loaded) {
				thisMediaPlayer.element.pause();
				thisMediaPlayer.element.src = "";
				thisMediaPlayer.element.load();
	
				// Remove the elements
				//location.div.removeChild(location.element);
				thisMediaPlayer.element.parentNode.removeChild(thisMediaPlayer.element);
				thisMediaPlayer.div.parentNode.removeChild(thisMediaPlayer.div);

				thisMediaPlayer.loaded = false;

				if (typeof successCb !== "undefined") {
					successCb();
				}	

				/*
				if (typeof errorCb !== "undefined") {
					errorCb();
				}
				*/				
			}
		};
	}

	if (device.platform == "iOS" || device.platform == "Android") {	
		thisMediaPlayer.play = function(successCb, errorCb, completeCb) {

			console.log("playing: " + thisMediaPlayer.assetLabel + " " + thisMediaPlayer.audio);
			if (thisMediaPlayer.paused && thisMediaPlayer.loaded) {
		
				thisMediaPlayer.stopCalled = false;
				thisMediaPlayer.startTimestamp = Date.now();
				thisMediaPlayer.position = 0; // Need a way to start at a different time
				thisMediaPlayer.paused = false;

				window.plugins.NativeAudio.play(thisMediaPlayer.assetLabel, 
					function() {
						// success
						console.log("Playing " + thisMediaPlayer.audio);
						if (typeof successCb !== "undefined") {
							successCb();
						}					
					},
					function() {
						// error
						if (typeof errorCb !== "undefined") {
							errorCb();
						}					
					},
					function() {
						console.log("Play complete callback: " + thisMediaPlayer.assetLabel);
					
						// complete
						thisMediaPlayer.paused = true;
						thisMediaPlayer.position = 0;

						if (typeof completeCb !== "undefined") {
							completeCb(thisMediaPlayer.stopCalled);
						}					

						if (DEBUGGING) {
							try {
// 								if (typeof document.getElementById(thisMediaPlayer.assetLabel) !== 'undefined') {
									currentlyPlaying.removeChild(document.getElementById(thisMediaPlayer.assetLabel));
// 								}
							} catch(err) {
								console.log(err);
							}
						}

						if (!thisMediaPlayer.stopCalled && thisMediaPlayer.loop) {
							thisMediaPlayer.play();
						}
					}
				);	
				
				if (DEBUGGING) {
					var div = document.createElement("div");
					div.id = thisMediaPlayer.assetLabel;
					div.innerHTML = thisMediaPlayer.assetLabel + " " + thisMediaPlayer.audio;
					try {
						currentlyPlaying.appendChild(div);
					}
					catch (error) {
						console.log(error);
					}
				}				
			}
		}
	} else if (device.platform == "NOTAndroid") {
		
		thisMediaPlayer.play = function(successCb, errorCb, completeCb) {

			console.log("playing: " + thisMediaPlayer.assetLabel + " " + thisMediaPlayer.audio);
			if (thisMediaPlayer.paused && thisMediaPlayer.loaded) {
		
				thisMediaPlayer.stopCalled = false;
				thisMediaPlayer.startTimestamp = Date.now();
				thisMediaPlayer.position = 0; // Need a way to start at a different time
				thisMediaPlayer.paused = false;

				thisMediaPlayer.element.play();
				console.log("Playing " + thisMediaPlayer.audio);
				if (typeof successCb !== "undefined") {
					successCb();
				}					
/*
				if (typeof errorCb !== "undefined") {
					errorCb();
				}					
*/
				thisMediaPlayer.element.addEventListener('ended', function() {	
					console.log("Play complete callback: " + thisMediaPlayer.assetLabel);
				
					// complete
					thisMediaPlayer.paused = true;
					thisMediaPlayer.position = 0;

					if (typeof completeCb !== "undefined") {
						completeCb(thisMediaPlayer.stopCalled);
					}					

// 					if (DEBUGGING) {
// 						try {
// 							document.getElementById("currentlyplaying").removeChild(document.getElementById(thisMediaPlayer.assetLabel));			
// 						} catch(err) {
// 							console.log(err);
// 						}
// 					}

					if (!thisMediaPlayer.stopCalled && thisMediaPlayer.loop) {
						thisMediaPlayer.play();
					}
				});								
			} else {
				console.log("Not Playing: paused: " + thisMediaPlayer.paused + " loaded: " + thisMediaPlayer.loaded);
			}

// 			if (DEBUGGING) {
// 			
// 				var div = document.createElement("div");
// 				div.id = thisMediaPlayer.assetLabel;
// 				div.innerHTML = thisMediaPlayer.assetLabel + " " + thisMediaPlayer.audio;
// 				document.getElementById("currentlyplaying").appendChild(div);
// 			}				
		}	
	}
}

///// Map Debugging Functions //////

var displayMapLayer = true;
function toggleMap() {
	displayMapLayer = !displayMapLayer;
	map.setZoom(map.getZoom()-1);
	map.setZoom(map.getZoom()+1);

}

var mapVisible = true;
function toggleMapVisibility() {
	mapVisible = !mapVisible;
	if (mapVisible) {
		document.getElementById("map").style.width = "100%";
		document.getElementById("map").style.height = "100%";
		document.getElementById("map").style.position = "absolute";
		
		DEBUGGING = false;
		initMap();

		document.getElementById("testing").style.display = "none";

		positionUpdated();
		
	} else {
		document.getElementById("map").style.width = "100%";
		document.getElementById("map").style.height = "300px";
		document.getElementById("map").style.position = "relative";

		DEBUGGING = true;
		
		initMap();
		
		document.getElementById("testing").style.display = "block";

		positionUpdated();
	}
}

function mapOpacityChange(thevalue) {
	translucency = thevalue/10;
	document.getElementById("currentopacity").innerHTML = translucency;
	map.setZoom(map.getZoom()-1);
	map.setZoom(map.getZoom()+1);
}


///// Manual Movements //////

function recenter() {
	diffLat = latCenter - currentLat;
	diffLng = lngCenter - currentLng;
	
	currentLat += diffLat;
	currentLng += diffLng;

	recentered = true;

	numOutOfBoundsReadings = 0		
	displayedOutOfRange = false;
	
	currentAcc = 100;
	numGotten = 0;
	window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);			
	
	window.BackgroundGeolocation.getState(function(state) {
	
		if (!state.enabled) {
			console.log("Restarting GeoLocation");
			window.BackgroundGeolocation.start();
		}
		
		window.BackgroundGeolocation.changePace(true);		
		window.BackgroundGeolocation.getCurrentPosition(locationWatchPositionCallback);
	});		
	
	// Make sure it does a location load
	lastCheckLoadTime = 0;
	positionUpdated();
}

function up() {
	if (recentered) {
		currentLat -= diffLat;
		currentLng -= diffLng;    	    	
	}

	diffLat += 0.0001;
	
	currentLat += diffLat;
	currentLng += diffLng;

	//log(diffLat + " " + diffLng);
	
	lastCheckLoadTime = 0;
	positionUpdated();				
}

function down() {
	if (recentered) {
		currentLat -= diffLat;
		currentLng -= diffLng;    	    	
	}

	diffLat -= 0.0001;
	
	currentLat += diffLat;
	currentLng += diffLng;

	//log(diffLat + " " + diffLng);    	    	

	lastCheckLoadTime = 0;
	positionUpdated();
}

function right() {
	if (recentered) {
		currentLat -= diffLat;
		currentLng -= diffLng;    	    	
	}

	diffLng += 0.0001;
	
	currentLat += diffLat;
	currentLng += diffLng;

	//log(diffLat + " " + diffLng);

	lastCheckLoadTime = 0;
	positionUpdated();
}

function left() {
	if (recentered) {
		currentLat -= diffLat;
		currentLng -= diffLng;    	    	
	}

	diffLng -= 0.0001;

	currentLat += diffLat;
	currentLng += diffLng;
	
	//log(diffLat + " " + diffLng);

	lastCheckLoadTime = 0;
	positionUpdated();
}
