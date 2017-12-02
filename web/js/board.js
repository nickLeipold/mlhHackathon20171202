


var data = JSON.parse(httpRequest("http://orion.hugo-klepsch.tech/api/newgame","GET"));

console.log(data);
populateId(data.sessionKey);
populateBoard(data.board)


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
    
    console.log(arr2d);
    
}



function httpRequest(theUrl,mode)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( mode, theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}