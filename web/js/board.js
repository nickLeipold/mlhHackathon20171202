


var data = JSON.parse(httpRequest("http://orion.hugo-klepsch.tech/api/newgame","GET"));

console.log(data);
populateId(data.sessionKey);


var lastClicked;
var grid = clickableGrid(8,8,function(el,row,col){
    console.log("You clicked on element:",el);
    console.log("You clicked on row:",row);
    console.log("You clicked on col:",col);

    el.className='clicked';
    if (lastClicked) lastClicked.className='';
    lastClicked = el;
});

document.getElementById("board").appendChild(grid);

var tempBoard = data.board.slice();
populateBoard(tempBoard);
     
function clickableGrid( rows, cols, callback ){
    var i=0;
    var grid = document.createElement('table');
    grid.className = 'grid';
    for (var r=0;r<rows;++r){
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c=0;c<cols;++c){
            var cell = tr.appendChild(document.createElement('td'));
            if( (c +r +1) % 2 === 0){
                cell.style = "background:black";
            }
            else{
                cell.style = "background:white";
            }
            cell.id = r+","+c;
            cell.addEventListener('click',(function(el,r,c){
                return function(){
                    callback(el,r,c);
                }
            })(cell,r,c),false);
        }
    }
    return grid;
}

function populateId(id){
    document.getElementById("game-id").innerHTML = id;
}


function populateBoard(board){
    var index = 0;
    var arr2d = [];
    while(board.length) arr2d.push(board.splice(0,8));
    
    console.log(data.board.length);
    data.board.forEach(function(element,index)
    {
        var j = index%8;
        var i = Math.floor(index/8 );
        console.log(i+","+j);
        var img = new Image();
        img.onload = function()
        {
            (document.getElementById(i+","+j)).appendChild(img);
        };
        img.src = generateImageTag(arr2d[i][j]);
        
    }); 
}


function generateImageTag(piece)
{
    //uppercase is white
    switch(piece) {
        case "r":
             return "img/pieces/blackRook.png";
            break;
        case "R":
             return "img/pieces/whiteRook.png";
            break;
        case "n":
             return "img/pieces/blackKnight.png";
            break;
        case "N":
             return "img/pieces/whiteKnight.png";
            break;
        case "b":
             return "img/pieces/blackBishop.png";
            break;
        case "B":
             return "img/pieces/whiteBishop.png";
            break;
        case "q":
             return "img/pieces/beyonce.png";
            break;
        case "Q":
             return "img/pieces/whiteQueen.png";
            break;
        case "k":
             return "img/pieces/tupac.png";
            break;
        case "K":
             return "img/pieces/whiteKing.png";
            break;
        case "p":
             return "img/pieces/blackPawn.png";
            break;
        case "P":
            return "img/pieces/whitePawn.png";
            break;
            
        default:
            return "";
        
    }
    
    
}



function httpRequest(theUrl,mode)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( mode, theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}