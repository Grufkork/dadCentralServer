const PORT = 8081;
const IP = '0.0.0.0';
var http = require("http"),
    sio  = require("socket.io"),
    fs = require("fs");
var server = http.createServer();
server.listen(PORT, IP);
console.log("Server listening on " + IP + ":" + PORT);
var io = sio.listen(server);

var users = [];

function readUsers(){
    fs.readFile("users.json", function(err, data) {
        if(err){
            return console.error(err);
        }
        users = JSON.parse(data).users;
        doEverythingElse();
    });
}
readUsers();
function doEverythingElse() {


var key = function (key, expires, name){
    this.key=key;
    this.expires=expires;
    this.name=name;
};
var keys = [];

io.sockets.on("connection", function(socket){
    socket.on("getKey", function(data){
        var invalidLogin = true;
        for(var x = 0; x < users.length; x++){
            if(data.name.toLowerCase()==users[x].name){
                if(data.password==users[x].password){
                    var aKey = Math.floor(Math.random()*10000);
                    socket.emit("keyGenerated", {key:aKey});
                    keys.push(new key(aKey, 2, data.name));
                    socket.disconnect();
                    console.log("key sent");
                    x=users.length;
                    invalidLogin=false;
                }
            }
        }
        if(invalidLogin){
            console.log("invalidLogin");
            socket.emit("invalidLogin");
            socket.disconnect();
        }
    });
    socket.on("checkKey", function(data){
        for(var x = 0; x < keys.length; x++){
            if(keys[x].key==data.key){
                socket.emit("keyOk", {name:keys[x].name});
            }
        }
    });
});

setInterval(function(){
    var keysToSplice=[];
    for(var x = 0; x < keys.length; x++){
        if(keys[x].expires<=0){
            keysToSplice.push(x);
        }else{
            keys[x].expires--;
        }
    }
    for(var x = 0; x < keysToSplice.length; x++){
        keys.splice(keysToSplice[x]-x, 1);
    }
},10000);
}
console.log("Server started");