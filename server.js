const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');
const app = express();
const server = createServer(app);
const io = new Server(server);

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');
app.use(express.static(path.join(__dirname,'public','client')));

io.on("connection", (socket) => {
    
    socket.join(socket.id);

    socket.onAny((event, ...args) => {
        console.log(event, args);
      });

    socket.on('message',async (msg,senderId,recieverId,groupName)=>{
        // console.log(`message recieved from the ${id} is: ${msg}`);
        // console.log(this);
        // console.log(senderId," ",recieverId," ",groupName);
        if(recieverId === '' && groupName ==='')
            io.emit('message',msg,senderId);          
        else if(groupName === '')        
            io.to(recieverId).emit('message',msg,senderId);
        else 
            {
                // console.log('inside group message');
                const users = (await io.in(groupName).fetchSockets());
                // console.log(users.map(x=>{console.log(x.socket.id);}));
                // console.log(users);
                io.to(groupName).emit('message',msg,senderId);
            }
    })

    // socket.on('privateMessage',(msg,senderId,recieverId)=>{
    //     // console.log(`message recieved from the ${id} is: ${msg}`);
    //     socket.to(recieverId).emit('message',msg,id); 
    // })

    // socket.on('createGroup',async (groupName,...members)=>{        
    //     members.map(member=>{socket.join(groupName)})
    //     // io.to(members).emit()
    //     // console.log('group created!!');

    //     const users = await io.in(groupName).fetchSockets();
    //     console.log('logging all users: ',users.length);
    // })



    socket.on('joinGroup',async (groupName)=>{
        socket.join(groupName);
        
    })

    socket.on('groupChat',async (msg,groupName)=>{
        socket.to(groupName).emit('message',msg);
    })

    socket.on('disconnect', (socket) => {        
        io.emit('userGone',`${socket.id} has left the chat`);
      });

    

});

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{console.log(`Server is listening on http://localhost:${PORT}`)});