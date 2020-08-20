var board = null
var game = new Chess()
var dummy = new Chess()
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'
var pr = ""
var mins = 0;
var searchDepth = 1

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
    var val = minMoveValue(depth - 1)[1] + Math.random() * .1
    //pr += "[" + m.toString() + ", " + val + "]" 
    dummy.undo()
    if (val > max[1]){
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
    var val = maxMoveValue(depth - 1)[1] + Math.random() * .1
    dummy.undo()
    //pr += ") found value " + val
    //pr += "val of " + m.toString() + ": " + val + "; "
    if (val < min[1]){
      min = [m, val]
      //pr += "value of " + min.toString() + "is better. Switching."
    }
    //pr += "----"
  }
  //document.getElementById('txtField').textContent=pr + "/ chose" + min.toString() +", mins:" + mins
  return min
}

function bestMoveValue(black, depth, alpha, beta){

  if (depth == 0)
    return [null, evaluation()]
  if (dummy.in_checkmate())
    return 1001 * (1 ? black : -1)
  
  var best = [null, 1005 * (1 ? black : -1)]
  var moves = dummy.moves()
  for (var i = 0; i < moves.length; i++){
    dummy.move(moves[i])
    var val = -bestMoveValue(!black, depth-1, -beta, -alpha)[1]
    dummy.undo()

    if(val < best[1])
      best = [moves[i], val]
    if(best[1] < beta)
      beta = best[1]
    if(alpha >= beta)
      return best
  }
  return best



  if(black)
    return minMoveValue(depth)
  else
    return maxMoveValue(depth)
  
}
/*
initially alpha = -INFINITY, beta=INFINITY

search(position,side,depth,alpha,beta) {

  best_score = -INFINITY
  
  for each move {

    do_move(position, move)
      
      if ( depth is 0 )   move_score = static_score(position, side)
      else   move_score = - search(position, opponent side, depth-1, -beta, -alpha)
      
    undo_move(position,move)
    
    if ( move_score > best_score )   best_score = move_score
    if ( best_score > alpha )   alpha = best_score
    if ( alpha >= beta )   return alpha
  }
  
  return best_score
  
}*/

function score(black, depth, alpha, beta){
  var best = -2000
  var moves = dummy.moves()
  
  for (var i = 0; i < moves.length; i++){
    dummy.move(moves[i])
    var moveScore
    if (depth == 0)
      moveScore = evaluation(black)
    else
      moveScore = -score(!black, depth - 1, -beta, -alpha)
    dummy.undo()
    if (moveScore > best)
      best = moveScore
    if (best > alpha)
      alpha = best
    if (alpha >= beta)
      return alpha
  }
  return best
}

function getEngineMove (){
  //pr  = ""
  dummy.load(game.fen())
  var best = [null, -10000]
  var moves = dummy.moves()

  //Reorder for better pruning
/*
  moves = moves.map(a => [-score(true, 1, -10000, 10000), a])

  moves.sort((a, b) => a[0] < b[0])
  moves = moves.map(a => a[1])
*/
  var lower = -100000
  for (var i = 0; i < moves.length; i++){
    //pr += "[Trying " + moves[i].toString()
    dummy.move(moves[i])
    var moveScore = -score(true, 2, lower, 100000) + Math.random() * .00001
    dummy.undo()
    //pr += ", found score " + moveScore + "]"
    if (moveScore > best[1])
      best = [moves[i], moveScore]
    if(best[0] > lower)
      lower = best[0]
  }
  return best[0]
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

function l1(){
  depthClick(1)
}
function l2(){
  depthClick(2)
}

function depthClick(d){
  searchDepth = d + 1
  document.getElementById("lvlText").textContent = "Level " + d
}

function evaluation(black) {
    var fen = dummy.fen()
    var sum = 0;
    var l = fen.indexOf(" ");
    for (var i = 0; i < l; i++)
      sum += pieceValue(fen[i]);
      //document.getElementById('txtField').textContent=fen +" eval:" + sum;
    return sum * (-1 ? black : 1)
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
  await new Promise(r => setTimeout(r, 300));
  var move = getEngineMove()
  //await new Promise(r => setTimeout(r, 500));
  game.move(move);
  //This is ANNOYING
  board.position(game.fen(), false);
  //dummy.load(game.fen())
  s += " " + move.toString() + " "
  //s = pr
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
document.getElementById("lev1").onclick = function() {depthClick(1); document.getElementById("lvlText").textContent += " (Takes a second)"}
document.getElementById("lev2").onclick = function() {depthClick(2); document.getElementById("lvlText").textContent += " (Takes a minute)"}
//var id = setInterval(updateText, 100)