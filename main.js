//Javascript document

var username = "";
var channel = "";

$("#form").submit(function(event){

	var items = $(this).serializeArray();
	username = items[0].value;
	channel = items[1].value;
	window.location.replace("baiec.github.io/word-game/index1.html");
	event.preventDefault();

});

