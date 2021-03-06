var context; //where the canvas is being created
var shape = new Object();
var board; //2d array
var score; //score of user
var start_time; // starting time of the game
var time_elapsed; //time left to play OR time from start
var interval; //responsible for update position
var monsters; //array contain the monsters
var monstersNum; //the number of monsterts in the game
var intervalMonsters;
var pac_direction;
var food_left_to_show_user;
var keysDown = {}; //dictionary of keys and codes
var pacman_lifes_left;
var sum_of_five_points;
var sum_of_fifteen_points;
var sum_of_twenty_points;
var movingCharacter;//the moving character 
var movingCharacterEaten=false;//check if the moving character was eat
var backgroundAudio= new Audio("PacMan_Music.mp3");
backgroundAudio.addEventListener('ended', function() {
	this.currentTime = 0;
	this.play();
}, false);

var strong_monster;

$(document).ready(function () {
	context = canvas.getContext("2d");
	//Start();
});


class gameMonster {
	constructor(x, y, url) {
		this.x = x;
		this.y = y;
		this.img = new Image();
		this.img.src = url;
	}
}


function Start() {
	backgroundAudio.play();
	board = new Array();
	score = 0;
	pac_direction = 1;
	pacman_lifes_left = 5;
	while( $('#game_information li').length <10)
         $("#game_information").append('<li> <img src="cherry.png" height="20px" width="20px"></li>');
	movingCharacter = [19,9,"Ghost_scary.png"];
	monsters = [];
	monstersNum = $('select[name=numMonsters]').val();
	if (monstersNum == 1) {//create monsters according to user's choice 
		monsters.push(new gameMonster(19, 9, "Blue_Monster.png"));
		strong_monster = Math.floor(Math.random() * monstersNum);
	} else if (monstersNum == 2) {
		monsters.push(new gameMonster(19, 9, "Blue_Monster.png"));
		monsters.push(new gameMonster(0, 0, "Red_Monster.png"));
		strong_monster = Math.floor(Math.random() * monstersNum);
	} else if (monstersNum == 3) {
		monsters.push(new gameMonster(19, 9, "Blue_Monster.png"));
		monsters.push(new gameMonster(0, 0, "Red_Monster.png"));
		monsters.push(new gameMonster(0, 9, "Pink_Monster.png"));
		strong_monster = Math.floor(Math.random() * monstersNum);
	} else if (monstersNum == 4) {
		monsters.push(new gameMonster(19, 9, "Blue_Monster.png"));
		monsters.push(new gameMonster(0, 0, "Red_Monster.png"));
		monsters.push(new gameMonster(0, 9, "Pink_Monster.png"));
		monsters.push(new gameMonster(19, 0, "Orange_Monster.png"));
		strong_monster = Math.floor(Math.random() * monstersNum);
	}
	var cnt = 200; 
	var food_remain = $('.range-slider input[type=range]').val(); //total food left on board
	food_left_to_show_user = food_remain;
	var five_points_food = Math.ceil(0.6 * food_remain);
	sum_of_five_points = 5 * five_points_food;
	var fifteen_points_food = Math.floor(0.3 * food_remain);
	sum_of_fifteen_points = 15 * fifteen_points_food;
	var twenty_five_points_food = Math.floor(0.1 * food_remain);
	sum_of_twenty_points = 20 * twenty_five_points_food;
	var pacman_remain = 1; //boolean , did we draw the pacman or not
	start_time = new Date();
	// 0=empty , 1=twenty_five_points_food, 2=pacman, 3=fifteen_points_food , 4=wall, 5=five_points_food, 6=life
	for (var i = 0; i < 20; i++) {
		board[i] = new Array();
		for (var j = 0; j < 10; j++) {
			if (placeWalls(i, j)) { //place walls in board
				board[i][j] = 4;
			}
			else if ((i == 14 && j == 0)) { //place extra life in board
				board[i][j] = 6;
			}
			else {
				//place colorful food
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					var place_colored_food = false;
					var random_num_to_choose_colored_food;
					while (!place_colored_food) {
						random_num_to_choose_colored_food = Math.random();
						if (random_num_to_choose_colored_food > 0.5 && five_points_food > 0) {
							five_points_food--;
							place_colored_food = true;
							board[i][j] = 5;
						}
						else if (random_num_to_choose_colored_food <= 0.5 && random_num_to_choose_colored_food > 0.15 && fifteen_points_food > 0) {
							fifteen_points_food--;
							place_colored_food = true;
							board[i][j] = 3;
						}
						else if (random_num_to_choose_colored_food <= 0.15 && twenty_five_points_food > 0) {
							twenty_five_points_food--;
							place_colored_food = true;
							board[i][j] = 1;
						}
					}
				}
				else {
					board[i][j] = 0;
				}
				cnt--;
			}
		}
	}
		var pacman_pos = findRandomEmptyCellForPacman(board);//place pacman on board
		board[pacman_pos[0]][pacman_pos[1]] = 2;
		shape.i = pacman_pos[0];
		shape.j = pacman_pos[1];
		pacman_remain--;
	while (food_remain > 0) { //place remaining food on board
		while(five_points_food > 0){
			var emptyCell = findRandomEmptyCell(board);
			board[emptyCell[0]][emptyCell[1]] = 5;//place 5 points in whats left
			five_points_food--;
			food_remain--;
		}
		while(fifteen_points_food > 0){
			var emptyCell = findRandomEmptyCell(board);
			board[emptyCell[0]][emptyCell[1]] = 3;//place 15 points in whats left
			fifteen_points_food--;
			food_remain--;
		}
		while(twenty_five_points_food > 0){
			var emptyCell = findRandomEmptyCell(board);
			board[emptyCell[0]][emptyCell[1]] = 1;//place 25 points in whats left
			twenty_five_points_food--
			food_remain--;
		}
	}

	addEventListener(
		"keydown",
		function (e) {
			keysDown[e.key] = true;
		},
		false
	);
	addEventListener(
		"keyup",
		function (e) {
			keysDown[e.key] = false;
		},
		false
	);
	interval = setInterval(UpdatePosition, 160); //update posision to pacman every 160 mili sec
	intervalMonsters = setInterval(moveMonsters, 250); //update posision to all monsters every 160 mili sec
}

function placeWalls(i, j) { // return true if its wall coordinates
	return (i === 2 && j === 1) || (i === 3 && j === 1) || (i === 2 && j === 2) || (i === 3 && j === 2) || (i === 2 && j === 5)
		|| (i === 2 && j === 6) || (i === 2 && j === 7) || (i === 3 && j === 6) || (i === 6 && j === 5) || (i === 6 && j === 6)
		|| (i === 9 && j === 9) || (i === 9 && j === 8) || (i === 9 && j === 7) || (i === 7 && j === 1) || (i === 8 && j === 1)
		|| (i === 9 && j === 1) || (i === 8 && j === 2) || (i === 11 && j === 3) || (i === 12 && j === 3) || (i === 13 && j === 3)
		|| (i === 12 && j === 4) || (i === 11 && j === 5) || (i === 12 && j === 5) || (i === 13 && j === 5) || (i === 17 && j === 6)
		|| (i === 17 && j === 7) || (i === 15 && j === 7) || (i === 16 && j === 7) || (i === 17 && j === 2) || (i === 18 && j === 2)
		|| (i === 17 && j === 3) || (i === 18 && j === 3) || (i === 17 && j === 1);
}

function isCorner(i, j) { //return true if coordinates are corner in board
	return (i == 0 && j == 0) || (i == 19 && j == 0) || (i == 0 && j == 9) || (i == 19 && j == 9);
}

function findRandomEmptyCell(board) { //find random cell to put food in
	var i = Math.floor(Math.random() * 19 + 1);
	var j = Math.floor(Math.random() * 9 + 1);
	while (board[i][j] != 0) {
		i = Math.floor(Math.random() * 19 + 1);
		j = Math.floor(Math.random() * 9 + 1);
	}
	return [i, j];
}

function findRandomEmptyCellForPacman(board) { //find random cell to put pacman away from corners and monsters
	var emptyCells = []
	for(var h = 0 ; h < 20 ; h++){
		for(var t = 0 ; t < 10 ; t++){
			if(board[h][t] == 0 && !isCorner(h, t) && h<=16 && h>=3 && t<=7 && t>=2){
				emptyCells.push( [h,t] );
			}
		}
	}
	var cellToReturn = Math.floor(Math.random() * emptyCells.length + 1);
    return emptyCells[cellToReturn];
}

function GetKeyPressed() { //get direction from user's pressing
	if (keysDown[$('#keyUp').text()]) {
		return 1;
	}
	if (keysDown[$('#keyDown').text()]) {
		return 2;
	}
	if (keysDown[$('#keyLeft').text()]) {
		return 3;
	}
	if (keysDown[$('#keyRight').text()]) {
		return 4;
	}
}


function UpdatePosition() {
	board[shape.i][shape.j] = 0; //coordinates of pacman - delete the cell and put 0
	var x = GetKeyPressed(); //get key pressed by user
	if (x == 1) {
		if (shape.j > 0 && board[shape.i][shape.j - 1] != 4) { //check move up
			shape.j--; // update position
			pac_direction = 1;
		}
	}
	if (x == 2) {
		if (shape.j < 9 && board[shape.i][shape.j + 1] != 4) { //check move down
			shape.j++;
			pac_direction = 2;
		}
	}
	if (x == 3) {
		if (shape.i > 0 && board[shape.i - 1][shape.j] != 4) { //check move left
			shape.i--;
			pac_direction = 3;
		}
	}
	if (x == 4) {
		if (shape.i < 19 && board[shape.i + 1][shape.j] != 4) { //check move right
			shape.i++;
			pac_direction = 4;
		}
	}
	if (board[shape.i][shape.j] === 6) { //pacman ate cherry
		$("#game_information").append('<li> <img src="cherry.png" height="20px" width="20px"></li>');
		pacman_lifes_left++;
	}
	if (board[shape.i][shape.j] == 1) { //if the new position is food, update score
		score += 25;
		food_left_to_show_user--;
	}
	if (board[shape.i][shape.j] == 3) { //if the new position is food, update score
		score += 15;
		food_left_to_show_user--;
	}
	if (board[shape.i][shape.j] == 5) { //if the new position is food, update score
		score += 5;
		food_left_to_show_user--;
	}
	if(shape.i === movingCharacter[0] && shape.j === movingCharacter[1])//pacman ate moving character
	{
		score+=50;
		movingCharacterEaten=true;
	}
	board[shape.i][shape.j] = 2;
	var currentTime = new Date(); //to define next line
	time_elapsed = (currentTime - start_time) / 1000;
	if(!isGameOver()) {
		Draw();
	}
}

function isGameOver(){//chech if there are more life for pacman or if it ran out of time and food
    var time_presented_to_user = $('input[name=gameTime]').val();

    //check pacman's life bar
    if (pacman_lifes_left <= 0) {
            window.clearInterval(interval);
            window.clearInterval(intervalMonsters);
            backgroundAudio.pause();
            alert("LOSER!");
            return true;
    }
    else if(time_elapsed >= time_presented_to_user  || food_left_to_show_user===0) { //check if time is over or finished food before time is up
            window.clearInterval(interval);
            window.clearInterval(intervalMonsters);
            backgroundAudio.pause(); 
            if (score < 100)
                alert("You can do better than " + score + " points!");
            else
            {
                alert("You are a WINNER!");
            }
            return true;
        }

        return false;
}

function Draw() {
	context.clearRect(0, 0, canvas.width, canvas.height); //clean board
	lblScore.value = score; //update for user
	lblTime.value = time_elapsed;//update for user
	foodLeft.value = food_left_to_show_user;//update for user
	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 10; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] == 2) { //draw pacman
				if (pac_direction == 1) {//up
					let img = new Image();
				    img.src = 'up.png';
					context.drawImage(img, center.x - 25, center.y - 25, 50, 50);
				}
				else if (pac_direction == 2) { //down
					let img = new Image();
				    img.src = 'down.png';
					context.drawImage(img, center.x - 25, center.y - 25, 50, 50);
				}
				else if (pac_direction == 4) { //right
					let img = new Image();
				    img.src = 'right.png';
					context.drawImage(img, center.x - 25, center.y - 25, 50, 50);
				} else if (pac_direction == 3) { //left
					let img = new Image();
				    img.src = 'left.png';
					context.drawImage(img, center.x - 25, center.y - 25, 50, 50);
				}
			}
			else if (board[i][j] == 1) {
				context.beginPath();
				context.arc(center.x, center.y, 12, 0, 2 * Math.PI); // circle
				context.fillStyle = $('input[name=25ptColor]').val(); //color
				context.fill();
				context.strokeStyle = "#ffffff";
				context.stroke();
			}
			else if (board[i][j] == 3) {
				context.beginPath();
				context.arc(center.x, center.y, 8, 0, 2 * Math.PI); // circle
				context.fillStyle = $('input[name=15ptColor]').val(); //color
				context.fill();
				context.strokeStyle = "#ffffff";
				context.stroke();
			}
			else if (board[i][j] == 5) {
				context.beginPath();
				context.arc(center.x, center.y, 5, 0, 2 * Math.PI); // circle
				context.fillStyle = $('input[name=5ptColor]').val(); //color
				context.fill();
				context.strokeStyle = "#ffffff";
				context.stroke();
			}
			else if (board[i][j] == 4) { //draw walls
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.strokeStyle = "#000000";
				context.stroke();
				context.fillStyle = "#67c0ff"; //color
				context.fill();
			}
			else if (board[i][j] == 6) {
				let img = new Image();
				img.src = 'cherry.png';
				context.drawImage(img, center.x - 25, center.y - 25, 50, 50);
			}
			//draw monsters
			for (var k = 0; k < monsters.length; k++) {
				if (monsters[k].x === i && monsters[k].y === j)
					context.drawImage(monsters[k].img, i * 60, j * 60, 60, 60);
			}
			//draw moving character
			if(movingCharacter[0]=== i && movingCharacter[1]===j && !movingCharacterEaten) {
				var movingCharacterImg = new Image();
				movingCharacterImg.src = movingCharacter[2];
					context.drawImage(movingCharacterImg, i * 60, j * 60, 45, 45);
				}
		}
	}

	for (var m = 0; m < monstersNum ; m++) { //if monster gets the pacman
		if(board[monsters[m].x][monsters[m].y] === 2 && monsters[m] === monsters[strong_monster]){ //strong monster decrease score by 20 and life by 2
			pacman_lifes_left = pacman_lifes_left - 2;
			$('#game_information li:last-child').remove();
			$('#game_information li:last-child').remove();
			score = score - 20;
		}
		else if (board[monsters[m].x][monsters[m].y] === 2 && (monsters[m] != monsters[strong_monster])) {//regular monster decrease score by 10 and life by 1
			pacman_lifes_left--;
			$('#game_information li:last-child').remove();
			score = score - 10;
		}
		if (board[monsters[m].x][monsters[m].y] === 2 && pacman_lifes_left > 0) { //get monsters back to corners
				if (monstersNum == 1) {
                    monsters[0].x=19;
					monsters[0].y=9;
				} else if (monstersNum == 2) {
					monsters[0].x=19;
					monsters[0].y=9;
					monsters[1].x=0;
					monsters[1].y=0;
				} else if (monstersNum == 3) {
					monsters[0].x=19;
					monsters[0].y=9;
					monsters[1].x=0;
					monsters[1].y=0;
					monsters[2].x=0;
					monsters[2].y=9;
				} else if (monstersNum == 4) {
					monsters[0].x=19;
					monsters[0].y=9;
					monsters[1].x=0;
					monsters[1].y=0;
					monsters[2].x=0;
					monsters[2].y=9;
					monsters[3].x=19;
					monsters[3].y=0;
				}
				//prevent pacman to start from the corners
				board[shape.i][shape.j] = 0;
				var emptyC = findRandomEmptyCellForPacman(board);
				while (isCorner(emptyC[0], emptyC[1]))
					emptyC = findRandomEmptyCellForPacman(board);
				shape.i = emptyC[0];
				shape.j = emptyC[1];
				break;
			}
	}
}


function moveMonsters() {
	var monster = [];
	var minDistance = Number.POSITIVE_INFINITY;
	var minDistToPacman;
	var minX;
	var minY;
	var randMove;
	var optionalPositions;
	var randMoveIndex;

	//move Monsters
	for (var i = 0; i <= monsters.length; i++) {
		randMove = Math.random();
		monster = monsters[i];
		if (typeof monster !== 'undefined') {
			if (randMove > 0.8) {
				//explore other posiotion (far from pac-man)
				optionalPositions = cellsToMoveTo(monster.x, monster.y);
				if (optionalPositions.length > 0) {
					randMoveIndex = Math.floor(Math.random() * Math.floor(optionalPositions.length));
					minX = optionalPositions[randMoveIndex][0];
					minY = optionalPositions[randMoveIndex][1];
				}
			}
			else {
				//explore posiotion (close to pac-man)		
				//right
				if (isPositionValid(monster.x + 1, monster.y)) {
					minDistToPacman = Math.sqrt(Math.pow(monster.x + 1 - shape.i, 2) + Math.pow(monster.y - shape.j, 2)); //check Manhatten distance to right direction
					if (minDistToPacman < minDistance) {
						minDistance = minDistToPacman;
						minX = monster.x + 1;
						minY = monster.y;
					}
				}//left
				if (isPositionValid(monster.x - 1, monster.y)) {
					minDistToPacman = Math.sqrt(Math.pow(monster.x - 1 - shape.i, 2) + Math.pow(monster.y - shape.j, 2)); //check Manhatten distance to left direction
					if (minDistToPacman < minDistance) {
						minDistance = minDistToPacman;
						minX = monster.x - 1;
						minY = monster.y;
					}
				}//down
				if (isPositionValid(monster.x, monster.y + 1)) {
					minDistToPacman = Math.sqrt(Math.pow(monster.x - shape.i, 2) + Math.pow(monster.y + 1 - shape.j, 2)); //check Manhatten distance to down direction
					if (minDistToPacman < minDistance) {
						minDistance = minDistToPacman;
						minX = monster.x;
						minY = monster.y + 1;
					}
				}//up
				if (isPositionValid(monster.x, monster.y - 1)) {
					minDistToPacman = Math.sqrt(Math.pow(monster.x - shape.i, 2) + Math.pow(monster.y - 1 - shape.j, 2)); //check Manhatten distance to up direction
					if (minDistToPacman < minDistance) {
						minDistance = minDistToPacman;
						minX = monster.x;
						minY = monster.y - 1;
					}
				}
			}
			monster.x = minX;
			monster.y = minY;
			minDistance = Number.POSITIVE_INFINITY;
		}
	}
	//move moving character -ghost
	optionalPositions=cellsToMoveTo(movingCharacter[0],movingCharacter[1]); //get moves the ghost can go to
	if(optionalPositions.length !==0){
		randMoveIndex= Math.floor(Math.random() * Math.floor(optionalPositions.length)); //choose random move
		movingCharacter[0]=optionalPositions[randMoveIndex][0];
		movingCharacter[1]=optionalPositions[randMoveIndex][1];
	}
}

//look for possible moves that monster can make
function cellsToMoveTo(x, y) {
	var possibleMoves = [];
	//checkDown
	if (isPositionValid(x, y - 1)) {
		possibleMoves.push([x, y - 1]);
	}
	//checkUp
	if (isPositionValid(x, y + 1)) {
		possibleMoves.push([x, y + 1]);
	}
	//checkRight
	if (isPositionValid(x + 1, y)) {
		possibleMoves.push([x + 1, y]);
	}
	//CheckLeft
	if (isPositionValid(x - 1, y)) {
		possibleMoves.push([x - 1, y]);
	}
	return possibleMoves;
}


//check a position if its in the board game and isnt a wall
function isPositionValid(x, y) {
	return (x <= 19 && x >= 0 && y <= 9 && y >= 0 && board[x][y] !== 4);
}

function restart(element) { //restart game with same settings
	backgroundAudio.pause();
	if(confirm('Are you sure you want to restart the game?')){
	clearInterval(interval);
	clearInterval(intervalMonsters);
	movingCharacterEaten = false;

	//restore life
	if(pacman_lifes_left === 6){
		$('#game_information li:last-child').remove();
		pacman_lifes_left = 5;
	}
	Start();
	}
}


function registerEnterFunction(element) { //show register div
	window.clearInterval(interval);
    window.clearInterval(intervalMonsters);
	enableMute();
	$("#welcome").hide();
	$("#login").hide();
	$("#register").show();
	$("#gameSettings").hide();
	$("#gamePlay").hide();
	$("#about").hide();
}

function loginEnterFunction(element) {//show login div
	window.clearInterval(interval);
    window.clearInterval(intervalMonsters);
	enableMute();
	$("#welcome").hide();
	$("#login").show();
	$("#register").hide();
	$("#gameSettings").hide();
	$("#gamePlay").hide();
	$("#about").hide();
}

function homePageFunction(element) {//show welcome div
	window.clearInterval(interval);
    window.clearInterval(intervalMonsters);
	enableMute();
	$("#welcome").show();
	$("#login").hide();
	$("#register").hide();
	$("#gameSettings").hide();
	$("#gamePlay").hide();
	$("#about").hide();
}


function startGameFunction(element) {//show gamePlay div
	$("#welcome").hide();
	$("#login").hide();
	$("#register").hide();
	$("#gameSettings").hide();
	$("#gamePlay").show();
	$("#about").hide();
}

function gotoSettings(element) {//show gameSettings div
	window.clearInterval(interval);
    window.clearInterval(intervalMonsters);
	enableMute();
	$("#welcome").hide();
	$("#login").hide();
	$("#register").hide();
	$("#gameSettings").show();
	$("#gamePlay").hide();
	$("#about").hide();
}

function gotoAbout(element) {//show about div
	window.clearInterval(interval);
    window.clearInterval(intervalMonsters);
	enableMute();
	$("#welcome").hide();
	$("#login").hide();
	$("#register").hide();
	$("#gameSettings").hide();
	$("#gamePlay").hide();
	$("#about").show();
}

function enableMute() {  //mute music
	backgroundAudio.pause();
} 

function disableMute() { //play music
	backgroundAudio.play();
} 
