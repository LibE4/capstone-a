"use strict";

app.controller("SuperTttCtrl", function($scope, $rootScope, $routeParams, $location, tttRoomFactory, UserFactory){
    var thisPlayer = $rootScope.user.username;
    $rootScope.superTtt = {};
    $rootScope.superTtt.newRoom = {};
    $rootScope.superTtt.newRoom.profile = {};
    $rootScope.superTtt.newRoom.profile.players = {};
    $rootScope.superTtt.newRoom.gameStatus = {};
    $rootScope.superTtt.newRoom.gameStatus.clearTable = false;
    $rootScope.superTtt.newRoom.gameStatus.initGame = false;
    $rootScope.superTtt.newRoom.gameStatus.gameOn = false;
    $rootScope.superTtt.newRoom.gameStatus.nGrids = 0;
    $rootScope.superTtt.newRoom.gameStatus.nSymbols = 0;
    $rootScope.superTtt.newRoom.gameData = {};
    $rootScope.superTtt.newRoom.gameData.id = "";
    $rootScope.superTtt.newRoom.gameData.player = "";
    $rootScope.superTtt.rooms = {};
    $rootScope.superTtt.isRoomSet = false; // for show/hide room setup page
    $rootScope.superTtt.isRoomAvailable = true;
    $rootScope.superTtt.Players = {};
    var roomId = "";
    var roomRef;
    var numPlayers = 0;
    $rootScope.superTtt.newRoom.messages = {};
    $rootScope.superTtt.roomMsgs = [];
    $rootScope.superTtt.newRoom.gameStatus.gameOn = false;
    $rootScope.superTtt.standOn = false;
    var n = $scope.nGrids;
    var m = $scope.nSymbols;
    var userHand = {};
    var rivalHand = {};

    // get room list
    $scope.getRooms = function(){
        tttRoomFactory.getRooms().then((response) => {
            $rootScope.superTtt.rooms = response;
            console.log("rooms response", response);
        });
    };

    //ttt room setup
    $scope.createNewRoom = function(){
        $rootScope.superTtt.newRoom.profile.minPlayerInRoom = 0;
        $rootScope.superTtt.newRoom.profile.players[thisPlayer] = thisPlayer;
        tttRoomFactory.postNewRoom($rootScope.superTtt.newRoom).then(function(response){
            roomId = response.name;
            $rootScope.superTtt.isRoomSet = true; 
            sendMsg("SYSTEM", thisPlayer + " created the game!");
            roomRef = firebase.database().ref(`tttRooms/${roomId}`);
            roomRef.off();
            roomRef.on('child_added', setRealtimeData);
            roomRef.on('child_changed', setRealtimeData);
        });
    };

    $scope.joinRoom = function(roomIdDOM){
        roomId = roomIdDOM;
          // console.log("roomId", roomId);
        $rootScope.user.roomid = roomId;
        tttRoomFactory.getProfileInRoom(roomId).then(function(roomProfile){
            if (Object.keys(roomProfile.players).length >= 2){
                $rootScope.superTtt.isRoomAvailable = false;
            } else {
                $rootScope.superTtt.newRoom.profile = roomProfile;
                $rootScope.superTtt.newRoom.profile.players[thisPlayer] = thisPlayer;
                tttRoomFactory.editPlayerList(roomId, $rootScope.superTtt.newRoom.profile.players).then(function(){
                    sendMsg("SYSTEM", thisPlayer + " joined the game!");
                    $rootScope.superTtt.isRoomSet = true; 
                    // Reference to the /messages/ database path.
                    roomRef = firebase.database().ref(`tttRooms/${roomId}`);
                    roomRef.off();
                    roomRef.on('child_added', setRealtimeData);
                    roomRef.on('child_changed', setRealtimeData);
                });
            }
        });
    };

    $scope.leaveRoom = function(){
        $rootScope.superTtt.isRoomSet = false; 
        numPlayers--;
        console.log("numPlayers", numPlayers);
        console.log("minPlayerInRoom", $rootScope.superTtt.newRoom.profile.minPlayerInRoom);
        if (numPlayers === $rootScope.superTtt.newRoom.profile.minPlayerInRoom){
            // no player in room
            tttRoomFactory.deleteRoom(roomId).then(function(){
                $rootScope.superTtt.newRoom.profile.players = {};
            });
        } else {
            delete $rootScope.superTtt.newRoom.profile.players[thisPlayer];
            tttRoomFactory.editPlayerList(roomId, $rootScope.superTtt.newRoom.profile.players).then(function(){
                sendMsg("SYSTEM", thisPlayer + " left the game!");
                $rootScope.superTtt.newRoom.profile.players = {};
                $scope.resetGame();
                $scope.getRooms();
            });
        }        
    };

    // to sync cards, players in same room
    var setRealtimeData = function(data1, data2) {
        // console.log("data1", data1.val());
        let dataFB = data1.val();
        if (dataFB.hasOwnProperty("initGame")) {
            $rootScope.superTtt.newRoom.gameStatus = dataFB;
            if (dataFB.initGame){
                createGame(dataFB.nGrids);
            }
        } else if (dataFB.hasOwnProperty("id")) {
            if (dataFB.id !== ""){
                showContent(dataFB);
            }
        } else if (dataFB.hasOwnProperty("text")) {
            $rootScope.superTtt.roomMsgs.push(dataFB);
        } else if (dataFB.hasOwnProperty("roomName")) {
            setPlayers(dataFB);
            $scope.getRooms(); //update room info
        }

        $rootScope.$apply();
    };

    // process events
    $scope.handleEvents = function(){
        // console.log("target", event.target.id);
        if (event.target.innerHTML === "") {
            $rootScope.superTtt.newRoom.gameData = { id: event.target.id, player: thisPlayer };
            tttRoomFactory.editGameData(roomId, $rootScope.superTtt.newRoom.gameData).then(function(){});
        }
    };

    // to create grids
    $scope.initGame = function() {
        $rootScope.superTtt.newRoom.gameStatus.initGame = true;
        $rootScope.superTtt.newRoom.gameStatus.gameOn = true;
        $rootScope.superTtt.newRoom.gameStatus.nGrids = $scope.nGrids;
        $rootScope.superTtt.newRoom.gameStatus.nSymbols = $scope.nSymbols;
        sendMsg("SYSTEM", thisPlayer + ` initiated a game of ${$scope.nGrids} grids and win by ${$scope.nSymbols} symbols in a row!`);
        tttRoomFactory.editGameStatus(roomId, $rootScope.superTtt.newRoom.gameStatus).then(function(){});
    };

    var createGame = function(n) {
        while (displayElement.childNodes[1]) {
          displayElement.removeChild(displayElement.childNodes[1]);
        }
        for (let i = 1, gridSize = 95 / n; i <= n * n; i++) {
            let productElement = document.createElement("div");
            productElement.style.width = gridSize + "%";
            productElement.style.height = gridSize + "%";
            productElement.setAttribute("id", `grid-${i}`);
            productElement.className = "blocks";
            displayElement.appendChild(productElement);
        }
        $scope.resetGame();
    };

    let displayElement = document.getElementById("ttt");
    let buttonCreateGame = document.getElementById("createGame");

    // to type in the grids
    function showContent(dataFB) {
        let targetEmt = document.getElementById(dataFB.id);
        if (thisPlayer === dataFB.player) {
            targetEmt.innerHTML = "x";
            targetEmt.style.color = "red";
            targetEmt.style.fontSize = "xx-large";
            checkStatus(dataFB.id, "x");
            // player = "o";
        } else {
            targetEmt.innerHTML = "o";
            targetEmt.style.color = "blue";
            targetEmt.style.fontSize = "xx-large";
            checkStatus(dataFB.id, "o");
            // player = "x";
        }
    }

    function checkStatus(elementId, c) {
        //get index of current item
        let blockIndex = parseInt(elementId.match(/\d+/g)[0]);
        // while( (element = element.previousSibling) !== null ) {
        //   blockIndex++; // from now blockIndex contains the index.
        // }
        n = $rootScope.superTtt.newRoom.gameStatus.nGrids;
        m = $rootScope.superTtt.newRoom.gameStatus.nSymbols;
        let arr = [];
        let x=0, y=0;
        // while ((blockIndex - n) >0){
        //     y += 1;
        //     blockIndex -= n;
        // }
        // x = blockIndex;
        for(let i = 0; i < n; i++){
            arr[i] = [];    
            for(let j = 0; j < n; j++){ 
                arr[i][j] = i * n + j + 1;
                if (arr[i][j] === blockIndex) {
                    x = i;
                    y = j;
        console.log("check win", blockIndex, c ,x,y);
                }
            }    
        }
        // check row
        for(let j = y - (m - 1) , flag = 0; j <= y + (m - 1) ; j++){
            if (j < 0 || j >= n || document.getElementById("grid-" + arr[x][j]).innerHTML != c) {
                flag = 0;
                continue;
            }
            if (document.getElementById("grid-" + arr[x][j]).innerHTML === c) {
                flag += 1;
            }   
            if (flag === m) {
                winner(c);
            }
        }
        // check colunm
        for(let i = x - (m - 1) , flag = 0; i <= x + (m - 1) ; i++){
            if (i < 0 || i >= n || document.getElementById("grid-" + arr[i][y]).innerHTML != c) {
                flag = 0;
                continue;
            }
            if (document.getElementById("grid-" + arr[i][y]).innerHTML === c) {
                flag += 1;
            }   
            if (flag === m) {
                winner(c);
            }
        }

        // check cross backslash
        for(let i = x - (m - 1) , j = y - (m - 1) , flag = 0; i <= x + (m - 1) ; i++, j++){
            if (i < 0 || i >= n || j < 0 || j >= n || document.getElementById("grid-" + arr[i][j]).innerHTML != c) {
                flag = 0;
                continue;
            }
            if (document.getElementById("grid-" + arr[i][j]).innerHTML === c) {
                flag += 1;
            }   
            if (flag === m) {
                winner(c);
            }
        }
        // check cross slash
        for(let i = x + (m - 1) , j = y - (m - 1) , flag = 0; j <= y + (m - 1) ; i--, j++){
            if (i < 0 || i >= n || j < 0 || j >= n || document.getElementById("grid-" + arr[i][j]).innerHTML != c) {
                flag = 0;
                continue;
            }
            if (document.getElementById("grid-" + arr[i][j]).innerHTML === c) {
                flag += 1;
            }   
            if (flag === m) {
                winner(c);
            }
        }   
        // check tie
        for (let i = 1; i <= n * n; i++) {
            if (document.getElementById("grid-" + i).innerHTML === "") {
                break;
            }
            if (i === n * n ) {
                $rootScope.superTtt.outcome = "Game over. It's a tie!";   
                stopGame();
            }
        }               
    }

    function winner(c){
        if (c === "o") {
            stopGame();
            $rootScope.superTtt.outcome = `Congradulations! Player ${rivalHand} just made the last move to win.`;    
        }
        else {
            stopGame();
            $rootScope.superTtt.outcome = `Congradulations! Player ${thisPlayer} just made the last move to win.`;    
        }
    }

    function stopGame() {
        // for (let i = 1; i <= n * n; i++) {
        //     displayElement.childNodes[i].removeEventListener("click", showContent);
        // }               
    }

    $scope.resetGame = function() {
        for (let i = 1; i <= n * n; i++) {
            document.getElementById("grid-" + i).innerHTML = "";
        }
        $rootScope.superTtt.outcome = "";    
        $rootScope.superTtt.newRoom.gameData.id = "";
        $rootScope.superTtt.newRoom.gameData.player = "";
        tttRoomFactory.editGameData(roomId, $rootScope.superTtt.newRoom.gameData).then(function(){});
        $rootScope.$apply();

    };

    $scope.send = function(){
        event.preventDefault();
        sendMsg(thisPlayer, $rootScope.superTtt.newRoom.messages.msgText);
    };

    var sendMsg = function(senderName, msgText){
        let Msg = {
            name: senderName,
            text: msgText,
            time: new Date(Date.now())
        };
        tttRoomFactory.postMsgInRoom(roomId, Msg).then(function(){
            $rootScope.superTtt.newRoom.messages.msgText = "";
        });
    };

    var setPlayers = function (dataFB){
        // get player list
        numPlayers = Object.keys(dataFB.players).length;
        $rootScope.superTtt.newRoom.profile.players = dataFB.players;
        for (let player in dataFB.players) {
            if (!$rootScope.superTtt.Players.hasOwnProperty(player)) {
                $rootScope.superTtt.Players[player] = player;
                if (player === thisPlayer) userHand = $rootScope.superTtt.Players[player];
                else rivalHand = $rootScope.superTtt.Players[player];
            }
        }
    };
});
