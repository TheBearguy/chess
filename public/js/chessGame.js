const socket = io()
socket.emit("frontend-data")
socket.on("filtered-frontend-data", function () {
    console.log("filtered-frontend-data received");
})