"use strict";

app.controller("SuperTttCtrl", function($scope, $rootScope, tttRoomFactory, UserFactory){
    var thisPlayer, roomId, roomRef, numPlayers, n, m, gameCreator;
    var initVariables = function(){
        thisPlayer = $rootScope.user.username;
        gameCreator = "";
        roomId = "";
        roomRef = "";
        numPlayers = 0;
        n = 0;
        m = 0;
        $scope.nGrids = 15;
        $scope.nSymbols = 4;
        $scope.userHand = "";
        $scope.rivalHand = "";
        $scope.lastCheckedBy = "";
        $rootScope.superTtt = {};
        $rootScope.superTtt.newRoom = {};
        $rootScope.superTtt.newRoom.profile = {};
        $rootScope.superTtt.newRoom.profile.players = {};
        $rootScope.superTtt.newRoom.profile.initGame = false;
        $rootScope.superTtt.newRoom.profile.gameOn = false;
        $rootScope.superTtt.newRoom.profile.nGrids = 0;
        $rootScope.superTtt.newRoom.profile.nSymbols = 0;
        $rootScope.superTtt.newRoom.profile.minPlayerInRoom = 0;
        $rootScope.superTtt.newRoom.gameStatus = {};
        $rootScope.superTtt.newRoom.gameStatus.resetFlag = false;
        $rootScope.superTtt.newRoom.gameData = {};
        $rootScope.superTtt.newRoom.gameData.id = "";
        $rootScope.superTtt.newRoom.gameData.player = "";
        $rootScope.superTtt.rooms = {};
        $rootScope.superTtt.isRoomSet = false; // for show/hide room setup page
        $rootScope.superTtt.isRoomAvailable = true;
        $rootScope.superTtt.Players = {};
        $rootScope.superTtt.newRoom.messages = {};
        $rootScope.superTtt.roomMsgs = [];
    };
    initVariables();

    // get room list
    $scope.getRooms = function(){
        tttRoomFactory.getRooms().then((response) => {
            $rootScope.superTtt.rooms = response;
        });
    };

    var setRoomListener = function(roomId){
        roomRef = firebase.database().ref(`tttRooms/${roomId}`);
        roomRef.off();
        roomRef.on('child_added', setRealtimeData);
        roomRef.on('child_changed', setRealtimeData);
    };

    //ttt room setup
    $scope.createNewRoom = function(){
        initGame();
        n = $rootScope.superTtt.newRoom.profile.nGrids;
        m = $rootScope.superTtt.newRoom.profile.nSymbols;
        tttRoomFactory.postNewRoom($rootScope.superTtt.newRoom).then(function(response){
            $rootScope.superTtt.isRoomSet = true;
            roomId = response.name;
            $scope.lastCheckedBy = thisPlayer;
            gameCreator = thisPlayer;
            createGame(n);
            sendMsg("SYSTEM", thisPlayer + " created the game!");
            setRoomListener(roomId);
        });
    };

    $scope.joinRoom = function(roomIdDOM){
        roomId = roomIdDOM;
        tttRoomFactory.getProfileInRoom(roomId).then(function(roomProfile){
            if (Object.keys(roomProfile.players).length >= 2){
                $rootScope.superTtt.isRoomAvailable = false;
            } else {
                tttRoomFactory.editGameStatus(roomId, $rootScope.superTtt.newRoom.gameStatus); // to assure gameStatus
                $rootScope.superTtt.newRoom.profile = roomProfile;
                $rootScope.superTtt.newRoom.profile.players[thisPlayer] = thisPlayer;
                tttRoomFactory.editPlayerList(roomId, $rootScope.superTtt.newRoom.profile.players).then(function(){
                    $rootScope.superTtt.isRoomSet = true; 
                    n = roomProfile.nGrids;
                    m = roomProfile.nSymbols;
                    createGame(n);
                    sendMsg("SYSTEM", thisPlayer + " joined the game!");
                    setRoomListener(roomId);
                });
            }
        });
    };

    var cleanUp = function(){
        initVariables();
        displayElement.innerHTML = "";
        $scope.getRooms();
    };

    $scope.leaveRoom = function(){
        $rootScope.superTtt.isRoomSet = false; 
        numPlayers--;
        if (numPlayers === $rootScope.superTtt.newRoom.profile.minPlayerInRoom){
            // no player in room
            tttRoomFactory.deleteRoom(roomId).then(function(){
                roomRef.off();
                cleanUp();
            });
        } else {
            sendMsg("SYSTEM", thisPlayer + " left the game!");
            $scope.initResetGame();
            delete $rootScope.superTtt.newRoom.profile.players[thisPlayer];
            tttRoomFactory.editPlayerList(roomId, $rootScope.superTtt.newRoom.profile.players).then(function(){
                roomRef.off();
                cleanUp();
            });
        }        
    };

    // to sync cards, players in same room
    var setRealtimeData = function(data1, data2) {
        let dataFB = data1.val();
        if (dataFB.hasOwnProperty("resetFlag")) {
            if (dataFB.resetFlag){
                resetGame();
            }
        } else if (dataFB.hasOwnProperty("id")) {
            if (dataFB.id !== ""){
                $scope.lastCheckedBy = dataFB.player;
                showContent(dataFB);
            }
        } else if (dataFB.hasOwnProperty("text")) {
            $rootScope.superTtt.roomMsgs.push(dataFB);
        } else if (dataFB.hasOwnProperty("roomName")) {
            setPlayers(dataFB);
        }

        $rootScope.$apply();
    };

    // process events
    $scope.handleEvents = function(){
        if (event.target.innerHTML === "" && $scope.lastCheckedBy !== thisPlayer) {
            $rootScope.superTtt.newRoom.gameData = { id: event.target.id, player: thisPlayer };
            tttRoomFactory.editGameData(roomId, $rootScope.superTtt.newRoom.gameData).then(function(){});
        }
    };

    // to create grids
    var initGame = function() {
        $rootScope.superTtt.newRoom.profile.players[thisPlayer] = thisPlayer;
        $rootScope.superTtt.newRoom.profile.initGame = true;
        $rootScope.superTtt.newRoom.profile.gameOn = true;
        $rootScope.superTtt.newRoom.profile.nGrids = $scope.nGrids;
        $rootScope.superTtt.newRoom.profile.nSymbols = $scope.nSymbols;
    };

    let displayElement = document.getElementById("ttt");

    var createGame = function(n) {
        displayElement.innerHTML = "";
        for (let i = 1, gridSize = 96 / n; i <= n * n; i++) {
            let productElement = document.createElement("div");
            productElement.style.width = gridSize + "%";
            productElement.style.height = gridSize + "%";
            productElement.setAttribute("id", `grid-${i}`);
            productElement.className = "blocks";
            displayElement.appendChild(productElement);
        }
    };

    // to type in the grids
    function showContent(dataFB) {
        let targetEmt = document.getElementById(dataFB.id);
        if (thisPlayer === dataFB.player) {
            targetEmt.innerHTML = "x";
            targetEmt.style.color = "black";
            targetEmt.style.backgroundColor = "black";
            checkStatus(dataFB.id, "x");
        } else {
            targetEmt.innerHTML = "o";
            targetEmt.style.color = "white";
            targetEmt.style.backgroundColor = "white";
            checkStatus(dataFB.id, "o");
        }
    }

    function checkStatus(elementId, c) {
        //get index of current item
        let blockIndex = parseInt(elementId.match(/\d+/g)[0]);
        n = $rootScope.superTtt.newRoom.profile.nGrids;
        m = $rootScope.superTtt.newRoom.profile.nSymbols;
        let arr = [];
        let x=0, y=0;
        for(let i = 0; i < n; i++){
            arr[i] = [];    
            for(let j = 0; j < n; j++){ 
                arr[i][j] = i * n + j + 1;
                if (arr[i][j] === blockIndex) {
                    x = i;
                    y = j;
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
            $rootScope.superTtt.outcome = `Congradulations! Player ${$scope.rivalHand} just made the last move to win.`;    
            $rootScope.user.sgLosses++;
            UserFactory.editUser($rootScope.user);
        }
        else {
            stopGame();
            $rootScope.superTtt.outcome = `Congradulations! Player ${thisPlayer} just made the last move to win.`;    
            $rootScope.user.sgWins++;
            UserFactory.editUser($rootScope.user);
        }
    }

    function stopGame() {
        $scope.lastCheckedBy = thisPlayer;               
    }

    $scope.initResetGame = function() {
        $rootScope.superTtt.newRoom.gameStatus.resetFlag = true;
        $rootScope.superTtt.newRoom.gameData.id = "";
        $rootScope.superTtt.newRoom.gameData.player = "";
        tttRoomFactory.editRoom(roomId, $rootScope.superTtt.newRoom).then(function(){
            $rootScope.superTtt.newRoom.gameStatus.resetFlag = false;
            tttRoomFactory.editRoom(roomId, $rootScope.superTtt.newRoom).then(function(){});
        });
    };

    var resetGame = function() {
        for (let i = 1; i <= n * n; i++) {
            document.getElementById("grid-" + i).innerHTML = "";
            document.getElementById("grid-" + i).style.backgroundColor = "";
        }
        $scope.lastCheckedBy = gameCreator;    
        $rootScope.superTtt.outcome = "";    
        $rootScope.superTtt.newRoom.gameData.id = "";
        $rootScope.superTtt.newRoom.gameData.player = "";
        $rootScope.superTtt.roomMsgs = [];
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
                if (player === thisPlayer) $scope.userHand = $rootScope.superTtt.Players[player];
                else $scope.rivalHand = $rootScope.superTtt.Players[player];
            }
        }
    }; 
});
