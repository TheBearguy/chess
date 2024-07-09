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
let currentPlayer = "w"

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
    // uniqueSocket.on("disconnect", function () {
    //     console.log("ws disconnected - from server");
    // })
    
    if (!players.white) {
        players.white = uniqueSocket.id
        uniqueSocket.emit("playerRole", "w")
    } else if (!players.black) {
        players.black = uniqueSocket.id
        uniqueSocket.emit("playerRole", "b")
    } else {
        uniqueSocket.emit("spectatorRole")
    }

    uniqueSocket.on("disconnect", function () {
        if (uniqueSocket.id === players.white) {
            delete players.white
        } else if (uniqueSocket.id === players.black) {
            delete players.black
        }
    })

    uniqueSocket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && uniqueSocket.id !== players.white) {
                return
            }
            if (chess.turn() === "b" && uniqueSocket.id !== players.black) {
                return
            }
            
            const result = chess.move(move)
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen())
            } else {
                console.log("invalid move", move);
                uniqueSocket.emit("invalidMove", move )
            }
        } catch (error) {
            console.log(error);
            uniqueSocket.emit("invalid move: ", move);
        }
    })

})

// the entry point for the user is "server" not "app"
server.listen(3000, function () {
    console.log(`Http Server is listening on port 3000`);
})