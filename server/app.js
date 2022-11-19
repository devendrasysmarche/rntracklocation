const http = require("http");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 80;
app.set("port", PORT);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/** Create HTTP server. */
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const NEW_CHAT_MESSAGE_EVENT = "newLocationFound";

io.on("connection", (socket) => {
  
  // Join a conversation
  const  roomId  = socket.handshake.query?.orderid; // ?.orderid;
  console.log('roomId', roomId, socket.handshake.query);
//   console.log('roomId', roomId, socket.handshake.query?.orderid);
  socket.join(roomId);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    console.log('listen', data);
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // check
  socket.on("message", () => {
    console.log('Connected!');
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    socket.leave(roomId);
  });
});
app.set('io', io);


// apis
app.get('/', (req, res) => {
    
    console.log('Service is running!!!');
    res.send({
        success: true,
        code: 200,
        message: 'Service is running!!!'
    }).status(200)
});
app.get('/order/:id', (req, res) => {
    
    console.log('Request order', req.params);
    async function callAsyncRoute() {
        let DataLatLon = require('./constants/latlondata.json');
        let count = DataLatLon.length
        let list = DataLatLon
        // console.log('list', count, list);
        var i = 0;                  

        const sendLoc = (latlon, i) =>  {
            console.log('hellorn', i, latlon);   
            req.app.get('io').emit(NEW_CHAT_MESSAGE_EVENT, {"orderid":req.params?.id, "latlon":latlon});
        }

        function myLoop() {         
            setTimeout(function() {   
                //  your code here
                if (list[i]) {
                    list[i]['orderid'] = ""+req.params?.id
                    sendLoc(list[i], i);
                }
                i++;         
                if (i < count) {
                    myLoop();
                }                     
            }, 1000)
        }

        myLoop();          
    }
    callAsyncRoute()
    res.send({
        success: true,
        code: 200,
        message: 'API endpoint exist'
    }).status(200)
});

  
/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
    return res.status(404).json({
      success: false,
      code: 404,
      message: 'API endpoint doesnt exist'
    })
});

/** Listen on provided port, on all network interfaces. */
server.listen(PORT);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
  console.log(`Listening on port:: http://localhost:${PORT}/`)
});