var board = null
var game = new Chess()
var dummy = new Chess()
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'
var pr = ""
var mins = 0;
var searchDepth = 0

function maxMoveValue(depth){
  mins += 1
  if (depth <= 0)
    return [null, evaluation()]
  if (dummy.in_checkmate())
    return [null, -1001]
  var moves = dummy.moves()
  var max = [null, -1000]
  //pr += "moves: "
  //for (var i = 0; i < moves.length; i++){
    //pr += "(" + moves[i].toString() + "), "
  //}
  for (var i = 0; i < moves.length; i++){
    var m = moves[i]
    dummy.move(m)
    var val = minMoveValue(depth - 1)[1]
    //pr += "[" + m.toString() + ", " + val + "]" 
    dummy.undo()
    if (val > max[1] || (val == max[1] && Math.random() < .2)){
      max = [m, val]
    }
  }
  //pr += "best is " + max.toString() + " "
  return max
}

var s = ""

function updateText(){
  document.getElementById('txtField').textContent= s
}

function minMoveValue(depth){
  //mins += 1
  if (depth <= 0)
    return [null, evaluation()]
  if (dummy.in_checkmate())
    return [null, 1001]
  var moves = dummy.moves()
  var min = [null, 1000]
  for (var i = 0; i < moves.length; i++){
    //s = (i / moves.length)+ "% Done Thinking..."
    //updateText();
    //document.getElementById('txtField').hide().show()
    var m = moves[i]
    //pr += "---FEN " + dummy.fen() + "----"
    //pr += "Considering move " + m.toString() +" to FEN "
    dummy.move(m)
    //pr += dummy.fen() + " :: ("
    var val = maxMoveValue(depth - 1)[1]
    dummy.undo()
    //pr += ") found value " + val
    //pr += "val of " + m.toString() + ": " + val + "; "
    if (val < min[1] || (val == min[1] && Math.random() < .2)){
      min = [m, val]
      //pr += "value of " + min.toString() + "is better. Switching."
    }
    //pr += "----"
  }
  //document.getElementById('txtField').textContent=pr + "/ chose" + min.toString() +", mins:" + mins
  return min
}

function bestMoveValue(black, depth){
  if(black)
    return minMoveValue(depth)
  else
    return maxMoveValue(depth)
  
}

function getEngineMove (){
  pr = ""
  dummy.load(game.fen())
  move = bestMoveValue(game.turn() == "b", searchDepth)[0]
  return move
  if (move != null)
    return move
  var moves = game.moves()
  return moves[Math.floor(Math.random() * moves.length)]


}


function pieceValue(p){
  if (p == "p") return -1
  if (p == "n" || p == "b") return -3
  if (p == "r") return -5
  if (p == "q") return -9
  if (p == "P") return 1
  if (p == "N" || p == "B") return 3
  if (p == "R") return 5
  if (p == "Q") return 9
  return 0
}

function evaluation() {
    var fen = dummy.fen()
    var sum = 0;
    var l = fen.indexOf(" ");
    for (var i = 0; i < l; i++)
      sum += pieceValue(fen[i]);
      //document.getElementById('txtField').textContent=fen +" eval:" + sum;
    return sum
} 

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDragStart (source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // or if it's not that side's turn
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

async function onDrop (source, target) {
  removeGreySquares()

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })
  if(game.game_over())
    document.getElementById('txtField').textContent= "Checkmate!"
  // illegal move
  if (move === null) return 'snapback'
  s += " " + move.san + " "
  updateText()

  //document.getElementById('txtField').textContent=game.fen()
  searchDepth = 3
  await new Promise(r => setTimeout(r, 300));
  var move = getEngineMove()
  //await new Promise(r => setTimeout(r, 500));
  game.move(move);
  //This is ANNOYING
  board.position(game.fen(), false);
  //dummy.load(game.fen())
  s += " " + move.toString() + " "
  updateText()
  //evaluation(game.fen());
  if(game.game_over())
    document.getElementById('txtField').textContent= "Checkmate!"

}


function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

function onSnapEnd () {
  board.position(game.fen())

}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)
$(window).resize(board.resize)
//var id = setInterval(updateText, 100)