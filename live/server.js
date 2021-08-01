const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 5000;
const {v4: uuidv4} = require("uuid");
// import {v4 as uuidv4} from "uuid";
require("dotenv").config();
const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");



console.log(process.env.YT_API_KEY)
const server = app.listen(PORT, ()=>{
    console.log(`the server is running on port ${PORT}`)
});

// console.log

const socket = require("socket.io");
const io = socket(server);
const rooms = {};
/*
rooms{
    roomID: [user1, user2,....]
    roomID: [user1, user2,....]
    roomID: [user1, user2,....]
    roomID: [user1, user2,....]
}
*/ 

//record of the user's room
const userRoom = {}
/*
userRoom{
    userID: roomID,
    userID: roomID,
    userID: roomID,
    userID: roomID,
}
*/ 

const roomMessages = {};


console.log(roomMessages)

/*
roomMessages{
    roomId: [{msgObj, msgObj, msgObj}],
    roomId: [{msgObj, msgObj, msgObj}] 
}

*/



io.on("connection", socket=>{
    console.log(`the socket ${socket.id} has connected`);
    socket.on("join room", data=>{
        const roomID = data;
        //see if the room exists 
        if(rooms[roomID]){
            //check the size, limit to 6.
            const length = rooms[roomID].length;
            if(length === 2){
                socket.emit("room full", "sorry the room is full");
                return
            }else{
                //put them into the room
                socket.join(roomID);
                rooms[roomID].push(socket.id);
                socket.join(roomID);
            }
        }else{
            //if it does not exist, then create a room
            rooms[roomID] = [socket.id];
            socket.join(roomID);
        }
        //record the user's room
        userRoom[socket.id] = roomID;
        //respond with the other users
        const otherUsers = rooms[roomID].filter(id=>(id !== socket.id));
        socket.emit("you joined", otherUsers);
        // console.log(rooms[roomID]);
        console.log(socket.rooms);

    })

    // const roomID = userRoom[socket.id];

    socket.on("sending signal", data=>{
        //send the signal over to the old users, include the callerID so that they know who to respond to
        io.to(data.recipient).emit("caller sending signal", {callerID: socket.id, signal: data.signal});
        // console.log(data)
    })

    socket.on("returning signal", data=>{
        io.to(data.callerID).emit("recipient returned signal", {recipientID: socket.id, signal: data.signal})
    })

    socket.on("connection established", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        io.to(userID).emit("connection established", "");
    })

    socket.on("disconnecting", ()=>{
        const roomID = userRoom[socket.id];
        socket.to(roomID).emit("client disconnected", socket.id);
    })
    
    socket.on("disconnect", ()=>{
        //remove them from the room that they were in
        const roomID = userRoom[socket.id]
        const room = rooms[roomID];
        //filter the room if it exists
        if(room){
            rooms[roomID]  = room.filter(userID=>(userID !== socket.id));    
            console.log(rooms[roomID]);
        }
    })
    socket.on("hello world", data=>{
        const roomID = userRoom[socket.id];
        socket.to(roomID).emit("hello world", "hello bro")
    })

    socket.on("pause video", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        if(userID){
            io.to(userID).emit("pause video", "");
        }
    })

    socket.on("resume video", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        if(userID){
            io.to(userID).emit("resume video", "");
        }
    });



    socket.on("mute audio", data=>{
        console.log("the peer has been found");
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        if(userID){
            io.to(userID).emit("mute audio", "");
        }
    });

    socket.on("unmute audio", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        if(userID){
            io.to(userID).emit("unmute audio", "");
        }
    })



    //////////////////////chat room/////////////////////////
    socket.on("message", data=>{
        const roomID = userRoom[socket.id],
        messageObj = {
            //instead of id being the socket id, it should be th userName of the user
            msg: data, 
            id: socket.id,
            uuId: uuidv4()
        }
        //add the message obj to the roomMessages object>array
        //sheck if this room's messages exist, if not create one with the new message
        if(roomMessages[roomID]){
            roomMessages[roomID].push(messageObj) 
        }else{
            roomMessages[roomID] = [messageObj]
        }
        //send to the room
        io.to(roomID).emit("message", messageObj);
    })

    socket.on("typing", data=>{
        const roomID = userRoom[socket.id];
        socket.to(roomID).emit("typing", socket.id);
    })

    socket.on("stopped typing", data=>{
        const roomID = userRoom[socket.id];
        socket.to(roomID).emit("stopped typing", "");
    })

    socket.on("message deleted", data=>{
        const roomID = userRoom[socket.id];
        //delete the messages from the roomMessages array;
        const deletedMsgId = data;
        const newArr = roomMessages[roomID].filter(obj=>obj.uuId !== deletedMsgId);
        roomMessages[roomID] = newArr;
        io.to(roomID).emit("message deleted", deletedMsgId);
    })

    //listen to request for the room's messages
    socket.on("room messages", data=>{
        //find the messages array
        let messagesArr;
        const roomID = userRoom[socket.id];
        console.log(userRoom)
        if(roomMessages[roomID]){
            messagesArr = roomMessages[roomID];
        }else{
            messagesArr = [];
        }
        // console.log(messagesArr)
        //send back the room's messages to that specific user
        socket.emit("room messages", messagesArr);
    })

    //////////////////yt share
    //listen to stopYT session message
    socket.on("startYTSession", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        io.to(userID).emit("startYTSession", "");
    })

    //listen to myIframeReady meassage
    socket.on("myIframeReady", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        io.to(userID).emit("peerIframeReady", "")  
    })

    //listen to request for a playlist
    socket.on("Fetch playlist", data=>{
        console.log(data)
        // io.to(socket.id).emit("axios resp", "hello")
        fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${data}&key=${process.env.YT_API_KEY}`).then(resp=>{
             return resp.json()
        
          }).then(resp=>{
              console.log(resp);
              io.to(socket.id).emit("playlist resp", resp)
          }).catch(e=>{
              console.log(e)
          })
    })

    ///////////////////screen share
    socket.on("sending signal SS", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        io.to(userID).emit("caller sending signal SS", {
            signal: data.signal,
            callerID: socket.id
        })
    })

    socket.on("returning signal SS", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        io.to(userID).emit("recipient returned signal SS", {
            signal: data.signal
        })
    })

    
    socket.on("connection made SS", data=>{
        const roomID = userRoom[socket.id];
        const userID = rooms[roomID].find(id=> id !== socket.id);
        io.to(userID).emit("connection made SS", "")
    });
    ////////////////////////live canvas
    socket.on("hello", (data)=>{

        console.log(data)
    });
    socket.on("draw", data=>{
        const roomID = userRoom[socket.id];
       socket.to(roomID).emit("draw", data);
 
    })

    socket.on("erase", data=>{
        const roomID = userRoom[socket.id];
            socket.to(roomID).emit("erase", data);
        
    });

    socket.on("unerase", data=>{
        const roomID = userRoom[socket.id];
        socket.to(roomID).emit("unerase", data);
    });

    socket.on("clear", data=>{
        const roomID = userRoom[socket.id];
        socket.to(roomID).emit("clear");
    });

    socket.on("scroll", data=>{
        const roomID = userRoom[socket.id];
        socket.to(roomID).emit("scroll", data);
    });


    ////////////New fileshare;

    socket.on("upload complete", ()=>{
        socket.broadcast.emit("end upload") //to peer 2
    })

    socket.on("request new slice from peer", data=>{
        socket.broadcast.emit("new slice request", data);
    });

    socket.on("slice upload", data=>{
        console.log("received slice", data);
      //send slice to the other client
      socket.broadcast.emit("slice received", data);


    //   if(!files[data.name]){
    //       files[data.name] = Object.assign({}, struct, data);
    //       files[data.name].data = []
    //       console.log(files[data.name]);
    //   }

    //   const newBuffer = Buffer.from(new Uint8Array(data.data));
    //   console.log(newBuffer);
    //   console.log(typeof(newBuffer))

    //   ///push it
    //   files[data.name].data.push(newBuffer);
    //   ///increment the slice prop
    //   files[data.name].slice++;

    //   if(files[data.name].slice * 100000 >= files[data.name].size){
    //       ///send the file to the other client
    //       console.log(files[data.name].data);
    //       console.log("the file upload is complete");
    //       socket.emit("upload complete", "")
    //       var fileBuffer = Buffer.concat(files[data.name].data); 
    
    //       fs.writeFile(__dirname + '/tmp/'+ data.name, fileBuffer, (err) => { 
    //           delete files[data.name]; 
              
    //           if (err){
    //               console.log(err)
    //             return socket.emit('upload error'); 
    //           } else{
    //             socket.emit("upload ended")
    //           }
    //       });
    //   }else{
    //       ///the file upload is not complete, ask for another slice from the client
    //       socket.emit("new slice request", {
    //           currentSlice: files[data.name].slice
    //       })      
    //   }



    })

    

})
