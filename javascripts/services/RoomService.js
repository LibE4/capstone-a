"use strict";

app.service("RoomService", function($rootScope, CardFactory, RoomFactory, UserFactory, ResultService){
    var thisPlayer = $rootScope.user.username;
    $rootScope.blackJack.newRoom = {};
    $rootScope.blackJack.newRoom.profile = {};
    $rootScope.blackJack.newRoom.standStatus = {};
    $rootScope.blackJack.rooms = {};
    $rootScope.blackJack.isRoomSet = false; // for show/hide room setup page
    $rootScope.blackJack.isPlaying = true; // for show/hide game table
    $rootScope.blackJack.Players = {};
    $rootScope.blackJack.bet = 0;
    var that = this;
    var roomId = "";
    var roomRef;
    var numPlayers = 0;
    var needShuffle = false;
    var holeCardImg = "./winner_logo.png";
    var dealerHand = {};
    var userHand = {};
    var rivalHand = {};
    var minPlayerInRoom;

    // get room list
    this.getRooms = function(){
        RoomFactory.getRooms().then((response) => {
            $rootScope.blackJack.rooms = response;
            console.log("rooms response", response);
        });
    };

    //card room setup
    this.createNewRoom = function(){
        $rootScope.blackJack.newRoom.standStatus.clearTable = false;
        $rootScope.blackJack.newRoom.standStatus.isCardShow = false;
        $rootScope.blackJack.newRoom.standStatus.numPlayerStand = 0;
        $rootScope.blackJack.newRoom.profile.players = {};
        if ($rootScope.blackJack.hasDealer) {
            $rootScope.blackJack.newRoom.profile.players.Dealer = "Dealer";
        }
        $rootScope.blackJack.newRoom.profile.players[thisPlayer] = thisPlayer;
        RoomFactory.postNewRoom($rootScope.blackJack.newRoom).then(function(response){
            $rootScope.blackJack.isRoomSet = true; 
            roomId = response.name;
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
            console.log("roomProfile", roomProfile);
            $rootScope.blackJack.newRoom.profile = roomProfile;
            $rootScope.blackJack.newRoom.profile.players[thisPlayer] = thisPlayer;
            RoomFactory.editPlayerList(roomId, $rootScope.blackJack.newRoom.profile.players).then(function(){
                $rootScope.blackJack.isRoomSet = true; 
                // Reference to the /messages/ database path.
                roomRef = firebase.database().ref(`cardRooms/${roomId}`);
                roomRef.off();
                roomRef.on('child_added', setRealtimeData);
                roomRef.on('child_changed', setRealtimeData);
            });
        })
    };

    this.leaveRoom = function(){
        delete $rootScope.blackJack.newRoom.profile.players[thisPlayer];
        $rootScope.blackJack.isRoomSet = false;
        $rootScope.blackJack.newRoom.profile.roomName = "";
        RoomFactory.editPlayerList(roomId, $rootScope.blackJack.newRoom.profile.players).then(function(){
            that.resetDeal();
            that.getRooms();
        });
    };

    // to sync cards, players in same room
    var setRealtimeData = function(data1, data2) {
        // console.log("data1", data1.val());
        let dataFB = data1.val();
        if (dataFB.hasOwnProperty("code")) {
            let card = dataFB;
            // process cards received
            $rootScope.blackJack.Players[card.username].cards.push(dataFB);
            if (card.username === "Dealer") {
                switch (dealerHand.cards.length){
                    case 1:
                        flipCard(dealerHand.cards[0]);
                        break;
                    case 2:
                        ResultService.checkDeal(userHand, dealerHand);
                        if ($rootScope.blackJack.isResultOut){
                            flipCard(dealerHand.cards[0]);
                        } else if ($rootScope.blackJack.isDealerTurn){
                            that.userStand();
                        }
                        break;
                    default:
                        // dealer is the last to play
                        dealerHand.score = ResultService.getScore(dealerHand.cards);
                        if (dealerHand.score >= 17){
                            if (!$rootScope.blackJack.newRoom.standStatus.isCardShow){
                                flipCard(dealerHand.cards[0]);
                            }
                            if ($rootScope.blackJack.outcome === ""){
                                ResultService.checkWinner(userHand, dealerHand);
                            }
                        } else {
                            dealerHit();
                        }
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
                        flipCard(rivalHand.cards[0]);
                    }
                    if (card.username === thisPlayer){
                        userHand.score = ResultService.getScore(userHand.cards);
                        console.log("user score", userHand.score);
                        if (userHand.score >=21){
                            that.userStand();
                        }
                    }
                    if (userHand.cards.length === 2 && rivalHand.cards.length === 2){
                        ResultService.checkPtpDeal(userHand, rivalHand);
                        if ($rootScope.blackJack.outcome !== "") {
                            console.log("flip bc" );
                            console.log($rootScope.blackJack.outcome);
                            flipCard(rivalHand.cards[0]);
                        }
                    }
                }
            }
        } else if (dataFB.hasOwnProperty("roomName")) {
            setPlayers(dataFB);
            that.getRooms(); //update room info
        } else if (dataFB.hasOwnProperty("isCardShow")) {
            // process stand status info 
            if (dataFB.clearTable){
                wipeTable();
            } else {
                $rootScope.blackJack.newRoom.standStatus.numPlayerStand = dataFB.numPlayerStand;
                if ($rootScope.blackJack.hasDealer){
                    if ($rootScope.blackJack.newRoom.standStatus.numPlayerStand === numPlayers - 1){
                        flipCard(dealerHand.cards[0]);
                        $rootScope.blackJack.newRoom.standStatus.isCardShow = true;
                        if (dealerHand.score >= 17 && $rootScope.blackJack.outcome === ""){
                            ResultService.checkWinner(userHand, dealerHand);
                        }else{
                            dealerHit();
                        }
                    }
                    // if (dataFB.isCardShow) {
                    //     flipCard(dealerHand.cards[0]);
                    //     ResultService.checkWinner(userHand, dealerHand);
                    // }
                } else {
                    if ($rootScope.blackJack.newRoom.standStatus.numPlayerStand === 2){
                        flipCard(rivalHand.cards[0]);
                        ResultService.checkPtpWinner(userHand, rivalHand);
                    }
                    // if (dataFB.isCardShow) {
                    //     flipCard(rivalHand.cards[0]);
                    //     ResultService.checkPtpWinner(userHand, rivalHand);
                    // }
                }
            }
        }
        $rootScope.$apply();
    };

    this.deal = function (){
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
        let numPlayerStand = ++$rootScope.blackJack.newRoom.standStatus.numPlayerStand;
        RoomFactory.editStandStatus(roomId, $rootScope.blackJack.newRoom.standStatus).then(function(){});
    }; //let dealer play

    var dealerHit = function (){
        // if (dealerHand.score < 17){
            CardFactory.getCards(1).then(function(response){
                let card = response.cards[0];
                card.username = "Dealer";
                RoomFactory.postCardInRoom(roomId, card).then(function(){
                    // dealerHit();
                });
            });
        // }
    }

    this.resetDeal = function(){
        if(needShuffle){
            CardFactory.shuffleCards();
            needShuffle = false;
        }
        $rootScope.blackJack.newRoom.standStatus.clearTable = true;
        RoomFactory.editRoom($rootScope.blackJack.newRoom, roomId).then(function(){});
    };

    var wipeTable = function(){
        $rootScope.blackJack.outcome = ''; 
        $rootScope.blackJack.isResultOut = false;
        $rootScope.blackJack.isDealerTurn = false;
        for (let player in $rootScope.blackJack.Players){
            $rootScope.blackJack.Players[player].cards = [];
        }
        $rootScope.blackJack.Players[thisPlayer].score = 0;
        $rootScope.blackJack.newRoom.standStatus.clearTable = false;
        $rootScope.blackJack.newRoom.standStatus.isCardShow = false;
        $rootScope.blackJack.newRoom.standStatus.numPlayerStand = 0;
        holeCardImg = "./winner_logo.png";
        RoomFactory.editRoom($rootScope.blackJack.newRoom, roomId).then(function(){});
    }

    var flipCard = function (card){
        console.log("card fliped");
        let c = card.image;
        card.image = holeCardImg;
        holeCardImg = c;
    }

    var setPlayers = function (dataFB){
        // process room profile info
        if (dataFB.hasOwnProperty("players")){
            // get player list or delete room
            numPlayers = Object.keys(dataFB.players).length;
            if ($rootScope.blackJack.hasDealer) minPlayerInRoom = 1; else minPlayerInRoom = 0;
            if (numPlayers === minPlayerInRoom){
                // no player in room
                $rootScope.blackJack.isRoomSet = false; 
                numPlayers = 0;
                RoomFactory.deleteRoom(roomId).then(function(){});
            } else if (numPlayers > minPlayerInRoom){
                $rootScope.blackJack.newRoom.profile.players = dataFB.players;
                for (let player in dataFB.players) {
                    $rootScope.blackJack.Players[player] = {};
                    $rootScope.blackJack.Players[player].cards = [];
                    $rootScope.blackJack.Players[player].score = 0;
                    if (player === "Dealer") dealerHand = $rootScope.blackJack.Players[player];
                    else if (player === thisPlayer) userHand = $rootScope.blackJack.Players[player];
                    else rivalHand = $rootScope.blackJack.Players[player];
                }
            }
        } 
    }

    // var thisPlayer = $rootScope.user.username;
    // $rootScope.blackJack = ResultService.SharedGameData;
    // $rootScope.blackJack.newRoom = {};
    // $rootScope.blackJack.newRoom.profile = {};
    // $rootScope.blackJack.newRoom.standStatus = {numPlayerStand:0, isCardShow:false};
    // $rootScope.blackJack.rooms = {};
    // $rootScope.blackJack.isRoomSet = false; // for show/hide room setup page
    // $rootScope.blackJack.isPlaying = true; // for show/hide game table
    // $rootScope.blackJack.dealerHand = {};
    // $rootScope.blackJack.dealerHand.cards = [];
    // $rootScope.blackJack.dealerHand.score = 0;
    // $rootScope.blackJack.Players = {};
    // $rootScope.blackJack.Players[thisPlayer] = {};
    // $rootScope.blackJack.userHand = $rootScope.blackJack.Players[thisPlayer];
    // $rootScope.blackJack.Players[thisPlayer].cards = [];
    // $rootScope.blackJack.Players[thisPlayer].score = 0;
    // $rootScope.blackJack.bet = 0;
    // var that = this;
    // var roomId = "";
    // var roomRef;
    // var numPlayers = 0;
    // var needShuffle = false;
    // var holeCardImg = "./winner_logo.png";

    // // get room list
    // this.getRooms = function(){
    //     RoomFactory.getRooms().then((response) => {
    //         $rootScope.blackJack.rooms = response;
    //         console.log("rooms response", response);
    //     });
    // };

    // //card room setup
    // this.createNewRoom = function(){
    //     $rootScope.blackJack.newRoom.standStatus.clearTable = false;
    //     $rootScope.blackJack.newRoom.standStatus.isCardShow = false;
    //     $rootScope.blackJack.newRoom.standStatus.numPlayerStand = 0;
    //     $rootScope.blackJack.newRoom.profile.players = {};
    //     $rootScope.blackJack.newRoom.profile.players[thisPlayer] = thisPlayer;
    //     RoomFactory.postNewRoom($rootScope.blackJack.newRoom).then(function(response){
    //         $rootScope.blackJack.isRoomSet = true; 
    //         roomId = response.name;
    //         $rootScope.user.roomid = roomId;
    //         // Reference to the /messages/ database path.
    //         roomRef = firebase.database().ref(`cardRooms/${roomId}`);
    //         roomRef.off();
    //         roomRef.on('child_added', setRealtimeData);
    //         roomRef.on('child_changed', setRealtimeData);
    //     });
    // };

    // this.joinRoom = function(roomIdDOM){
    //     roomId = roomIdDOM;
    //       // console.log("roomId", roomId);
    //     $rootScope.user.roomid = roomId;
    //     RoomFactory.getProfileInRoom(roomId).then(function(roomProfile){
    //         $rootScope.blackJack.newRoom.profile = roomProfile;
    //         $rootScope.blackJack.newRoom.profile.players[thisPlayer] = thisPlayer;
    //         RoomFactory.editPlayerList(roomId, $rootScope.blackJack.newRoom.profile.players).then(function(){
    //             $rootScope.blackJack.isRoomSet = true; 
    //             // Reference to the /messages/ database path.
    //             roomRef = firebase.database().ref(`cardRooms/${roomId}`);
    //             // console.log("roomRef", roomRef);
    //             roomRef.off();
    //             roomRef.on('child_added', setRealtimeData);
    //             roomRef.on('child_changed', setRealtimeData);
    //         });
    //     })
    // };

    // this.leaveRoom = function(){
    //     delete $rootScope.blackJack.newRoom.profile.players[thisPlayer];
    //     $rootScope.blackJack.isRoomSet = false;
    //     $rootScope.blackJack.newRoom.profile.roomName = "";
    //     RoomFactory.editPlayerList(roomId, $rootScope.blackJack.newRoom.profile.players).then(function(){
    //         that.resetDeal();
    //         that.getRooms();
    //     });
    // };

    // // to sync cards, players in same room
    // var setRealtimeData = function(data1, data2) {
    //     // console.log("data1", data1.val());
    //     if (data1.val().hasOwnProperty("code")) {
    //         // console.log("data", data1.val(), data2);
    //         // process cards received
    //         let card = data1.val();
    //         if (card.username === "Dealer") {
    //                 $rootScope.blackJack.dealerHand.cards.push(card);
    //                 if($rootScope.blackJack.dealerHand.cards.length === 1 && $rootScope.blackJack.hasDealer) {
    //                     flipCard($rootScope.blackJack.dealerHand.cards[0]);
    //                 }            
    //                 if ($rootScope.blackJack.hasDealer) ResultService.checkDeal($rootScope.blackJack.userHand, $rootScope.blackJack.dealerHand);
    //         } else {
    //             if (!$rootScope.blackJack.Players.hasOwnProperty(card.username)) {
    //                 // distribute first card
    //                 $rootScope.blackJack.Players[card.username] = {};
    //                 $rootScope.blackJack.Players[card.username].cards = [];
    //                 $rootScope.blackJack.Players[card.username].cards[0] = card;
    //                 if (card.username !== thisPlayer){
    //                     $rootScope.blackJack.rivalHand = $rootScope.blackJack.Players[card.username];
    //                     flipCard($rootScope.blackJack.rivalHand.cards[0]);
    //                 }
    //             } else {
    //                 // distribute second and following card
    //                 $rootScope.blackJack.Players[card.username].cards.push(card);
    //                 if (thisPlayer === card.username){
    //                     if ($rootScope.blackJack.hasDealer)
    //                         ResultService.checkUserHit($rootScope.blackJack.userHand);
    //                     else
    //                         ResultService.getScore($rootScope.blackJack.userHand);
    //                 }
    //             }
    //         }
    //     } else if (data1.val().hasOwnProperty("roomName")) {
    //         // process room profile info
    //         if (!data1.val().hasOwnProperty("players")){
    //             // console.log("delete room");
    //             $rootScope.blackJack.isRoomSet = false; 
    //             numPlayers = 0;
    //             RoomFactory.deleteRoom(roomId).then(function(){
    //             });
    //         } else {
    //             $rootScope.blackJack.newRoom.profile.players = data1.val().players;
    //             numPlayers = Object.keys($rootScope.blackJack.newRoom.profile.players).length;
    //             if ($rootScope.blackJack.hasDealer)
    //                 for ( let player in data1.val().players){
    //                     if (data1.val().players[player] !== thisPlayer){
    //                         $rootScope.blackJack.rivalHand = $rootScope.blackJack.Players[player];
    //                     }
    //                 }
    //         }
    //         that.getRooms();
    //     } else if (data1.val().hasOwnProperty("isCardShow")) {
    //         // process stand status info 
    //         let clearTable = data1.val().clearTable;
    //         if (clearTable){
    //             wipeTable();
    //         } else {
    //             $rootScope.blackJack.newRoom.standStatus.numPlayerStand = data1.val().numPlayerStand;        
    //             // console.log("$rootScope.blackJack.newRoom.standStatus.numPlayerStand", $rootScope.blackJack.newRoom.standStatus.numPlayerStand);      
    //             let isCardShow = data1.val().isCardShow;
    //             if (isCardShow) {
    //                 if ($rootScope.blackJack.hasDealer) {
    //                     flipCard($rootScope.blackJack.dealerHand.cards[0]);
    //                     ResultService.checkWinner($rootScope.blackJack.userHand, $rootScope.blackJack.dealerHand);
    //                 }
    //                 else {
    //                     flipCard($rootScope.blackJack.rivalHand.cards[0]);
    //                     ResultService.checkPtpWinner($rootScope.blackJack.userHand, $rootScope.blackJack.rivalHand);
    //                 }

    //             }
    //         }
    //     }
    //     $rootScope.$apply();
    // };

    // this.deal = function (){
    //     CardFactory.getCards( numPlayers * 2 + 2 ).then(function(response){
    //         if(parseInt(response.remaining) <= 60) {
    //             console.log("response.remaining", response.remaining);
    //             needShuffle = true; 
    //         }
    //         let count = 0;
    //         for (let prop in $rootScope.blackJack.newRoom.profile.players) {
    //             for (let i = 0; i < 2; i++){
    //                 let card = response.cards[count];
    //                 card.username = prop;
    //                 RoomFactory.postCardInRoom(roomId, card).then(function(){
    //                 });
    //                 count++;
    //             }
    //         }
    //         for (let i = count; i < count + 2; i++){
    //             let card = response.cards[i];
    //             card.username = "Dealer";
    //             RoomFactory.postCardInRoom(roomId, card).then(function(){
    //             });
    //         }
    //     });
    // }; //start to play

    // this.userHit = function (){
    //     CardFactory.getCards(1).then(function(response){
    //         let card = response.cards[0];
    //         card.username = thisPlayer;
    //         RoomFactory.postCardInRoom(roomId, card).then(function(){});
    //     });
    // }; //user's play

    // this.userStand =  function (){
    //     let numPlayerStand = ++$rootScope.blackJack.newRoom.standStatus.numPlayerStand;
    //     RoomFactory.editStandStatus(roomId, $rootScope.blackJack.newRoom.standStatus).then(function(){});
    //     // console.log("numPlayerStand", numPlayerStand);
    //     // console.log("numPlayers", numPlayers);
    //     if (numPlayerStand === numPlayers){
    //         // dealer reveal cards,then
    //         if ($rootScope.blackJack.hasDealer) {
    //             if ($rootScope.blackJack.dealerHand.score >= 17){
    //                 $rootScope.blackJack.newRoom.standStatus.isCardShow = true;
    //                 RoomFactory.editStandStatus(roomId, $rootScope.blackJack.newRoom.standStatus).then(function(){});
    //             }else{
    //                 dealerHit();
    //             }
    //         } else {
    //             $rootScope.blackJack.newRoom.standStatus.isCardShow = true;
    //             RoomFactory.editStandStatus(roomId, $rootScope.blackJack.newRoom.standStatus).then(function(){});
    //         }
    //     }
    // }; //let dealer play

    // var dealerHit = function (){
    //     if ($rootScope.blackJack.dealerHand.score < 17){
    //         CardFactory.getCards(1).then(function(response){
    //             let card = response.cards[0];
    //             card.username = "Dealer";
    //             RoomFactory.postCardInRoom(roomId, card).then(function(){
    //                 $rootScope.blackJack.dealerHand.score = ResultService.getScore($rootScope.blackJack.dealerHand.cards);
    //                 if ($rootScope.blackJack.dealerHand.score >= 17){
    //                     $rootScope.blackJack.newRoom.standStatus.isCardShow = true;
    //                     RoomFactory.editStandStatus(roomId, $rootScope.blackJack.newRoom.standStatus).then(function(){});
    //                     return;
    //                 }
    //                 dealerHit();
    //             });
    //         });
    //     }
    // }

    // this.resetDeal = function(){
    //     if(needShuffle){
    //         CardFactory.shuffleCards();
    //         needShuffle = false;
    //     }
    //     $rootScope.blackJack.newRoom.standStatus.clearTable = true;
    //     RoomFactory.editRoom($rootScope.blackJack.newRoom, roomId).then(function(){});
    // };

    // var wipeTable = function(){
    //     $rootScope.blackJack.outcome = ''; 
    //     $rootScope.blackJack.dealerHand.cards = [];
    //     $rootScope.blackJack.dealerHand.score = 0;
    //     for (let player in $rootScope.blackJack.Players){
    //         $rootScope.blackJack.Players[player].cards = [];
    //     }
    //     $rootScope.blackJack.Players[thisPlayer].score = 0;
    //     $rootScope.blackJack.newRoom.standStatus.clearTable = false;
    //     $rootScope.blackJack.newRoom.standStatus.isCardShow = false;
    //     $rootScope.blackJack.newRoom.standStatus.numPlayerStand = 0;
    //     holeCardImg = "./winner_logo.png";
    //     RoomFactory.editRoom($rootScope.blackJack.newRoom, roomId).then(function(){});
    // }

    // var flipCard = function (card){
    //     console.log("card fliped");
    //     let c = card.image;
    //     card.image = holeCardImg;
    //     holeCardImg = c;
    // }    
});