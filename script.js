// JavaScript Document

var uuid = PUBNUB.uuid();
var pubnub = PUBNUB.init({
	publish_key: 'pub-c-ddc0bdfd-465e-4bbc-933e-32b10c2b784f',
	subscribe_key: 'sub-c-1b6a917e-cf6d-11e5-837e-02ee2ddab7fe',
	uuid: uuid,
	heartbeat: 10
});


var noOfWordsInRow = 0;
//arrays
var consonantArray = ["b","c","d","f","g","h","j","k","l","m","n","p","r","s","t","v","w","y"];
var vowelArray = ["a","e","i","o","u"];
var submittedWordsArray = [];

//containers
//var lettersDiv = $("div#letterDisplay");
var wordAreaDiv = $("div#wordArea");
//var submitDiv = $("div#submitDiv");
var startDiv = $("div#start");

//var checkDiv = $("div#checkDiv");

var consonantUl = $("ul#consonantUl");
var vowelUl = $("ul#vowelUl");
var notificationUl = $("#notificationList");

var confirmWord = $("p#word");
var confirmBtn = $("#confirmBtn");
var error = $("#error");
var noOfPlayers = $("p#noOfPlayers");
//buttons
var enterLobby = $("button#enterLobby");
var startGame = $("button#startGame");
var endGame = $("button#endGame");
//input

//other
var inLobby = true; //local state
var scores = []; //will contain arrays which have [name, letters]
var words = []; //user's words after clicking endgame, used to display them

//pubnub portion of game


/*
function startGameCountdown() {
	"use strict";
	var minutes = 3, secs = 60;
	var timer = setInterval(function(){
		$("p#timerDisplay").html(minutes + ": " + secs);
		if(secs === 0){
			if(minutes === 0){
				clearInterval(timer);	
			}
			else {
				minutes--;
				secs = 60;
			}
		}
		else {
			secs--;
		}
	},1000);
}

*/






$(window).load(function(){
	"use strict";
	notificationUl.hide();
});








//game and chat stuff below

startGame.click(function(){ //will make all players start game
	"use strict";
	var vowels = generateRandomLetters(vowelArray, 3);
	var consonants = generateRandomLetters(consonantArray, 4);
	inLobby = false;
	//start timer
	pubnub.publish({
		channel: "letters",
		message: [vowels, consonants]
	});
	pubnub.state({
		channel: "testChannel14",
		state: {
			inGame: true
		},
		callback: function(m){console.log(m.inGame);}
	});
});

endGame.click(function(){ //will make all players end game
	"use strict";
	confirmWord.html('');
	inLobby = true;
	pubnub.state({
		channel: "testChannel14",
		state: {
			inGame: false
		},
		callback: function(m){console.log(m.inGame);}
	});
	pub("endGameChannel",[$("#usernameInput").val(),getLetterAmount(),words]); //[username,integer,[words]]
});

enterLobby.click(function(){
	"use strict";
	//testChannel14
	startDiv.css("display", "none");
});

/*function handleWordArray(m){ //m is an array, called when an array gets pub'd to channel "words" but only to whoever clicked the endgame button
	"use strict";
	alert(m[0]);
	wordAreaDiv.prepend("<ul class='wordList'></ul>");
	cancelOutWords(m[0],m[1]);	 //will just compare 2 arrays, not all of them.
	for(var i=0;i<m.length;i++){
		$("ul:first").append("<li>"+m[i]+"</li>");
	}
}*/

/*function cancelOutWords(array1, array2){
	"use strict";
	var array = getLargestArray(array1, array2); //array[0] > array[1]
	for(var i=0;i<array[0].length;i++){
		for(var e=0;e<array[1].length;e++){
			if(array[0][i] === array[1][e]){
				array.splice([0][i],1);
				array.splice([1][e],1);
			}
		}
	}
}*/


function getLetterAmount(){
	"use strict";
	var letters = 0;
	words = putWordsIntoArray(); //is array containing strings
	for(var i=0;i<words.length;i++){
		letters = letters + words[i].length;
		console.log(letters);
	}
	return letters;
}

function decideWinner(m){
	"use strict";
	scores.push(m);
	//listWords(m);
	pubnub.here_now({
		channel: "testChannel14",
		callback: function(m){
			if(scores.length === m.occupancy){
				logArrayContents(scores);
				var letters = [];
				for(var i=0;i<scores.length;i++){
					letters.push(scores[i][1]);
				}
				var largest = Math.max.apply(Math, letters);
				var winners = [];
				for(var e=0;e<scores.length;e++){
					if(largest === scores[e][1]){
						winners.push(scores[e][0] + " (" + scores[e][1] + ")");
					}
				}
				alert(winners.toString() + " has won!");
				scores.length = 0;
			}
		}
	});
}

function handleLetters(m){ // [vowels, consonants] eaCH ITEM IS An array
	"use strict";
	vowelUl.empty(); //i empty them here and not when ending the game so that people have the chance to see what other words they could make
	consonantUl.empty();
	for(var i=0 ; i<3 ; i++){ // 3 = m[0].vowels.length
		vowelUl.append("<li><button>"+m[0][i]+"</button></li>");
	}
	for(var e=0 ; e<4 ; e++){ // 4 = m[0].consonants.length
		consonantUl.append("<li><button>"+m[1][e]+"</button></li>");
	}
} //called at start of game

function putWordsIntoArray(){
	"use strict";
	var noOfTd = $("td").not(".special").length;
	var array = [];
	for(var i=0;i<noOfTd;i++){
		var word = $("td:not(.special):first");
		array.push(word.text());
		word.remove();
	}
	return array;
} 

/*function listWords(array){
	"use strict";
	$("tr:last").append("<ul class='listOfWords'></ul>");
	for(var i=0;i<array[2].length;i++){
		$("tr ul:last").append("<li>"+array[2][i]+"</li>");
	}
}*/

function presence(m){
	"use strict";
	console.log(m);
	if(m.action === "join"){
		pub("testChannel14","Player joined");
		if(uuid === m.uuid){ //only will run for the user who joined
			pubnub.here_now({
				channel: "testChannel14",
				state: true,
				callback: function(m){
					var p = m.uuids;
					if(p[0].state.inGame && p[0].uuid !== uuid){
						pubnub.unsubscribe({
							channel: "testChannel14",
							callback: alert("Game is in progress, you have been kicked")
						});
					}
				}
			});
		}
	}
	else if(m.action === "timeout" || m.action === "leave"){
		pub("testChannel14","Player left");	
	}
	else if(m.action === "state-change"){
		if(m.data.inGame && inLobby){ //someone clicked the startgane button and you are not in the game
			inLobby = false;
			pubnub.state({
				channel: "testChannel14",
				state: {
					inGame: true
				},
				callback: function(m){console.log(m.inGame);}
			});
		}
		else if(!m.data.inGame && !inLobby){
			inLobby = true;
			pubnub.state({
				channel: "testChannel14",
				state: {
					inGame: false
				},
				callback: function(m){console.log(m.inGame);}
			});
			pub("endGameChannel",[$("#usernameInput").val(),getLetterAmount(),words]);
		}
	}
	noOfPlayers.html(m.occupancy + (m.occupancy === 1 ? " player" : " players"));	
}






























function handleMessage(message){
	"use strict";
	notificationUl.append("<li>"+message+"</li>");
}

function pub(channel, message){
	"use strict";
	pubnub.publish({
		channel: channel,
		message: message
	});
}

function generateRandomLetters(array,noOfElementsNeeded){ //noOfElementsNeeded = 3 or 4
		"use strict";
		var usedLetters = [];
		var successCount = 0;
		while(successCount < noOfElementsNeeded){
			var letter = array[Math.floor(Math.random()*array.length)];
			var successful = usedLetters.indexOf(letter) === -1; //boolean, checks if the generated letter has been generated before
			if(successful){
				usedLetters.push(letter);
				successCount++;
			}
		}
		return usedLetters;
}

function duplicateLetter(letter){
	"use strict";
	if((confirmWord.text()).indexOf(letter) > -1){
		return true;	
	}
	else {
		return false;
	}
}

function wordLengthAboveTwo(){
	"use strict";
	if((confirmWord.text()).length < 3){
		return false;
	} else {
		return true;
	}
}

function repeatWords(){
	"use strict";
	if(submittedWordsArray.indexOf(confirmWord.text()) === -1){
		return false;
	} else {
		return true;	
	}
}

$(document).on('click', 'ul li button', function(){
	"use strict";
	if(inLobby){
		error.text("The buttons don't work.");
	} 
	else {
		var letter = $(this).text();
		if(duplicateLetter(letter)){
			error.text("You cannot use the same letter twice in a word.");
		}
		else {
			confirmWord.append(letter);
		}
	}
});

confirmBtn.click(function(){
	"use strict";
	if(wordLengthAboveTwo()){
		if(!repeatWords()){
			if(noOfWordsInRow === 5){
				$("#tableOfSubmittedWords").append("<tr><td><p>"+confirmWord.text()+"</p></td></tr>");
				noOfWordsInRow++;
				noOfWordsInRow = 1;
			} else {
				$("#tableOfSubmittedWords tr:last").append("<td><p>"+confirmWord.text()+"</p></td>");
				noOfWordsInRow++;
			}
			submittedWordsArray.push(confirmWord.text());
			confirmWord.text('');
			error.text('');
		} else {
			error.text("You cannot submit two of the same word.");
		}
	} else {
		error.text("Your word has to be above two letters in length.");
	}
});

$(document).on('click', 'p#word', function(){
	"use strict";
	confirmWord.text('');
});

pubnub.subscribe({
	channel: "testChannel14",
	presence: presence,
	message: handleMessage,
	state: {
		inGame:false
	}
}); //"normal" (presence and if there was chat)

pubnub.subscribe({
	channel: "letters",
	message: handleLetters
}); //for handling start of game

pubnub.subscribe({
	channel: "endGameChannel",
	message: decideWinner
});

function logArrayContents(array){ //for testing
	"use strict";
	for(var i=0;i<array.length;i++){
		console.log(array[i]);
	}
}

/*function getLargestArray(array1, array2){ //returns array with 1 element being larger
	"use strict";
	if(array1.length > array2.length){
		return [array1,array2];
	}
	else{
		return [array2,array1]; //this will work if they are the same length
	}
}*/