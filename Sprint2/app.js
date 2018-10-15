var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
let kit={
    isHaveUser(user){
        var flag=false;
        users.forEach(function (item) {
            if(item.name==user.name){
                flag=true;
            }
        })
        return flag;
    },
    delUser(id){
        users.forEach(function (item,index) {
            if(item.id==id){
                users.splice(index, 1);
            }
        })
    }
}
app.use('/', express.static(__dirname + '/static'));
io.sockets.on('connection', function(socket) {
  
    socket.on('login', function(user) {
        if (kit.isHaveUser(user)) {
            console.log("loginFail！",user)
            socket.emit('loginFail',"The User Already Exist");
        } else {
            socket.user = user;
            user.id=socket.id;
            console.log("loginSuccess！",user)
            socket.emit('loginSuccess',user,users);
            users.push(user)
            socket.broadcast.emit('system', user,'join');
        };
    });
  
    socket.on('disconnect', function() {
        if (socket.user!= null) {
            kit.delUser(socket.id);
            console.log("User Logout！",socket.user)
            socket.broadcast.emit('system', socket.user, 'logout');
        }
    });
    
    socket.on('groupMessage', function(msg) {
        socket.broadcast.emit('groupMessage', socket.user, msg);
    });
 
    socket.on('message', function(id,msg) {
        socket.broadcast.to(id).emit('message',socket.user,msg);
    });
});
server.listen(8080,function () {
    console.log("Yes","http://localhost:8080`")
});
