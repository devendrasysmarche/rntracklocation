const socketIOClient = require('socket.io-client');
const socketOrderId = "3"
const SOCKET_SERVER_URL = "https://map-tracker-rn.herokuapp.com" // "http://localhost:4000"
const NEW_CHAT_MESSAGE_EVENT = "newLocationFound"; // Name of the event

let orderid = socketOrderId ? socketOrderId: "1"
const socketRef = socketIOClient(SOCKET_SERVER_URL, {
    query: {orderid} ,
});
console.log('Initialize socket', orderid);

// Listens for incoming messages
socketRef.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
    console.log('Received Socket', message);
    const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.orderid === socketRef.id,
    };
    console.log('incomingMessage', incomingMessage);
    // setMessages((messages) => [...messages, incomingMessage]);
});

// socketRef.on(orderid).emit(NEW_CHAT_MESSAGE_EVENT, {"orderid":orderid, "test": "client"});

async function callAsyncRoute() {
    let DataLatLon = require('./constants/latlondata.json');
    let count = DataLatLon.length
    let list = DataLatLon
    // console.log('list', count, list);
    var i = 0;                  

    const sendLoc = (latlon, i) =>  {
        console.log('hellorn', i, latlon);   
        socketRef.on(orderid).emit(NEW_CHAT_MESSAGE_EVENT, {"orderid":orderid, "latlon":latlon});
        // req.app.get('io').emit(NEW_CHAT_MESSAGE_EVENT, {"orderid":req.params?.id, "latlon":latlon});
    }

    function myLoop() {         
        setTimeout(function() {   
            //  your code here
            if (list[i]) {
                list[i]['orderid'] = ""+orderid
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