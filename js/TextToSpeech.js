var scope = this;
            
var queryTerm = 'Oak';
var getUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&indexpageids=&titles=' + queryTerm;
            
var msg;

var jsonText;
$.ajax({
    url: getUrl,

    // The name of the callback parameter, as specified by the YQL service
    jsonp: "callback",

    // Tell jQuery we're expecting JSONP
    dataType: "jsonp",

    // Tell YQL what we want and that we want JSON
    data: {
        q: "select title,abstract,url from search.news where query=\"cat\"",
        format: "json"
    },

    // Work with the response
    success: function( response ) {
        onAjaxComplete(response);
    }
});

var onAjaxComplete = function(response){
    var jsonArray = $.map(response, function(el) { return el });
    
    var jsonParsed = jsonArray[2].pageids[0];
    
    jsonText = jsonArray[2].pages[jsonParsed].extract;
    
    var glitchText = "";
    
    var wordIndex;
        
    for(wordIndex = 0; wordIndex < 4; wordIndex++){
        if(jsonText[wordIndex] !== ' '){
            glitchText += jsonText[wordIndex];
        } else{
            break;
        }
    }
    
    var glitch = "";
    
    var length = 2 + Math.floor(Math.random() * 6);
    
    for(var i = 0; i < length; i++){
        glitch += glitchText;
    }
    
    console.log(glitch);
        
    msg = new SpeechSynthesisUtterance(glitch + jsonText);
    //msg.pitch = 1.8; // 0 to 2
    //msg.volume = 1; // 0 to 1
    //msg.rate = 1; // 0.1 to 10

    msg.volume = 1;
//    window.speechSynthesis.speak(msg);
};

//var voices = window.speechSynthesis.getVoices();
//msg.voice = voices[10]; // Note: some voices don't support altering params
////            msg.voiceURI = 'native';
//msg.volume = 1; // 0 to 1
//msg.rate = 1; // 0.1 to 10
//msg.pitch = 1; //0 to 2
////            msg.text = 'Hello World';
//msg.lang = 'en-US';
//
//msg.onend = function(e) {
//  console.log('Finished in ' + event.elapsedTime + ' seconds.');
//};
//
// msg.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Whisper'; })[0];
//

