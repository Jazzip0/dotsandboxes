


var app = angular.module('myApp', ['ngMaterial']);
app.controller('appController', function($scope, $mdBottomSheet,$window, $mdDialog,$interval) {
  $scope.board = {
   sides: '3',
   players: '2',
 };
 $scope.progress = 0;
 $scope.players = [];
 $scope.range = function(min, max, step){
  step = step || 1;
  var input = [];
  for (var i = min; i <= max; i += step) input.push(i);
    return input;
};

 $scope.alert = '';
  $scope.showGridBottomSheet = function($event) {
    $scope.alert = '';
    $mdBottomSheet.show({
      templateUrl: 'bottom-sheet-temlplate.html',
      controller: DialogController,
      clickOutsideToClose: true
    }).then(function(clickedItem) {
      $mdToast.show(
            $mdToast.simple()
              .content(clickedItem['name'] + ' clicked!')
              .position('top right')
              .hideDelay(1500)
          );
    });
  };
  $scope.showAlert = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'dialog-template.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      scope: $scope,
      locals: { highscoreList: $scope.highscoreList}
    });
  };
function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
    location.reload();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.restart = function() {
    $scope.updateField();
    location.reload();
  };
}

  angular.element($window).bind("scroll", function() {
    var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    var body = document.body, html = document.documentElement;
    var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
    windowBottom = windowHeight + window.pageYOffset;
    if (windowBottom >= docHeight){
        document.getElementById("pair").style.opacity = 0;
        document.getElementById("pair").style.pointerEvents = "none";
    }else{
      document.getElementById("pair").style.opacity = 1;
      document.getElementById("pair").style.pointerEvents = "auto";
    }
    
});



$scope.getWidth = function(name){
  console.debug(document.getElementById(name).clientWidth)
  return document.getElementById(name).clientWidth;
}
$scope.getHeight = function(name){
  return document.getElementById(name).clientHeight;
}
$scope.getPlayerColor = function(id){
 return $scope.players[id - 1].color;
}
$scope.turn = 0;
$scope.clickSide = function($event){

var id = event.srcElement.id;
var side = id.substring(2);
var column = id.charAt(0);
var row  = id.charAt(1);
if($scope.rooms[column][row][side].player == false){ //if room is not clicked
  event.srcElement.style.backgroundColor = $scope.players[$scope.turn - 1].color;
  $scope.rooms[column][row][side].player = $scope.turn;
  if(!$scope.checkFinishedRooms(column,row,side))
    $scope.newTurn();
   }
}
$scope.checkFinishedRooms = function(column,row,side){
  row = parseInt(row);
  column = parseInt(column);
  if(side == "right" && column != $scope.board.sides - 1)
    $scope.checkRoom(column + 1,row);
  else if(side == "top" && row != 0 )
   $scope.checkRoom(column,row - 1)
  
  $scope.checkRoom(column,row);

  return $scope.checkGameDone();

}
$scope.checkRoom = function(column,row){//If room is completed
  var room = $scope.rooms[column][row];
if(room.top.player == room.bottom.player && room.left.player == room.right.player && room.top.player == room.left.player){ 
    document.getElementById("middle" + column + "" + row).style.backgroundColor = $scope.players[$scope.turn - 1].color;
    $scope.rooms[column][row].complete.player = $scope.turn;
    $scope.players[$scope.turn - 1].rooms++; //add to score
  }
}
$scope.checkGameDone = function(){
  var max = $scope.board.sides;
  var done  = max * max;
  for (var i = 0; i < max; i++) { //loop trough columns
    row: for (var q = 0; q < max; q++) { //loop trough rows
      if($scope.rooms[i][q].complete.player > 0){ //room gone since already taken or is neighbour of taken room
        done--;
        continue row;
      }else{ //check if room has possiblity to complete
        var room = $scope.rooms[i][q];
        var sides = [room.top.player,room.bottom.player,room.left.player,room.right.player];
        var player = undefined;
        for (var w = 0; w< sides.length; w++) {//loop trough all sides
          if(sides[w] != false){ //if side is not pressed yet
            if(player == undefined) //if no previous checked side is pressed
              player = sides[w];
            else if(sides[w] != player){//check if all sides of room are of equal player when this is not the case room is not available
              done--;
              continue row;
            }
          }
        };
      }
    };
  }
  $scope.progress = (1 - done / (max* max)) * 100; // calculate percentage of competion
if(done == 0) //if finished the game
    $scope.mostRooms(); //check which player has the most rooms
else
    return false; // not finished the game
};
$scope.highscoreList = [];
$scope.mostRooms = function(){
  $scopehighscoreList = $scope.players.slice();//duplicate playerlist
  $scope.highscoreList.sort(function(a, b) {
    return parseFloat(b.rooms) - parseFloat(a.rooms);
    });
  $scopehighscoreList[0].place = 1;//set first place
  for (var i = 1; i < $scopehighscoreList.length; i++) {
    if($scopehighscoreList[i - 1].rooms == $scopehighscoreList[i].rooms)
      $scopehighscoreList[i].place = $scopehighscoreList[i - 1].place;
    else
      $scopehighscoreList[i].place = $scopehighscoreList[i - 1].place + 1;
  };
  $scope.showAlert();
}

$scope.createPlayers = function(){
  $scope.players = [];
  $scope.turn = 0;
  for (var i = 1; i <= $scope.board.players; i++) {
    $scope.createPlayer(i);
  };
  if($scope.players.length != 0)
    $scope.newTurn();
}
$scope.rooms = [];
$scope.createRooms= function(){
  $scope.rooms = [];
for (var i = 0; i < $scope.board.sides; i++) { //add column
  var row = [];
  for (var q = 0; q < $scope.board.sides; q++) { //add row
    var top;
    if(q > 0){
      top = row[q - 1].bottom;
    }else
    top = {player:false};

    var left
    if(i > 0){
      left = $scope.rooms[i - 1][q].right;
    }else
    left = {player:false};
    var sides =  {left:left,right:{player:false},top:top,bottom:{player:false},complete:{player:false}};
    
    row.push(sides); //false == not pres
  };
  $scope.rooms.push(row);
};
}

$scope.newTurn = function(){

  var activePlayerBox = document.getElementById("player" + ($scope.turn)); //remove old border
  if(activePlayerBox != null)
    activePlayerBox.style.boxShadow="none";

  if($scope.turn >= $scope.players.length)
    $scope.turn = 1;
  else
    $scope.turn++;

var activePlayerBox = document.getElementById("player" + ($scope.turn)); //add new border
if(activePlayerBox != null)
  activePlayerBox.style.boxShadow = "0px 0px 0px 4px black";
    document.body.style.backgroundColor = $scope.players[$scope.turn - 1].color;
  document.getElementById("content").style.backgroundColor = $scope.players[$scope.turn - 1].color; //TODO ugly fix to show complete background for mobile
}
$scope.createPlayer = function(id){
  var player = {};
  player.id = id;
  player.color = $scope.createColor();
  player.rooms = 0;

  $scope.players.push(player);
}
$scope.createColor = function(){
  do{
  var color = ('#'+Math.floor(Math.random()*16777215).toString(16));
  console.debug(color);
}while(color.length != 7); //fix for sometimes getting a to short color value
  return color;
}
$scope.sheet = (function() {
  // Create the <style> tag
  var style = document.createElement("style");

  // Add a media (and/or media query) here if you'd like!
  // style.setAttribute("media", "screen")
  // style.setAttribute("media", "only screen and (max-width : 1024px)")

  // WebKit hack :(
    style.appendChild(document.createTextNode(""));

  // Add the <style> element to the page
  document.head.appendChild(style);

  return style.sheet;
})();
$scope.updateField = function(){
  $scope.createPlayers();
  $scope.createRooms();
  var sides = document.getElementsByClassName("side");
  for (var i = 0; i < sides.length; i++) {
    sides[i].style.backgroundColor = "#2ecc71"; //set color of buttons back
  };
}
window.onload=function(){
$scope.updateField();
};

});


app.directive('resize', function ($window) { //update on resize
  return function (scope, element) {
    var w = angular.element($window);
    w.bind('resize', function () {
      scope.$apply();
    });
  }
});


