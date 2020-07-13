
const app=require("express")();
const http=require("http").createServer(app);
const io=require("socket.io")(http);

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
});

//[イベント]ユーザーが入室
io.on("connection",(socket)=>{
    console.log("ユーザーが入室しました");
    
    socket.on("post",(msg)=>{
        io.emit("member-post",msg);//接続中ユーザにイベント"member-post"とメッセージを送信
        console.log("cast event member-post");
    });
});

http.listen(3000,()=>{
    console.log("listening on *:3000");
});
