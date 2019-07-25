var app = require("express")();
var express = require("express");
var http = require('http').Server(app);
var io = require("socket.io")(http);
var path = '';
var md5 = "";
var css = __dirname+'/css/styles.css';
console.log(css);
app.get(path, function(req, res){
    path = __dirname+'/index.html';
  res.sendFile(path);
});
app.get("/message.html", function(req, res){
  res.sendFile(__dirname+"/message.html");
  md5 = req.query.md5;
});
app.get('/notification.mp3', function(req, res){
  res.sendFile(__dirname+'/notification.mp3');
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
