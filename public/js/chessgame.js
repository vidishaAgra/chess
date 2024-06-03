const socket=io();

//frontend se back pr event bheja

// socket.emit("chura");
// socket.on("churan papdi",function(){
//     console.log("papdi received");
// })
const chess=new Chess();
const boardElement= document.querySelector(".chessboard");
let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;

const renderBoard=()=>{
    const board=chess.board();
    boardElement.innerHTML="";
    board.forEach((row,rowindex)=>
{
   row.forEach((square,squareindex)=>{
    const squareElement=document.createElement("div");
    squareElement.classList.add("square",
        (rowindex+squareindex)%2===0 ? "light" : "dark"
    );

    squareElement.dataset.row=rowindex;
    squareElement.dataset.col=squareindex;
    //chess board ke upr elemnts hai ki nhi
    if(square){
        const pieceElement=document.createElement("div");
        pieceElement.classList.add(
            "piece",
            square.color=== "w" ? "white" : "black"
        );
        pieceElement.innerText=getPieceUnicode(square);
        pieceElement.draggable=playerRole=== square.color;
        pieceElement.addEventListener("dragstart",(e)=>{
            if(pieceElement.draggable){
                draggedPiece=pieceElement;
                sourceSquare={row:rowindex,col:squareindex};
                e.dataTransfer.seetData("text/plain","");//drag me koi pareshan na ho

            }
        });
        //jb drag ho rha hai toh kon drag ho rha hai
        pieceElement.addEventListener("dragend",()=>{
            draggedPiece=null;
            sourceSquare=null;
        });
        //piche wale square pr hmne piece attach kr diya hai
        squareElement.appendChild(pieceElement)
    }
    squareElement.addEventListener("dragover",function(e){
        e.preventDefault();
    });

    //square pr drop krna
    squareElement.addEventListener("drop",function(e){
        e.preventDefault();
        if(draggedPiece){
            const targetSource={
                row: parseInt(squareElement.dataset.row),
                col: parseInt(squareElement.dataset.col ),
            };
            handleMove(sourceSquare,targetSource);
        }
    });
    
    boardElement.appendChild(squareElement);
   });
});
if(playerRole==='b'){
    boardElement.classList.add("flipped");
}
else{
    boardElement.classList.remove("flipped");

}
}

const handleMove=(source,target)=>{
    const move={
        from: `${String.fromCharCode(97+source.col)}${8-source.row}` ,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}` ,
        promotion:'q',

    };
socket.emit("move",move);
}

const getPieceUnicode=(piece)=>{
    const unicodePieces={
            k:"♔",
            q:"♕",
            r:"♖",
            b:"♗",
            n:"♘",
            p:"♙",

            k:"♚",
            q:"♛",
            r:"♜",
            b:"♝",
            n:"♞",
            p:"♟",
    };
    return unicodePieces[piece.type] || "";
}

socket.on("playerRole",function(role){
    playerRole=role;
    renderBoard();

});

socket.on("spectatorRole",function(){
    playerRole=null;
    renderBoard();

});

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
})

socket.on("move",function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();