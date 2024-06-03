const express=require('express');
const socket=require('socket.io');
const http=require('http');
const {Chess}=require('chess.js');
const path=require('path');
const { title } = require('process');


const app=express();
const server=http.createServer(app);

const io= socket(server);

const chess= new Chess();
let players={};
let currentPlayer="w";

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,"public")));


app.get('/',(req,res)=>{
    res.render("index",{title:"chess game"});
});
io.on("connection",function(uniquesocket){
    console.log("connected");

// uniquesocket.on("disconnect",function(){
// uniquesocket.on("chura",function(){
    //console.log("chura ka churan")
    //jese hi chura recive ho sbko chura bhejo
    // io.emit("churan papdi");
    // console.log("disconnected")


    // if white player available nhi hai toh id bano or usko assign krdo
if(!players.white){
    players.white=uniquesocket.id;
    uniquesocket.emit("playerRole","w");
}
else if(!players.black){
    players.black=uniquesocket.id;
    uniquesocket.emit("playerRole","b")
}
else{
    uniquesocket.emit("spectatorRole")
}
//player disconnect ho jaye toh
uniquesocket.on("disconnect",function(){
//agr ek bh disconnect ho jaye toh sbko disconnect krdo hehehe
if(uniquesocket.id===players.white){
    delete players.white;
}
else if(uniquesocket.id===players.black){
    delete players.black;
}
});
uniquesocket.on("move",(move)=>{
    //white ke time pr white chalega na d same for black 
    try{
        if(chess.turn()==="w" && uniquesocket.id !== players.white) return;
        if(chess.turn()==="b" && uniquesocket.id !== players.black) return;

        const result=chess.move(move);
        //if valid move hai then current player save hai and emit kr denge 
        if(result){
            currentPlayer=chess.turn();
            io.emit("move",move);
            io.emit("boardState",chess.fen());
        } else {
            console.log("invalid move ",move);
            uniquesocket.emit("invalidMove",move);
        }
    }
    catch(err){
        console.log(err);
        uniquesocket.emit("invalid move ",move);

    }
})
});

server.listen(3000,function(){
    console.log("chla");
})