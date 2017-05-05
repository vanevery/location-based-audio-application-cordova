// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

function outOfBounds() {
    myApp.alert('Fens is made for the Back Bay Fens in Boston.  Please go to the Back Bay Fens and relaunch the app.  GPS tracking will automatically stop now until you relaunch.', 'Out of range', function () {
    	console.log("Out of range button clicked");
    });
}

function inBounds() {
	myApp.alert("Please set your GPS to high accuracy.  We recommend disabling power saving mode for optimal performance.  We also suggest disabling display timeout, as glancing at the map occasionally allows you to compare topographies over time.", 'Recommended Settings');
}

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true,
	domCache: true //enable inline pages
});

myApp.onPageReinit('index', function (page) {
	console.log("index page");
	document.getElementById('thenavbar').style.backgroundColor = 'rgba(239, 239, 244, 0.0)';
});

myApp.onPageInit('about', function (page) {
	document.getElementById('thenavbar').style.backgroundColor = 'rgba(239, 239, 244, 1.0)';
});

myApp.onPageInit('respond', function (page) {
	console.log("Respond Page");
	document.getElementById('thenavbar').style.backgroundColor = 'rgba(239, 239, 244, 1.0)';
});

myApp.onPageInit('credits', function (page) {
	console.log("Credits Page");
	document.getElementById('thenavbar').style.backgroundColor = 'rgba(239, 239, 244, 1.0)';
});
