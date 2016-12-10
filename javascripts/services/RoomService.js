"use strict";

app.service("RoomService", function($rootScope, CardFactory, RoomFactory, UserFactory, ResultService){
    var thisPlayer = $rootScope.user.username;
    this.SharedRoomData = ResultService.SharedGameData;
    this.SharedRoomData.newRoom = {};
    this.SharedRoomData.newRoom.profile = {};
    this.SharedRoomData.newRoom.standStatus = {numPlayerStand:0, isDealerStand:false};
    this.SharedRoomData.rooms = {};
    this.SharedRoomData.isRoomSet = false; // for show/hide room setup page
    this.SharedRoomData.isPlaying = true; // for show/hide table
    this.SharedRoomData.dealerHand = {};
    this.SharedRoomData.dealerHand.cards = [];
    this.SharedRoomData.dealerHand.score = 0;
    this.SharedRoomData.HumanPlayers = {};
    this.SharedRoomData.HumanPlayers[thisPlayer] = {};
    this.SharedRoomData.userHand = this.SharedRoomData.HumanPlayers[thisPlayer];
    this.SharedRoomData.HumanPlayers[thisPlayer].cards = [];
    this.SharedRoomData.HumanPlayers[thisPlayer].score = 0;
    this.SharedRoomData.bet = 0;
    var that = this;
    var roomId = "";
    var roomRef;
    var numPlayers = 0;
    var needShuffle = false;
    var holeCardImg = "./winner_logo.png";

    // get room list
    var getRooms = () => {
        RoomFactory.getRooms().then((response) => {
            that.SharedRoomData.rooms = response;
            console.log("rooms response", response);
        });
    };
    getRooms();  

    //card room setup
    this.createNewRoom = function(){
        that.SharedRoomData.newRoom.standStatus.clearTable = false;
        that.SharedRoomData.newRoom.standStatus.isDealerStand = false;
        that.SharedRoomData.newRoom.standStatus.numPlayerStand = 0;
        that.SharedRoomData.newRoom.profile.players = {};
        that.SharedRoomData.newRoom.profile.players[thisPlayer] = thisPlayer;
        RoomFactory.postNewRoom(that.SharedRoomData.newRoom).then(function(response){
            that.SharedRoomData.isRoomSet = true; 
            roomId = response.name;
            $rootScope.user.roomid = roomId;
            // Reference to the /messages/ database path.
            roomRef = firebase.database().ref(`cardRooms/${roomId}`);
            roomRef.off();
            roomRef.on('child_added', setRealtimeData);
            roomRef.on('child_changed', setRealtimeData);
        });
    };

    this.joinRoom = function(roomIdDOM){
        roomId = roomIdDOM;
          console.log("roomId", roomId);
        $rootScope.user.roomid = roomId;
        RoomFactory.getProfileInRoom(roomId).then(function(roomProfile){
            that.SharedRoomData.newRoom.profile = roomProfile;
            that.SharedRoomData.newRoom.profile.players[thisPlayer] = thisPlayer;
            RoomFactory.editPlayerList(roomId, that.SharedRoomData.newRoom.profile.players).then(function(){
                that.SharedRoomData.isRoomSet = true; 
                // Reference to the /messages/ database path.
                roomRef = firebase.database().ref(`cardRooms/${roomId}`);
                console.log("roomRef", roomRef);
                roomRef.off();
                roomRef.on('child_added', setRealtimeData);
                roomRef.on('child_changed', setRealtimeData);
            });
        })
    };

    this.leaveRoom = function(){
        delete that.SharedRoomData.newRoom.profile.players[thisPlayer];
        that.SharedRoomData.isRoomSet = false;
        that.SharedRoomData.newRoom.profile.roomName = "";
        RoomFactory.editPlayerList(roomId, that.SharedRoomData.newRoom.profile.players).then(function(){
            that.resetDeal();
            getRooms();
        });
    };

    // to sync cards, players in same room
    var setRealtimeData = function(data1, data2) {
        console.log("data1", data1.val());
        if (data1.val().hasOwnProperty("code")) {
            console.log("data", data1.val(), data2);
            // process cards received
            let card = data1.val();
            if (card.username === "Dealer") {
                    that.SharedRoomData.dealerHand.cards.push(card);
                    if(that.SharedRoomData.dealerHand.cards.length === 1){
                        let c = that.SharedRoomData.dealerHand.cards[0].image;
                        that.SharedRoomData.dealerHand.cards[0].image = holeCardImg;
                        holeCardImg = c;
                    }            
                console.log("that.SharedRoomData.dealerHand.cards", that.SharedRoomData.dealerHand.cards);
                    ResultService.checkDeal(that.SharedRoomData.userHand, that.SharedRoomData.dealerHand);
            } else {
                if (!that.SharedRoomData.HumanPlayers.hasOwnProperty(card.username)) {
                    that.SharedRoomData.HumanPlayers[card.username] = {};
                    that.SharedRoomData.HumanPlayers[card.username].cards = [];
                    that.SharedRoomData.HumanPlayers[card.username].cards[0] = card;
                } else {
                    that.SharedRoomData.HumanPlayers[card.username].cards.push(card);
                    if (thisPlayer === card.username){
                        ResultService.checkUserHit(that.SharedRoomData.userHand, that.SharedRoomData.dealerHand);
                    }
                }
            }
        } else if (data1.val().hasOwnProperty("roomName")) {
            // process room profile info
            if (!data1.val().hasOwnProperty("players")){
                console.log("delete room");
                that.SharedRoomData.isRoomSet = false; 
                numPlayers = 0;
                RoomFactory.deleteRoom(roomId).then(function(){
                });
            } else {
                that.SharedRoomData.newRoom.profile.players = data1.val().players;
                numPlayers = Object.keys(that.SharedRoomData.newRoom.profile.players).length;
            }
            getRooms();
        } else if (data1.val().hasOwnProperty("isDealerStand")) {
            // process stand status info 
            let clearTable = data1.val().clearTable;
            if (clearTable){
                wipeTable();
            }
            that.SharedRoomData.newRoom.standStatus.numPlayerStand = data1.val().numPlayerStand;        
            console.log("that.SharedRoomData.newRoom.standStatus.numPlayerStand", that.SharedRoomData.newRoom.standStatus.numPlayerStand);      
            let isDealerStand = data1.val().isDealerStand;
            if (isDealerStand) {
                let c = that.SharedRoomData.dealerHand.cards[0].image;
                that.SharedRoomData.dealerHand.cards[0].image = holeCardImg;
                holeCardImg = c;
                ResultService.checkWinner(that.SharedRoomData.userHand, that.SharedRoomData.dealerHand);  
            }
        }
        $rootScope.$apply();
    };

    this.deal = function (){
        CardFactory.getCards( numPlayers * 2 + 2 ).then(function(response){
            if(parseInt(response.remaining) <= 60) {
                console.log("response.remaining", response.remaining);
                needShuffle = true; 
            }
            // that.SharedRoomData.isPlaying = true;
            let count = 0;
            for (let prop in that.SharedRoomData.newRoom.profile.players) {
                for (let i = 0; i < 2; i++){
                    let card = response.cards[count];
                    card.username = prop;
                    RoomFactory.postCardInRoom(roomId, card).then(function(){
                    });
                    count++;
                }
            }
            for (let i = count; i < count + 2; i++){
                let card = response.cards[i];
                card.username = "Dealer";
                RoomFactory.postCardInRoom(roomId, card).then(function(){
                });
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
        let numPlayerStand = ++that.SharedRoomData.newRoom.standStatus.numPlayerStand;
        RoomFactory.editStandStatus(roomId, that.SharedRoomData.newRoom.standStatus).then(function(){});
        console.log("numPlayerStand", numPlayerStand);
        console.log("numPlayers", numPlayers);
        if (numPlayerStand === numPlayers){
            // dealer reveal cards,then
            if (that.SharedRoomData.dealerHand.score >= 17){
                that.SharedRoomData.newRoom.standStatus.isDealerStand = true;
                RoomFactory.editStandStatus(roomId, that.SharedRoomData.newRoom.standStatus).then(function(){});
            }else{
                dealerHit();
            }
        }
    }; //let dealer play

    var dealerHit = function (){
        if (that.SharedRoomData.dealerHand.score < 17){
            CardFactory.getCards(1).then(function(response){
                console.log("dealer hit");
                let card = response.cards[0];
                card.username = "Dealer";
                RoomFactory.postCardInRoom(roomId, card).then(function(){
                    that.SharedRoomData.dealerHand.score = ResultService.getScore(that.SharedRoomData.dealerHand.cards);
                    if (that.SharedRoomData.dealerHand.score >= 17){
                        that.SharedRoomData.newRoom.standStatus.isDealerStand = true;
                        RoomFactory.editStandStatus(roomId, that.SharedRoomData.newRoom.standStatus).then(function(){});
                        return;
                    }
                    dealerHit();
                });
            });
        }
    }

    this.resetDeal = function(){
        if(needShuffle){
            CardFactory.shuffleCards();
            needShuffle = false;
        }
        that.SharedRoomData.newRoom.standStatus.clearTable = true;
        RoomFactory.editRoom(that.SharedRoomData.newRoom, roomId).then(function(){});
    };

    var wipeTable = function(){
        that.SharedRoomData.outcome = ''; 
        that.SharedRoomData.dealerHand.cards = [];
        that.SharedRoomData.dealerHand.score = 0;
        for (let player in that.SharedRoomData.HumanPlayers){
            that.SharedRoomData.HumanPlayers[player].cards = [];
        }
        that.SharedRoomData.HumanPlayers[thisPlayer].score = 0;
        that.SharedRoomData.newRoom.standStatus.clearTable = false;
        that.SharedRoomData.newRoom.standStatus.isDealerStand = false;
        that.SharedRoomData.newRoom.standStatus.numPlayerStand = 0;
        RoomFactory.editRoom(that.SharedRoomData.newRoom, roomId).then(function(){});
    }
});