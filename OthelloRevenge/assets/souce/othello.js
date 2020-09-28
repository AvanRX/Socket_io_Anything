
var N=4;

var EMPTY='empty';
var WHITE='white';
var BLACK='black';


function Initialize_Board(){

    var board={};

    for(var x=0;x<N;x++){
        for(var y=0;y<N;y++){
            board[[x,y]]=EMPTY;
        }
    }

    var x2=x>>1;
    var y2=y>>1;

    board[[x2-1,y2-1]]=WHITE;
    board[[x2-1,y2-0]]=BLACK;
    board[[x2-0,y2-1]]=BLACK;
    board[[x2-0,y2-0]]=WHITE;

    return board;
}

function drawBoard(board,player){
    var ss=[];
    var wc=0;
    var bc=0;
    
    ss.push('<table>');
    for(var y=-1;y<N;y++){
        ss.push('<tr>');
        for(var x=-1;x<N;x++){
            if(0<=y&&0<=x){
                ss.push('<td class="');
                ss.push("cell");
                ss.push(' ');
                ss.push(board[[x,y]]);
                if(board[[x,y]]==BLACK){
                    bc+=1;
                }
                else if(board[[x,y]]==WHITE){
                    wc+=1;
                }
                ss.push('">');
                ss.push('<span class="disc"></span>');
                ss.push('</td>');
            }
            else if(0 <= x && y == -1){
                ss.push('<th>'+'abcdefgh'[x]+'</th>');
            }
            else if(x == -1 && 0 <= y){
                ss.push('<th>'+'12345678'[y]+'</th>');
            }
            else{
                ss.push('<th></th>');
            }
        }
        ss.push('</tr>');
    }
    ss.push('</table>');

    document.getElementById('board').innerHTML = ss.join('');
    document.getElementById('current_player_name').innerText=(player);
    
    document.getElementById('other_count').innerText="枚数:"+String(wc);
    document.getElementById('my_count').innerText="枚数:"+String(bc);

    if(player==BLACK){
        document.getElementById('other_state').innerText="状態:待機";
        document.getElementById('my_state').innerText="状態:プレイ中";
    }
    else{
        document.getElementById('my_state').innerText="状態:待機";
        document.getElementById('other_state').innerText="状態:プレイ中";
    }
}


function makeGameTree(board_,player_,wasPassed){
    return{
        board:board_,
        player:player_,
        moves:listPossibleMoves(board_,player_,wasPassed)
    };

}

function listPossibleMoves(board,player,wasPassed){
    return completePassingMove(
        listAttackingMoves(board,player),
        board,
        player,
        wasPassed
    );
}


function completePassingMove(attackingMoves,board,player,wasPassed){
    if(0<attackingMoves.length){
        return attackingMoves;
    }
    else if(!wasPassed){
        return[{
            "isPassingMove":true,
            "gameTree":makeGameTree(board,nextPlayer(player),true)
        }];
    }
    else{
        return[];
    }
}

function listAttackingMoves(board,player){
    var moves=[];

    for(var x=0;x<N;x++){
        for(var y=0;y<N;y++){
            if(canAttack(board,x,y,player)){
                moves.push({
                    x:x,
                    y:y,
                    gameTree:makeGameTree(
                        makeAttackedBoard(board,x,y,player),
                        nextPlayer(player),
                        false
                    )
                });
            }
        }
    }

    return moves;
}

function nextPlayer(player){
    return player==BLACK?WHITE:BLACK;
}

function canAttack(board,x,y,player){
    return listVulnerableCells(board,x,y,player).length;
}

function makeAttackedBoard(board,x,y,player){
    var newBoard=JSON.parse(JSON.stringify(board));
    var vulnerableCells=listVulnerableCells(board,x,y,player);
    for(var i=0;i<vulnerableCells.length;i++){
        newBoard[vulnerableCells[i]]=player;
    }
    return newBoard;
}

function listVulnerableCells(board,x,y,player){
    var vulnerableCells = [];

    if (board[[x, y]] != EMPTY)
      return vulnerableCells;
  
    var opponent = nextPlayer(player);
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0)
          continue;
        for (var i = 1; i < N; i++) {
          var nx = x + i * dx;
          var ny = y + i * dy;
          if (nx < 0 || N <= nx || ny < 0 || N <= ny)
            break;
          var cell = board[[nx, ny]];
          if (cell == player && 2 <= i) {
            for (j = 0; j < i; j++)
              vulnerableCells.push([x + j * dx, y + j * dy]);
            break;
          }
          if (cell != opponent)
            break;
        }
      }
    }
  
    return vulnerableCells;
}

function setUpUIToChooseMove(gameTree){
    document.getElementById('message').innerText=("次の手を選択してください");
    gameTree.moves.forEach(function (cv,ind,arr){
        var btn = document.createElement('button');
        btn.type="button";
        btn.innerText=(makeLabelForMove(gameTree.moves[ind]));
        btn.onclick=function(){shiftToNewGameTree(cv.gameTree);}
        document.getElementById('console').appendChild(btn);
    });
}

function makeLabelForMove(move){
    if(move.isPassingMove)
        return 'Pass';
    else
        return 'abcdefgh'[move.x]+','+'12345678'[move.y];
}

function resetUI(){
    document.getElementById('console').innerHTML='';
    document.getElementById('message').innerHTML='';
}

function showWinner(board){
    var nt={};
    nt[BLACK]=0;
    nt[WHITE]=0;

    for(var x=0;x<N;x++){
        for(var y=0;y<N;y++){
            nt[board[[x,y]]]++;
        }
    }
    document.getElementById('message').innerText=(
        nt[BLACK] == nt[WHITE] ? 'The Game Ends in a Draw'
        : 'The Winner is ' + (nt[WHITE] < nt[BLACK] ? BLACK : WHITE)
    );
}

function setUpUIReset(){
    var btn=document.createElement('button');
    btn.type="button";
    btn.innerText=('start a new game');
    btn.onclick=(function(){resetGame()});
   document.getElementById('console').appendChild(btn);
}

function resetGame(){
    var board=Initialize_Board();
    var game_tree = makeGameTree(board,BLACK,false)
    shiftToNewGameTree(game_tree);
}

function shiftToNewGameTree(gameTree){
   drawBoard(gameTree['board'],gameTree['player'],gameTree['moves']);
    resetUI();

    if(gameTree.moves.length==0){
        showWinner(gameTree['board']);
        setUpUIReset();
    }
    else{
        setUpUIToChooseMove(gameTree);
    }
}

(window.onload=function(){
    resetGame();
})
