var app = require("express")();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var path = 'public/';
var md5 = "";
var css = 'public/css/styles.css';
app.get(path, function(req, res){
  if(path==null){
    path = 'public/index.html';
  }
  res.sendFile( path);
});
app.get("public/message.html", function(req, res){
  res.sendFile( "public/message.html");
  md5 = req.query.md5;
});
app.get('public/notification.mp3', function(req, res){
  res.sendFile( 'public/notification.mp3');
});
app.get(css, function(req, res){
  res.sendFile( css);
});
http.listen((process.env.PORT || 80), function(){
  console.log('listening on *:80');
});
io.on('connection', function(socket){
  socket.on('disconnect',function(){
    console.log("A user disconnected");
  });
  socket.on(md5, function(msg){
    io.emit(md5, msg);
    console.log(msg);
   });
});
