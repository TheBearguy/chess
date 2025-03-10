const socket = io()
// socket.emit("frontend-data")
// socket.on("filtered-frontend-data", function () {
//     console.log("filtered-frontend-data received");
// })
const chess = new Chess()
const boardElement = document.querySelector(".chessboard");
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square", 
                (rowIndex + squareIndex) %2 === 0 ? "light" : "dark"
            );
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div")
                pieceElement.classList.add(
                    "piece", 
                    square.color === "w" ? "white": "black"
                );
                pieceElement.innerText = getPieceUnicode(square); // unicode of the piece
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = {
                            row: rowIndex, 
                            col: squareIndex
                        };
                        e.dataTransfer.setData("text/plain", "");
                    }

                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare: null;
                });
                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        row : parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSource);
                }
            });
            boardElement.appendChild(squareElement)
        });

    });
    if (playerRole === 'b') {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    // Implement move logic here
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q' 
    }
    socket.emit("move", move)
    console.log("Move from", source, "to", target);
    renderBoard(); // Re-render the board after a move
  };
  
  const getPieceUnicode = (piece) => {
    const unicodePieces = {
        'k': '♔',
        'K': '♚',
        'q': '♕',
        'Q': '♛',
        'r': '♖',
        'R': '♜',
        'b': '♗',
        'B': '♝',
        'n': '♘',
        'N': '♞',
        'p': '♙',
        'P': '♟'
      };
    return unicodePieces[piece.type] || ""
  };

socket.on("playerRole", function(role) {
    playerRole = role;
    renderBoard();
})

socket.on("spectatorRole", function () {
    playerRole = null;
    renderBoard();
})

socket.on("boardState", function() {
    chess.load(fen);
    renderBoard();
})

socket.on("move", function(move) {
    chess.move(move);
    renderBoard();
})

renderBoard();