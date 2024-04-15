var clientId = 'e385e97bbf0c45b2a800391010d7d594';
var clientSecret = '574cc1ada15544f78f9964403b0bd9be';
var gifImage = $("#currentGif");
var moodsArr = ["happy", "sad", "energetic", "aggressive", "relaxed", "sleepy", "classy", "indifferent"];
var face = true;

// Main function for dropdown menu selection
function GetSelectedTextValue() {
    var selectedText = $("#moodDropdown option:selected").text();
    var selectedValue = $("#moodDropdown option:selected").val();
    tokenFunction();


    // POST request to spotify asking for an access token
    async function tokenFunction() {
        var result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        var data = await result.json();
        var accessToken = data.access_token;
        getPlaylist(accessToken);
    };

    // GET request to spotify sending my access token and asking for a playlist
    function getPlaylist(accessToken) {
        queryURL = "https://api.spotify.com/v1/playlists/" + selectedValue + "/tracks?offset=0&limit=15";
        $.ajax({
            url: queryURL,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function (data) {
                populateSonglist(data, selectedValue);
            }
        });
    }

    // Fill in songlist table
    function populateSonglist(data, selectedValue) {

        $("#playlistName").text(selectedText.charAt(0).toUpperCase() + selectedText.slice(1));
        $("#spotLink").attr("href", "https://open.spotify.com/playlist/" + selectedValue);
        $("#spotLink").attr("target", "_blank");
        $("#spotLink").text("Listen Now On Spotify!");

        var songList = $("#songList")
        songList.empty();

        for (var i = 0; i < data.items.length; i++) {
            var trackInfo = $("<tr>");

            var songName = $("<td>");
            songName.text(data.items[i].track.name);
            trackInfo.append(songName);

            var songArtist = $("<td>");
            songArtist.text(data.items[i].track.artists[0].name);
            trackInfo.append(songArtist);

            var songAlbum = $("<td>");
            var albumImg = $("<img>");

            if (data.items[i].track.album.images[1]) {
                albumImg.attr("src", data.items[i].track.album.images[1].url)

            } else {
                albumImg.attr("src", "https://placehold.it/550x550")
            }

            songAlbum.append(albumImg);
            trackInfo.append(songAlbum);
            songList.append(trackInfo);
        }
        grabGif();
    }

    // Get and apply the appropriate gif 
    function grabGif() {
        if (selectedText === "Songs Worth Checking Out") {
            gifImage.attr("src", "https://media.giphy.com/media/1cMSWoZlxhO8w/giphy.gif");
        } else {
            var queryURL = "https://api.giphy.com/v1/gifs/random?api_key=GLdAzfFBGkrBeUPV1mQCwztiE7bDfyV5&tag=" + selectedText;

            $.ajax({
                url: queryURL,
                method: "GET"
            })
                .then(function (response) {
                    var imageUrl = response.data.image_original_url;
                    gifImage.attr("src", imageUrl);
                    setHistory(imageUrl);
                });
        }
    }

    // Set mood, date, and gif in local storage
    function setHistory(imageUrl) {
        var oldMoods = JSON.parse(localStorage.getItem('moodsArray')) || [];

        var moodStorage = {
            name: selectedText,
            gif: imageUrl,
            timeStamp: moment().format('MMMM Do YYYY, h:mm a')
        };

        oldMoods.unshift(moodStorage);
        localStorage.setItem('moodsArray', JSON.stringify(oldMoods));
    }

    // Voice recognition functionality
    function listenForSpeech() {
        var speechRecognition = window.webkitSpeechRecognition;
        var recognition = new speechRecognition();

        $(".micBtn").click(function (event) {
            recognition.start();
        })

        // Indicate that it is recording by changing the mic button when clicked
        recognition.onstart = function () {
            $(".micBtn").val("Listening");
            $("#micImg").removeClass("fa fa-microphone fa-5x");
            $("#micImg").addClass("fa fa-microphone-slash fa-5x")
            console.log("listening");
        }

        // Indicate that it is finished redcording by changing the mic button back
        recognition.onspeechend = function () {
            $(".micBtn").val("Submit");
            $("#micImg").removeClass("fa fa-microphone-slash fa-5x")
            $("#micImg").addClass("fa fa-microphone fa-5x");
            console.log("ended");
        }

        // Recognize the mood spoken and submit it or throw an error
        recognition.onresult = function (event) {
            var current = event.resultIndex;

            var transcript = event.results[current][0].transcript;
            selectedText = transcript;
            selectedValue = $("#" + transcript).val();

            if (moodsArr.includes(selectedText)) {
                tokenFunction(selectedText);
            } else {
                console.log("Please Try Again!");
            }
        }
    }
    listenForSpeech();
    console.log("Secret Message: 41736961204b656c6c7920476f6e6520627574206e6f7420666f72676f7474656e2e2e2e0a5765276c6c206e657665722073746f7020736561726368696e6720666f7220796f7520717565656e")

    // Keep the click event from being applied multiple times
    if (face) {
        $(".modalBtn").click(function () {
            faceRecog();
        })
    }
    face = false;

    // Face expression recognition
    function faceRecog() {
        var alreadyRan = false;
        var video = document.getElementById('video');

        // Load the models needed to find a face and read its facial expressions
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]).then(startVideo)

        // Start the video streaming inside the modal
        function startVideo() {
            navigator.getUserMedia(
                { video: {} },
                stream => video.srcObject = stream,
                err => console.error(err)
            )
        }

        // When the video starts playing get ready to detect the expression from the video
        video.addEventListener('play', () => {
            var canvas = faceapi.createCanvasFromMedia(video);
            var displaySize = { width: video.width, height: video.height };
            faceapi.matchDimensions(canvas, displaySize);

            // Detect expression when clicked
            var button = document.getElementById("button");
            button.addEventListener("click", detectMood);

            async function detectMood() {
                
                // Make sure it doesnt run multiple times
                if (alreadyRan) {
                    return;
                } else {

                    // Pause the video and let the user know it's detecting
                    var pleaseWait = $("#waiting");
                    pleaseWait.text("Please Wait...");
                    video.pause();
                    alreadyRan = true
                    
                    // get most pronounced expression and assign it to a mood
                    var detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                    var mostMood = Object.keys(detections.expressions).reduce(function (a, b) { return detections.expressions[a] > detections.expressions[b] ? a : b });
                    pleaseWait.text("Your mood: " + mostMood)
                    if (mostMood === "angry") {
                        selectedText = "aggressive"
                    } else if (mostMood === "neutral") {
                        selectedText = "indifferent"
                    } else if (mostMood === "disgusted") {
                        selectedText = "classy"
                    } else if (mostMood === "surprised") {
                        selectedText = "energetic"
                    }
                    else {
                        selectedText = mostMood;
                    }

                    // Stop the camera
                    var mediaStream = video.srcObject;
                    var tracks = mediaStream.getTracks();
                    tracks.forEach(track => track.stop());

                    // Add the mood text and submit it
                    pleaseWait.text("Your mood: " + selectedText);
                    selectedValue = $("#" + selectedText).val();
                    console.log(selectedText);
                    tokenFunction(selectedText);
                };
            }
        })
    }
};
GetSelectedTextValue();