"use strict";

app.service("RoomService", function($rootScope, CardFactory, RoomFactory, UserFactory, ResultService){
    var thisPlayer = $rootScope.user.username;
    $rootScope.blackJack.newRoom = {};
    $rootScope.blackJack.newRoom.profile = {};
    $rootScope.blackJack.newRoom.gameStatus = {};
    $rootScope.blackJack.newRoom.gameStatus.clearTable = false;
    $rootScope.blackJack.newRoom.gameStatus.isCardShow = false;
    $rootScope.blackJack.newRoom.gameStatus.numPlayerStand = 0;
    $rootScope.blackJack.newRoom.profile.players = {};
    $rootScope.blackJack.rooms = {};
    $rootScope.blackJack.isRoomSet = false; // for show/hide room setup page
    $rootScope.blackJack.isRoomAvailable = true;
    $rootScope.blackJack.Players = {};
    $rootScope.blackJack.bet = 0;
    var that = this;
    var roomId = "";
    var roomRef;
    var numPlayers = 0;
    var needShuffle = false;
    var holeCardImg = "./buffy.jpg";
    // var holeCardImg = "./winner_logo.png";
    var origCardImg = "";
    var dealerHand = {};
    var userHand = {};
    var rivalHand = {};
    $rootScope.blackJack.newRoom.messages = {};
    $rootScope.blackJack.roomMsgs = [];
    $rootScope.blackJack.newRoom.gameStatus.gameOn = false;
    $rootScope.blackJack.standOn = false;


    // get room list
    this.getRooms = function(){
        RoomFactory.getRooms().then((response) => {
            $rootScope.blackJack.rooms = response;
            console.log("rooms response", response);
        });
    };

    //card room setup
    this.createNewRoom = function(){
        if ($rootScope.blackJack.hasDealer){
            $rootScope.blackJack.newRoom.profile.players.Dealer = "Dealer";
            $rootScope.blackJack.newRoom.profile.minPlayerInRoom = 1;
        } else $rootScope.blackJack.newRoom.profile.minPlayerInRoom = 0;
        $rootScope.blackJack.newRoom.profile.players[thisPlayer] = thisPlayer;
        RoomFactory.postNewRoom($rootScope.blackJack.newRoom).then(function(response){
            roomId = response.name;
            $rootScope.blackJack.isRoomSet = true; 
            sendMsg("SYSTEM", thisPlayer + " created the game!");
            roomRef = firebase.database().ref(`cardRooms/${roomId}`);
            roomRef.off();
            roomRef.on('child_added', setRealtimeData);
            roomRef.on('child_changed', setRealtimeData);
        });
    };

    this.joinRoom = function(roomIdDOM){
        roomId = roomIdDOM;
          // console.log("roomId", roomId);
        $rootScope.user.roomid = roomId;
        RoomFactory.getProfileInRoom(roomId).then(function(roomProfile){
            if (Object.keys(roomProfile.players).length >= roomProfile.maxPlayers){
                $rootScope.blackJack.isRoomAvailable = false;
            } else {
                $rootScope.blackJack.newRoom.profile = roomProfile;
                $rootScope.blackJack.newRoom.profile.players[thisPlayer] = thisPlayer;
                RoomFactory.editPlayerList(roomId, $rootScope.blackJack.newRoom.profile.players).then(function(){
                    sendMsg("SYSTEM", thisPlayer + " joined the game!");
                    $rootScope.blackJack.isRoomSet = true; 
                    // Reference to the /messages/ database path.
                    roomRef = firebase.database().ref(`cardRooms/${roomId}`);
                    roomRef.off();
                    roomRef.on('child_added', setRealtimeData);
                    roomRef.on('child_changed', setRealtimeData);
                });
            }
        });
    };

    this.leaveRoom = function(){
        $rootScope.blackJack.isRoomSet = false; 
        numPlayers--;
        console.log("numPlayers", numPlayers);
        console.log("minPlayerInRoom", $rootScope.blackJack.newRoom.profile.minPlayerInRoom);
        if (numPlayers === $rootScope.blackJack.newRoom.profile.minPlayerInRoom){
            // no player in room
            RoomFactory.deleteRoom(roomId).then(function(){
                $rootScope.blackJack.newRoom.profile.players = {};
            });
        } else {
            delete $rootScope.blackJack.newRoom.profile.players[thisPlayer];
            RoomFactory.editPlayerList(roomId, $rootScope.blackJack.newRoom.profile.players).then(function(){
                sendMsg("SYSTEM", thisPlayer + " left the game!");
                $rootScope.blackJack.newRoom.profile.players = {};
                that.resetDeal();
                that.getRooms();
            });
        }        
    };

    // to sync cards, players in same room
    var setRealtimeData = function(data1, data2) {
        // console.log("data1", data1.val());
        let dataFB = data1.val();
        if (dataFB.hasOwnProperty("code")) {
            let card = dataFB;
            // process cards received
            $rootScope.blackJack.Players[card.username].cards.push(card);
            if (card.username === "Dealer") {
                switch (dealerHand.cards.length){
                    case 1:
                        hideCard(dealerHand.cards[0]);
                        break;
                    case 2:
                        ResultService.checkDeal(userHand, dealerHand);
                        if ($rootScope.blackJack.isResultOut){
                            showCard(dealerHand.cards[0]);
                            $rootScope.blackJack.standOn = true;
                        } else if ($rootScope.blackJack.isDealerTurn){
                            that.userStand();
                        }
                        break;
                    default:
                        break;
                }
            } else {
                if ($rootScope.blackJack.hasDealer){
                    if (card.username === thisPlayer){
                        ResultService.checkUserHit(userHand);
                        if ($rootScope.blackJack.isDealerTurn){
                            that.userStand();
                        }
                    }
                }
                else {
                    if (card.username !== thisPlayer && rivalHand.cards.length === 1){
                        hideCard(rivalHand.cards[0]);
                    }
                    if (userHand.cards.length === 2 && rivalHand.cards.length === 2){
                        ResultService.checkPtpDeal(userHand, rivalHand);
                        if ($rootScope.blackJack.outcome !== "") {
                            showCard(rivalHand.cards[0]);
                        }
                    }
                    if (card.username === thisPlayer){
                        userHand.score = ResultService.getScore(userHand.cards);
                        if (userHand.score >=21){
                            that.userStand();
                        }
                    }
                }
            }
        } else if (dataFB.hasOwnProperty("roomName")) {
            setPlayers(dataFB);
            that.getRooms(); //update room info
        } else if (dataFB.hasOwnProperty("numPlayerStand")) {
            // process stand status info 
            $rootScope.blackJack.newRoom.gameStatus = dataFB;
            let gameStatus = $rootScope.blackJack.newRoom.gameStatus;
            if (gameStatus.clearTable){
                wipeTable();
            } else {
                if (dataFB.isCardShow) {
                    showCard(dealerHand.cards[0]);
                }
                if (gameStatus.numPlayerStand > 1 && gameStatus.numPlayerStand === numPlayers){
                    switch ($rootScope.blackJack.hasDealer){
                        case true: 
                            if ($rootScope.blackJack.outcome === ""){
                                ResultService.checkWinner(userHand, dealerHand);
                            }
                            break;
                        case false:
                            showCard(rivalHand.cards[0]);
                            ResultService.checkPtpWinner(userHand, rivalHand);
                            break;
                    }
                }
            }
        } else if (dataFB.hasOwnProperty("text")) {
            $rootScope.blackJack.roomMsgs.push(dataFB);
        }
        $rootScope.$apply();
    };

    this.deal = function (){
        sendMsg("SYSTEM", thisPlayer + " started the game!");
        $rootScope.blackJack.newRoom.gameStatus.gameOn = true;
        RoomFactory.editGameStatus(roomId, $rootScope.blackJack.newRoom.gameStatus).then(function(){});
        CardFactory.getCards( numPlayers * 2 ).then(function(response){
            if(parseInt(response.remaining) <= 60) {
                console.log("response.remaining", response.remaining);
                needShuffle = true; 
            }
            let count = 0;
            for (let prop in $rootScope.blackJack.newRoom.profile.players) {
                for (let i = 0; i < 2; i++){
                    let card = response.cards[count];
                    card.username = prop;
                    RoomFactory.postCardInRoom(roomId, card).then(function(){
                    });
                    count++;
                }
            }
        });
    }; //start to play

    this.userHit = function (){
        CardFactory.getCards(1).then(function(response){
            let card = response.cards[0];
            card.username = thisPlayer;
            RoomFactory.postCardInRoom(roomId, card).then(function(){});
        });
    }; //user's play

    this.userStand =  function (){
        $rootScope.blackJack.standOn = true;
        reportStand(thisPlayer);
        if ($rootScope.blackJack.hasDealer){
            if ($rootScope.blackJack.newRoom.gameStatus.numPlayerStand === numPlayers - 1){
                // all except dealer stand
                $rootScope.blackJack.newRoom.gameStatus.isCardShow = true;
                RoomFactory.editGameStatus(roomId, $rootScope.blackJack.newRoom.gameStatus).then(function(){});
                if (dealerHand.score >= 17){
                    reportStand("Dealer");
                }else{
                    dealerHit();
                }
            }
        }
    }; //let dealer play

    var dealerHit = function (){
        CardFactory.getCards(1).then(function(response){
            let card = response.cards[0];
            card.username = "Dealer";
            RoomFactory.postCardInRoom(roomId, card).then(function(){
                dealerHand.score = ResultService.getScore(dealerHand.cards);
                if (dealerHand.score >= 17){
                    reportStand("Dealer");
                    return;
                } else {
                    dealerHit();
                }
            });
        });
    };

    this.resetDeal = function(){
        if(needShuffle){
            CardFactory.shuffleCards();
            needShuffle = false;
        }
        $rootScope.blackJack.newRoom.gameStatus.isCardShow = false;
        $rootScope.blackJack.newRoom.gameStatus.numPlayerStand = 0;
        $rootScope.blackJack.newRoom.gameStatus.gameOn = false;
        RoomFactory.editRoom($rootScope.blackJack.newRoom, roomId).then(function(){
            $rootScope.blackJack.newRoom.gameStatus.clearTable = true;
            RoomFactory.editGameStatus(roomId, $rootScope.blackJack.newRoom.gameStatus).then(function(){});
        });
    };

    var wipeTable = function(){
        $rootScope.blackJack.outcome = ''; 
        $rootScope.blackJack.isResultOut = false;
        $rootScope.blackJack.isDealerTurn = false;
        for (let player in $rootScope.blackJack.Players){
            $rootScope.blackJack.Players[player].cards = [];
        }
        $rootScope.blackJack.Players[thisPlayer].score = 0;
        $rootScope.blackJack.standOn = false;
        holeCardImg = "./buffy.jpg";
        // holeCardImg = "./winner_logo.png";
        origCardImg = "";
        $rootScope.blackJack.roomMsgs = [];
        $rootScope.blackJack.newRoom.gameStatus.clearTable = false;
    };

    var hideCard = function (card){
        origCardImg = card.image;
        card.image = holeCardImg;
    };

    var showCard = function (card){
        card.image = origCardImg;
    };

    var reportStand = function (reporter){
        sendMsg("SYSTEM", reporter + " stand!");
        $rootScope.blackJack.newRoom.gameStatus.numPlayerStand++;
        RoomFactory.editGameStatus(roomId, $rootScope.blackJack.newRoom.gameStatus).then(function(){});
    };

    var setPlayers = function (dataFB){
        // get player list
        numPlayers = Object.keys(dataFB.players).length;
        $rootScope.blackJack.newRoom.profile.players = dataFB.players;
        for (let player in dataFB.players) {
            if (!$rootScope.blackJack.Players.hasOwnProperty(player)) {
                $rootScope.blackJack.Players[player] = {};
                $rootScope.blackJack.Players[player].cards = [];
                $rootScope.blackJack.Players[player].score = 0;
                if (player === "Dealer") dealerHand = $rootScope.blackJack.Players[player];
                else if (player === thisPlayer) userHand = $rootScope.blackJack.Players[player];
                else rivalHand = $rootScope.blackJack.Players[player];
            }
        }
    };

    this.send = function(){
        sendMsg(thisPlayer, $rootScope.blackJack.newRoom.messages.msgText);
    };

    var sendMsg = function(senderName, msgText){
        let Msg = {
            name: senderName,
            text: msgText,
            time: new Date(Date.now())
        };
        RoomFactory.postMsgInRoom(roomId, Msg).then(function(){
            $rootScope.blackJack.newRoom.messages.msgText = "";
        });
    };
  
});