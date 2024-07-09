const express = require('express');
const socket = require('socket.io');
const http = require("http");
const {Chess} = require("chess.js")
const path = require("path")

// express is a middleware framework built on top of nodejs ka http server (its not a server itself)
// consider it as a syntactic sugar + some additional features for interacting with the http server of nodejs directly
const app = express();
// express does not disclose the http server it is working on
// but socket.io requires a http server to function, so create another http server
const server = http.createServer(app); 
const io = socket(server); // initialising the socket functionality for the server
// server = httpserver, 
// app = express app instance
const chess = new Chess();

let players = {

}
let currentPlayer = "W"

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
    res.render("index")
})
// User Alice sends the data to the server | Server has 4 options 
// 1. Send the data to the same user 
// 2. Send the data to some other unique user => Specific Chat
// 3. Send the data to all the user including Alice => Group Chat
// 4. Send the data to all the users except Alice himself - Broadcasting => in chat "typing" is displayed to other users, but not to the sender
// whenever some event is captured, an object of unique details is generated / received => that contains some imp info about the socket event 
io.on("connection", function (uniqueSocket) { // "connection" is just a name of the event
//    uniqueSocket = It's an object that contains methods and properties specific to that particular connection.
    console.log("ws connected - from server");
    uniqueSocket.on("frontend-data", () => {
        console.log("frontend-data received - from server");
        // To send the data to all users except Alice himself: Broadcasting: 
        // io.emit("filtered-frontend-data")
    })
})

// the entry point for the user is "server" not "app"
server.listen(3000, function () {
    console.log(`Http Server is listening on port 3000`);
})