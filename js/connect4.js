
var app = angular.module('ngGame', []);

app.service('Utils', function() {
    
  this.getRandoms = function(size,numPicks, ex) {
    var nums = _.range(size*size);
    nums = _.filter(nums,function(item) {
     return ex.indexOf(item) < 0;
    });
    var selections = [];

    for (var i = 0; i < numPicks; i++) {
        var index = Math.floor(Math.random() * nums.length);
        var y = nums[index] % size;
        var x = Math.floor(nums[index] / size);
        selections.push(x.toString() + y.toString());
        nums.splice(index, 1);
    }
    return(selections);
  };

  this.getRandomColor = function () {
    return Math.random().toString(16).substr(-6);
  };

  this.getExcludeSet = function(arrObj) {
    var n = arrObj.length;
    temp = _.map(arrObj,function(row,index){
      var base = index*n;
      var onesInCol=[];
      _.filter(row,function(col,index){
        if(col.value ===1){onesInCol.push(index);}
      });
      return _.map(onesInCol,function(val){return val+base;});
    });
    return _.flatten(temp);
  };

  this.validate = function(arrFields){
    return _.compact(_.map(arrFields,function(field){
      if(field == '' || field == undefined){
        return 'Rules field are not valid !';
      }
    }));
  };
});

app.service('bubbleGame',function(Utils){
  var board =[];

  this.createPlainBoard = function(M){
    board = [];
    for (var i = 0; i < M; i++) {
      board[i] = [];
      for (var j = 0; j < M; j++) {
        board[i][j] = {'value' : 0, 'color' :'#fff'};
      }
    }
    return board;
  }

  this.createGameBoard = function(M,N){
    var excludingSet = Utils.getExcludeSet(board);
    var randomCell = Utils.getRandoms(M, N, excludingSet);
    for(var i=0; i<N; i++){
      var ranclr = Utils.getRandomColor();
      board[randomCell[i][0]][randomCell[i][1]].value = 1;
      board[randomCell[i][0]][randomCell[i][1]].color = '#'+ranclr;
    }
    return board;
  }

  this.decideWinLoss = function() {
    var allOnes = _.flatten(_.map(board,function(obj){
      return _.filter(obj,function(innerObj){
        if(innerObj.value === 1){return innerObj;}
      });
    }))
    if(allOnes.length > 0){
      return 'loss';
    }
    return 'win';
  }
});

app.controller('gameCtrl', function(bubbleGame, Utils, $scope, $timeout) { 

  var shots=0;
  var chance = $scope.gameChances;
  $scope.startGameDisabled = true;
  $scope.message = '';
  
  $scope.newGame = function() {
    var res = Utils.validate([$scope.gridSize, $scope.gameSize, $scope.gameTimer, $scope.gameChances]);
    if(res.length > 0) {
      $scope.message = 'Validation Failed !!!'; 
    }
    else{
      $scope.board = bubbleGame.createPlainBoard($scope.gridSize);
      $scope.startGameDisabled = false;
      $scope.message = '';
    }
  }

  $scope.startGame = function(){
    $scope.newGame();
    shots=0;
    $scope.board = bubbleGame.createGameBoard($scope.gridSize, $scope.gameSize);
    $scope.counter = $scope.gameTimer;
    chance = $scope.gameChances;
    var mytimeout = $timeout($scope.onTimeout,1000);
    $scope.startGameDisabled = true;
    $scope.saveRulesDisabled = true;
  }

  var reStartGame = function(shots){
    $scope.counter = $scope.gameTimer;
    $scope.board = bubbleGame.createGameBoard($scope.gridSize, shots);
    var mytimeout = $timeout($scope.onTimeout,1000);
  }

  $scope.onTimeout = function(){
    var res = bubbleGame.decideWinLoss();
    if(res === 'win'){
      gameOver(res);
      $scope.startGameDisabled = false;
      $scope.saveRulesDisabled = false;
      $scope.counter = 0;
      return;
    }
    else{
      if ($scope.counter > 0) {
          $scope.counter--;
          mytimeout = $timeout($scope.onTimeout,1000);
      } 
      else {
        chance--;
        var res = bubbleGame.decideWinLoss();
        if(chance > 0 && res === 'loss'){
          replayGame(chance);
        }
        else{
          gameOver(res);
          $scope.startGameDisabled = false;
          $scope.saveRulesDisabled = false;
        }
      }
    }
  }

  $scope.shootBubble = function(obj) {
    if(obj.value === 1){
      obj.value = 0;
      obj.color = '#fff';
      shots++;
    }
  }

  function replayGame(chance) {
    $scope.message = chance + " chance left now!";
    reStartGame(shots);
    shots=0;
    /*bootbox.confirm(chance + " chance left now!",function(result) {
      if(result){
        reStartGame(shots);
        shots=0;
      }
      else {
        bubbleGame.gameOver('loss');
        $scope.$apply(function(){
          $scope.startGameDisabled = false;
          $scope.saveRulesDisabled = false;
        });
      }
    });*/
  }

  function gameOver(res){
    if(res === 'loss'){
      $scope.message = 'Oops !!! You have lost the game!';
    }
    else {
      $scope.message = 'Congratulation !!! You have won the game!';
    }
  }
});
  