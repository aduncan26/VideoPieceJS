var scope = this;
var url1 = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=Stack%20Overflow";
            
function createCORSRequest(method, url) {
    console.log("Calling function");
    var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
          console.log("credentials");
        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

      } else if (typeof XDomainRequest != "undefined") {
        console.log("We should get in here");
        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

      } else {
        // Otherwise, CORS is not supported by the browser.
        xhr = null;
                          console.log("heyo");

      }

    return xhr;
}

//var xhr = new createCORSRequest('GET', url1);
//if (!xhr) {
//  throw new Error('CORS not supported');
//}

//xhr.send();

//xhr.onload = function() {
//    var responseText = xhr.responseText;
//    message = responseText;
//    console.log(responseText);
// // process the response.
//};

//xhr.onerror = function() {
//  console.log('There was an error!');
//};



var message = "Users of Stack Overflow can earn reputation points and \"badges\"; for example, a person is awarded 10 reputation points for receiving an \"up\" vote on an answer given to a question, and can receive badges for their valued contributions, which represents a kind of gamification of the traditional Q&A site. All user-generated content is licensed under a Creative Commons Attribute-ShareAlike license.\nClosing questions is a main differentiation from Yahoo! Answers and a way to prevent low quality questions.";
var msg = new SpeechSynthesisUtterance(scope.message);
var voices = window.speechSynthesis.getVoices();
msg.voice = voices[10]; // Note: some voices don't support altering params
//            msg.voiceURI = 'native';
msg.volume = 1; // 0 to 1
msg.rate = 1; // 0.1 to 10
msg.pitch = 1; //0 to 2
//            msg.text = 'Hello World';
msg.lang = 'en-US';

msg.onend = function(e) {
  console.log('Finished in ' + event.elapsedTime + ' seconds.');
};

 msg.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Whisper'; })[0];

//window.speechSynthesis.speak(msg);

