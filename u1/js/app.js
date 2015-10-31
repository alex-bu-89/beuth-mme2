document.addEventListener("DOMContentLoaded", function(event) {
    init();
});

/*
*   init function
*/
function init(){
    var players = document.getElementsByTagName("video");
    addControlElements(players);
    addButtonEvents(players);
    toggleContentView();
    addMobileMenu();
}

/*
 *   adds control bar(play, pause etc.) after <video> tag
 *   players - object, contains all the <video>'s
 */
function addControlElements(players){
    for(var player in players) {
        if (players.hasOwnProperty(player)) {
            var p = players[player];
            p.controls = false;
            var htmlStr = "<div class='controlElement'>" +
                        "<div class='playPause play-icon'></div>" +
                        "<div class='stop stop-icon'></div>" +
                        "<div class='mute muteOff-icon'></div>" +
                        "<input type=\"range\" class=\"volume-bar\" min=\"0\" max=\"1\" step=\"0.1\" value=\"1\">" +
                    "</div>";
            insertHtmlStringAfter(htmlStr, p);
        }
    }
}

/*
 *   inserts html string in DOM
 *   htmlStr - html string
 *   targetElement - inserts string after that element
 */
function insertHtmlStringAfter(htmlStr,targetElement) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    frag.appendChild(temp.firstChild);
    var parent = targetElement.parentNode;
    parent.insertBefore(frag, targetElement.nextSibling);
}

/*
 *   adds events for all buttons of all players
 *   players - players - object, contains all the <video>'s
 */
function addButtonEvents(players){
    for(var player in players) {
        if (players.hasOwnProperty(player)) {
            var controll = players[player].nextElementSibling;
            var play = controll.getElementsByClassName("playPause")[0];
            var stop = controll.getElementsByClassName("stop")[0];
            var mute = controll.getElementsByClassName("mute")[0];
            var volumeBar = controll.getElementsByClassName("volume-bar")[0];
            play.addEventListener("click", function(){ playPouseVideo(this) });
            stop.addEventListener("click", function(){ stopVideo(this); });
            mute.addEventListener("click", function(){ muteVideo(this); });
            volumeBar.addEventListener("input", function(){ changeVolume(this); });
            //volumeBar.addEventListener("change", function(){ changeVolume(this); });
        }
    }
}

/*
 *   starts and stops (play/pause) the video, toggles play/pause icon
 *   button - button that was clicked
 */
function playPouseVideo(button){
    var player = button.parentElement.previousSibling;
    if (player.paused == true) {
        // Play the video
        button.classList.remove('play-icon');
        button.classList.add('pause-icon');
        player.play();
    } else {
        // Pause the video
        button.classList.remove('pause-icon');
        button.classList.add('play-icon');
        player.pause();
    }
}

/*
 *   stops the video, sets current video time to 0
 *   button - button that was clicked
 */
function stopVideo(button){
    var player = button.parentElement.previousSibling;
    player.pause();
    player.currentTime = 0;
}

/*
 *   makes a sound equal to zero
 *   button - button that was clicked
 */
function muteVideo(button){
    var player = button.parentElement.previousSibling;
    if (player.muted == false) {
        player.muted = true;
        button.classList.remove('muteOff-icon');
        button.classList.add('muteOn-icon');
    } else {
        player.muted = false;
        button.classList.remove('muteOn-icon');
        button.classList.add('muteOff-icon');
    }
}

/*
 *   changes volume
 *   button - input[range]
 */
function changeVolume(button){
    var player = button.parentElement.previousSibling;
    player.volume = button.value;
}

/*
 *   toggles list and grid view
 */
function toggleContentView(){
    var listButton = document.getElementById("sort-list");
    var gridButton = document.getElementById("sort-grid");
    listButton.addEventListener("click", function(){
        document.getElementsByClassName("content")[0].classList.remove('grid');
        document.getElementsByClassName("content")[0].classList.add('list');
        console.log(listButton);
        listButton.classList.add('current');
        gridButton.classList.remove('current');
    });
    gridButton.addEventListener("click", function(){
        document.getElementsByClassName("content")[0].classList.remove('list');
        document.getElementsByClassName("content")[0].classList.add('grid');
        listButton.classList.remove('current');
        gridButton.classList.add('current');
    });
}

/*
 *   adds event for mobile menu
 */
function addMobileMenu(){
    var mobileMenuButton = document.getElementById("mobile-menu");
    mobileMenuButton.addEventListener("click", function(){
        var leftMenu =  document.getElementsByClassName("sidebar")[0];
        leftMenu.classList.toggle("show-menu");
    });
}