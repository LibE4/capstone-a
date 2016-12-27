"use strict";

app.controller("TetrisCtrl", function($rootScope, $location, UserFactory){
    var thisPlayer = $rootScope.user.username;
    $rootScope.tetris = {};
    /* Keys.js */
    const nGridX = 10, nGridY = 20, gridSize = 20;
    var keyboardAction = [];
    var available_layouts = [
      [
        [0,1,0],
        [1,1,1]
      ], [  
        [0,0,1],
        [1,1,1]
      ], [
        [1,0,0],
        [1,1,1]
      ], [
        [0,1,1],
        [1,1,0]
      ], [
        [1,1,0],
        [0,1,1]
      ], [
        [1,1,1,1],
      ], [
        [1,1],
        [1,1]
      ]
    ];
    var available_colors = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];
    // for status of all drawBlocks
    var gameArea = [];
    for(let r = 0; r < nGridY; r++){
        gameArea[r] = [];
        for (let c = 0; c< nGridX; c++){
            gameArea[r][c] = null;
        }
    }
    var lineOfMerge = nGridY - 1, rowBuildup = nGridY - 1, totalLines = 0, totalShapes = 0;
    var pauseGame = false, fps = 2, gapToNextLevel = 5;
    // startAnimating(fps);

    // Keyboard Controls
    window.onkeydown = function() {
        if (event.keyCode === 13){
            startAnimating(fps); // start game
        } else if (event.keyCode === 80){
            pauseGame = true;
        } else if (event.keyCode === 78){
            // stop game and refresh controller
            pauseGame = true;
            $location.url("/game/home");
            $rootScope.$apply();
            $location.url("/game/tetris");
        } else {
            keyboardAction.push(event.keyCode);
        }
    };

    function handleEvent() {
        for (let e = 0; e < keyboardAction.length; e++){
            switch(keyboardAction[e]) {
                case 32: //spacebar
                    for (let i = currentShape.dy; i < nGridY - currentShape.dh; i++){
                        if (!downClearance(currentShape, gameArea)){
                            break;
                        }
                        currentShape.dy += 1;
                    }
                break;
                case 37: //left arrow
                    if (leftClearance(currentShape, gameArea))  {currentShape.dx -= 1;}
                break;
                case 38: //up arrow
                    if ((currentShape.dy) > 1) {currentShape.dy -= 2;}
                break;
                case 39: //right arrow
                    if (rightClearance(currentShape, gameArea)) {currentShape.dx += 1;}
                break;
                case 40: //down arrow
                    if (downClearance(currentShape, gameArea)) {
                        currentShape.dy += 1;
                    }
                break;
                case 82: //r
                    if (rotateClearance(currentShape, gameArea))  {currentShape.angle = 90; setLayout(currentShape);}
                break;
                case 87: //w
                    if (rotateClearance(currentShape, gameArea))  {currentShape.angle = 270; setLayout(currentShape);}
                break;
            }
            if(!downClearance(currentShape, gameArea)) {
                makeNewShape();
                keyboardAction = [];
                return;
            }
        }
        keyboardAction = [];
    }

    // control requestAnimationFrame speed
    var fpsInterval, startTime, now, then, elapsed;

    // initialize the timer variables and start the animation
    function startAnimating(fps) {
      fpsInterval = 1000 / fps;
      then = Date.now();
      startTime = then;
      animate();
    }

    // the animation loop calculates time elapsed since the last loop
    // and only draws if your specified fps interval is achieved
    function animate() {
      // game stop control
      $rootScope.tetris.totalLines = totalLines;
      $rootScope.tetris.totalShapes = totalShapes;
      $rootScope.$apply();
      if(lineOfMerge === 0 || lineOfMerge === 1) {
        if ($rootScope.user.totalLines < totalLines) {
            $rootScope.user.totalLines = totalLines;
            UserFactory.editUser($rootScope.user);
        }
        if ($rootScope.user.totalShapes < totalShapes) {
            $rootScope.user.totalShapes = totalShapes;
            UserFactory.editUser($rootScope.user);
        }
        return; // to stop game
      } else if (pauseGame === true){
        pauseGame = false;
        return; // to stop game
      }
      // request another frame
      requestAnimationFrame(animate);
      // calc elapsed time since last loop
      now = Date.now();
      elapsed = now - then;
      // if enough time has elapsed, draw the next frame
      if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);
        //drawing code here
        Game.run();
      }
    }
    
    // gameArea manipulation methods
    function mergeCurrentShape (){
        for(let r = 0; r < currentShape.dh; r++){
            for(let c = 0; c < currentShape.dw; c++){
                if(currentShape.layout[r][c] === 1){
                    gameArea[currentShape.dy + r][currentShape.dx + c] = currentShape.color;
                }
            }
        }
        lineOfMerge = currentShape.dy;
        rowBuildup = (rowBuildup >= currentShape.dy) ? currentShape.dy : rowBuildup;
    }

    function checkLineFilled(){
        for(let r = 0; r < currentShape.dh; r++){
            let lineFilled = true;
            for (let c = 0; c < nGridX; c++){
                if (gameArea[currentShape.dy + r][c] === null) {
                    lineFilled = false;
                    break;
                }
            }
            if (lineFilled) {
                totalLines++;
                if ((totalLines + 1) % gapToNextLevel === 0 ) {
                    // increase game speed
                    fps += 0.1;
                    fpsInterval = 1000 / fps;
                }
                gameArea.splice(currentShape.dy + r, 1);
                let line = [];
                for (let c = 0; c< nGridX; c++){
                    line[c] = null;
                }
                gameArea.unshift(line);
            }
        }
    }

    function makeNewShape(){
        mergeCurrentShape();
        checkLineFilled();
        if (lineOfMerge !== 0 && lineOfMerge !== 1) {
            totalShapes++;
            randomNum = Math.floor(Math.random() * 7);
            currentShape.dx = 3;
            currentShape.dy = 0;
            currentShape.layout = available_layouts[randomNum];
            currentShape.dh = available_layouts[randomNum].length;
            currentShape.dw = available_layouts[randomNum][0].length;
            currentShape.color = available_colors[randomNum];
            currentShape.angle = 0;
        }
    } 

    /* shape.js */
    // x, y: co-ordinate for draw; dx, dy: relative co-ordinate for drawBlocks layout
    var shape = function(dx, dy, layout, color){
        this.layout = layout;
        this.dh = layout.length;
        this.dw = layout[0].length;
        this.color = color;
        this.dx = dx;
        this.dy = dy;
        this.angle = 0;
    };
    shape.prototype.fallDown = function(){
            this.dy += 1;
    };

    /* Game.js */
    var Game = { };
    Game.canvas = document.getElementById('myCanvas');
    Game.ctx = myCanvas.getContext('2d');

    var randomNum = Math.floor(Math.random() * 7);
    var currentShape = new shape(3, 0, available_layouts[randomNum], available_colors[randomNum]);
    totalShapes++;

    Game.run = function() {
        // Clear the canvas.
        Game.ctx.fillStyle="black";
        Game.ctx.fillRect(0,0,Game.canvas.width,Game.canvas.height);

        handleEvent();
        // Draw code goes here.
            drawGameArea(gameArea, rowBuildup);
            drawCurrentShape(currentShape);
            currentShape.fallDown();
            if (!downClearance(currentShape, gameArea)) {
                makeNewShape();
        }
    };

    // draw.js
    function drawBlock(dx, dy, color){
        Game.ctx.fillStyle = color;
        Game.ctx.fillRect(dx * gridSize, dy * gridSize, gridSize, gridSize);
        Game.ctx.strokeRect(dx * gridSize, dy * gridSize, gridSize, gridSize);
    }

    function drawCurrentShape(currentShape) {
        currentShape.dw = currentShape.layout[0].length;
        currentShape.dh = currentShape.layout.length;
        for(let r = 0; r < currentShape.dh; r++){
            for(let c = 0; c < currentShape.dw; c++){
                if(currentShape.layout[r][c] === 1){
                    drawBlock(currentShape.dx + c, currentShape.dy + r, currentShape.color);
                }
            }
        }
    }

    function drawGameArea(gameArea, rowBuildup){
        for(let r = rowBuildup; r < gameArea.length; r++){
            for (let c = 0; c< gameArea[0].length; c++){
                if(gameArea[r][c] !== null){
                    drawBlock(c, r, gameArea[r][c]);
                }
            }
        }
    }

    // clearance.js
    // no return statement needed, since argument is an object
    function setLayout(currentShape) {
        // rotate cw
        if(currentShape.angle === 0){
            return;
        } else {
            currentShape.dw = currentShape.layout.length;
            currentShape.dh = currentShape.layout[0].length;
        }
        let newLayout = [];
        for(let r = 0; r < currentShape.dh; r++){
            newLayout[r] = [];
            for (let c = 0; c< currentShape.dw; c++){
                switch(currentShape.angle) {
                    case 90:
                        newLayout[r][c] = currentShape.layout[currentShape.dw - c - 1][r];
                        break;
                    case 270:
                        newLayout[r][c] = currentShape.layout[c][currentShape.dh - r - 1];
                        break;
                }
            }
        }
        currentShape.layout = newLayout;
        currentShape.angle = 0;
    }

    function leftClearance(currentShape, gameArea){
        if(currentShape.dx <= 0){
            return false;
        } else {
            for(let r = 0; r < currentShape.dh; r++){
                for(let c = 0; c < currentShape.dw; c++){
                    if((currentShape.layout[r][c] === 1) && (gameArea[currentShape.dy + r][currentShape.dx + c - 1] !== null)){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function rightClearance(currentShape, gameArea){
        if(currentShape.dx + currentShape.dw >= nGridX){
            return false;
        } else {
            for(let r = 0; r < currentShape.dh; r++){
                for(let c = 0; c < currentShape.dw; c++){
                    if((currentShape.layout[r][c] === 1) && (gameArea[currentShape.dy + r][currentShape.dx + c + 1] !== null)){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function downClearance(currentShape, gameArea){
        if(currentShape.dy + currentShape.dh >= nGridY){
            return false;
        } else {
            for(let r = 0; r < currentShape.dh; r++){
                for(let c = 0; c < currentShape.dw; c++){
                    if((currentShape.layout[r][c] === 1) && (gameArea[currentShape.dy + r + 1][currentShape.dx + c] !== null)){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function rotateClearance(currentShape, gameArea){
        if((currentShape.dx + currentShape.dw > nGridX) || (currentShape.dy + currentShape.dh > nGridY)){
            return false;
        } else {
            //check if vertical layout has room to fit
            for(let r = 0; r < currentShape.dw; r++){
                for(let c = 0; c < currentShape.dh; c++){
                    if(gameArea[currentShape.dy + r][currentShape.dx + c] !== null){
                        return false;
                    }
                }
            }
        }
        return true;
    }

});
