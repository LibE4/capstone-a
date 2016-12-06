"use strict";

app.controller("BlackjackMultiCtrl", function($scope, $rootScope, $routeParams, $location, CardFactory, RoomFactory){
    $scope.newRoom = {};
    $scope.newRoom.profile = {};
    $scope.rooms = {};
    $scope.outcome = ''; 
    $scope.isPlaying = true; 
    $scope.isRoomSet = false; 
    // $scope.isPlaying = false; 
    $scope.dealerHand = {};
    $scope.dealerHand.cards = [];
    $scope.dealerHand.score = 0;
    var needShuffle = false;
    var roomId = "";
    var roomRef;
    var playerName = $rootScope.user.username;
    $scope.HumanPlayers = {};
    $scope.HumanPlayers[playerName] = {};
    $scope.HumanPlayers[playerName].cards = [];

    let getRooms = () => {
        RoomFactory.getRooms().then((response) => {
            $scope.rooms = response;
        });
    };
    getRooms();   

    $scope.createNewRoom = function(){
        $scope.newRoom.uid = $rootScope.user.uid;
        $scope.newRoom.profile.players = {};
        $scope.newRoom.profile.players[playerName] = playerName;
        RoomFactory.postNewRoom($scope.newRoom).then(function(response){
            console.log("create response", response);
            $scope.isRoomSet = true; 
            roomId = response.name;
            $rootScope.user.roomid = roomId;
            // Reference to the /messages/ database path.
            roomRef = firebase.database().ref(`cardRooms/${roomId}`);
            roomRef.off();
            roomRef.on('child_added', setRealtimeData);
            roomRef.on('child_changed', setRealtimeData);
        });
    };

    $scope.joinRoom = function(roomIdDOM){
        roomId = roomIdDOM;
        $rootScope.user.roomid = roomId;
        RoomFactory.getPlayerInRoom(roomId).then(function(response){
            console.log("player response", response);
            $scope.newRoom.profile.players = response;
            $scope.newRoom.profile.players[playerName] = playerName;
            RoomFactory.editPlayerList(roomId, $scope.newRoom.profile.players).then(function(){
                $scope.isRoomSet = true; 
                // Reference to the /messages/ database path.
                roomRef = firebase.database().ref(`cardRooms/${roomId}`);
                console.log("roomRef", roomRef);
                roomRef.off();
                roomRef.on('child_added', setRealtimeData);
                roomRef.on('child_changed', setRealtimeData);
        });
        })
    };

    // to sync cards, players in same room
    var setRealtimeData = function(data1, data2) {
        console.log("data", data1.val(), data2);
        if (data1.val().hasOwnProperty("code")) {
            let card = data1.val();
            if (card.username === "Dealer") {
                console.log("$scope.dealerHand.cards", $scope.dealerHand.cards);
                if($scope.dealerHand.cards[0] === null) {
                    $scope.dealerHand.cards[0] = card;
                } else {
                    $scope.dealerHand.cards.push(card);
                }
            } else {
                if (!$scope.HumanPlayers.hasOwnProperty(card.username)) {
                    $scope.HumanPlayers[card.username] = {};
                    $scope.HumanPlayers[card.username].cards = [];
                    $scope.HumanPlayers[card.username].cards[0] = card;
                } else {
                    console.log("$scope.HumanPlayers[card.username].cards", $scope.HumanPlayers[card.username]);
                    if($scope.dealerHand.cards[0] === null) {
                        $scope.HumanPlayers[card.username].cards[0] = card;
                    } else {
                        $scope.HumanPlayers[card.username].cards.push(card);
                    }
                }
            }
        } else if (data1.val().hasOwnProperty("players")) {
            $scope.newRoom.profile.players = data1.val().players;
        }
        $scope.$apply();
    };

    $scope.deal = function (){
        if(needShuffle){
            shuffle();
            needShuffle = false;
        }
        let n = Object.keys($scope.newRoom.profile.players).length;
        console.log("n", n);
        CardFactory.getCards( n * 2 + 2 ).then(function(response){
            if(parseInt(response.remaining) <= 60) { needShuffle = true; }
            // $scope.isPlaying = true;
            let count = 0;
            for (let prop in $scope.newRoom.profile.players) {
                for (let i = 0; i < 2; i++){
                    let card = response.cards[count];
                    card.username = prop;
                    RoomFactory.postCardInRoom(card, roomId).then(function(){
                    });
                    count++;
                }
            }
            for (let i = n * 2; i < n * 2 + 2; i++){
                let card = response.cards[i];
                card.username = "Dealer";
                RoomFactory.postCardInRoom(card, roomId).then(function(){
                });
                    // checkDeal($scope.userHand, $scope.dealerHand);
            }
        });
    }; //start to play

    var shuffle = function (){
        CardFactory.shuffleCards();
    };

    $scope.userHit = function (){
        CardFactory.getCards(1).then(function(response){
            let card = response.cards[0];
            card.username = playerName;
            RoomFactory.postCardInRoom(card, roomId).then(function(){
                // checkUserHit($scope.userHand, $scope.dealerHand);
            });
        });
    }; //user's play

    $scope.userStand =  function (){
        if ($scope.dealerHand.score >= 17){
            dealerStand();
        }else{
            dealerHit();
        }
    }; //let dealer play

    var dealerHit = function (){
        if ($scope.dealerHand.score < 17){
            CardFactory.getCards(1).then(function(response){
                console.log("dealer hit");
                let card = response.cards[0];
                card.username = playerName;
                RoomFactory.postCardInRoom(card, roomId).then(function(){
                    $scope.dealerHand.score = getScore($scope.dealerHand.cards);
                    if ($scope.dealerHand.score >= 17){
                        dealerStand();
                        return;
                    }
                    dealerHit();
                    // checkUserHit($scope.userHand, $scope.dealerHand);
                });
            });
        }
    }

    var dealerStand = function (){
        console.log("dealer stand");
        // checkWinner($scope.userHand, $scope.dealerHand);
    }

    /* calculate score of the Hand */
    var getScore = function (cards){
        var score = 0, cardVal = 0, aces = 0; 
        
        for (let i=0; i<cards.length; i++){
            switch (cards[i].value.toLowerCase()){
                case "ace":
                    cardVal = 11;
                    aces += 1;
                    break;
                case "king":
                case "queen":
                case "jack":
                    cardVal = 10;
                    break;
                default:
                    cardVal = parseInt(cards[i].value);
                    break;
            }
            score += cardVal;
        }
        /* Check to see if Aces should be 1 or 11 */
        while (score > 21 && aces > 0){
            score -= 10;
            aces -=1;
        }
        return score;
    };

    var checkDeal = function (userHand, dealerHand){
        userHand.score = getScore(userHand.cards);
        dealerHand.score = getScore(dealerHand.cards)
        if (userHand.score === 21 && dealerHand.score === 21){
            $scope.outcome = "You tied!";
            // $scope.isPlaying = false; 
        }else if (userHand.score === 21){
            $scope.outcome = "You win!";
            // $scope.isPlaying = false; 
        }else if (dealerHand.score === 21){
            $scope.outcome = "You lose!";
            // $scope.isPlaying = false; 
        }
    };

    var checkUserHit = function (userHand, dealerHand){
        userHand.score = getScore(userHand.cards);
        if (userHand.score === 21){
            $scope.outcome = "You win!";
            // $scope.isPlaying = false; 
        }else if (userHand.score > 21){
            $scope.outcome = "You lose!";
            // $scope.isPlaying = false; 
        }
    };

    var checkWinner = function (userHand, dealerHand){
        userHand.score = getScore(userHand.cards);
        dealerHand.score = getScore(dealerHand.cards)
        if (userHand.score > 21 || dealerHand.score === 21){
            $scope.outcome = "You lose!";
            // $scope.isPlaying = false; 
        }else if (userHand.score === 21 || dealerHand.score > 21 || userHand.score > dealerHand.score){
            $scope.outcome = "You win!";
            // $scope.isPlaying = false; 
        }else if (dealerHand.score > userHand.score){
            $scope.outcome = "You lose!";
            // $scope.isPlaying = false; 
        }else if (dealerHand.score === userHand.score){
            $scope.outcome = "You tied!";
            // $scope.isPlaying = false; 
        }
    };

    var resetDeal = function(){
        $scope.outcome = ''; 
        // $scope.isPlaying = false; 
        $scope.userHand = {};
        $scope.dealerHand = {};
        $scope.userHand.score = 0;
        $scope.dealerHand.score = 0;
    };

});
