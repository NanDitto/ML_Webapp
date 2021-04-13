const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const fs = require('fs')

let numUsers = 0;
let currentCountdown = 3;
let numImages = 0;

let receivedImages = []
let firstSocket = null

const possibles = ['Rock', 'Paper', 'Scissors']

function selectRandom() {
    return possibles[Math.floor(Math.random() * 3)]
}

function selectWinner(picks) {
    var a = picks[0]
    var b = picks[1]

    if (a == 'Rock') {
        if (b == 'Rock') {
            return -1
        } else if (b == 'Paper') {
            return 1
        } else if (b == 'Scissors') {
            return 0
        }
    } else if (a == 'Paper') {
        if (b == 'Rock') {
            return 0
        } else if (b == 'Paper') {
            return -1
        } else if (b == 'Scissors') {
            return 1
        }
    } else if (a == 'Scissors') {
        if (b == 'Rock') {
            return 1
        } else if (b == 'Paper') {
            return 0
        } else if (b == 'Scissors') {
            return -1
        }
    }
}

let intervalId
function startCountdown() {
    intervalId = setInterval(() => {
        if (currentCountdown == 0) {
            clearInterval(intervalId)
            io.emit('snap_photo')
            return
        }
        io.emit('countdown_update', currentCountdown)
        currentCountdown--
    }, 1000)
}

let timeoutId

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//app.get('/', (req, res) => res.sendFile(__dirname+'/model/model.json'))


io.on('connection', (socket) => {
    numUsers++;
    console.log('num users: ', numUsers)
    
    if (numUsers == 2) {
        // start game
        io.emit('game_start')
        startCountdown();
    }

    socket.on('challenge_photo', (data) => {
        socket.broadcast.emit('opponent_photo', data)
        const buffer = Buffer.from(data, 'base64')

        // TODO: do tensorflow stuff
        if (!receivedImages.length) {
            receivedImages.push(selectRandom())
            firstSocket = socket
        } else {
            receivedImages.push(selectRandom())
            const winner = selectWinner(receivedImages)

            const resultA = {
                you: receivedImages[0],
                opponent: receivedImages[1]
            }
            const resultB = {
                you: receivedImages[1],
                opponent: receivedImages[0]
            } 
            
            if (winner == 0) {
                resultA.winner = 'You'
                resultB.winner = 'Opponent'
            } else if (winner == 1) {
                resultA.winner = 'Opponent'
                resultB.winner = 'You'
            } else {
                resultA.winner = 'Tie'
                resultB.winner = 'Tie'
            }
            
            firstSocket.emit('result', resultA)
            socket.emit('result', resultB)

            currentCountdown = 3
            receivedImages = []
            timeoutId = setTimeout(() => {
                io.emit('game_start')
                startCountdown()
            }, 3000)

        }

        
                
        // fs.writeFile('./tmp/' + numImages + '.png', buffer, function(err) {
        //     if (err) {
        //         return console.log(err)
        //     }
        //     console.log('saved image')
        //     numImages++
        // })
    })
    
    socket.on('disconnect', () => {
        numUsers--;
        if (numUsers < 2) {
            currentCountdown = 3;
            receivedImages = [];
            clearInterval(intervalId);
            clearInterval(timeoutId);
            io.emit('game_start')
        }
        console.log('num users: ', numUsers)
    })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});


/*
  - person connects - done
  - another person connects - done
  - frontend: activate webcams - done
  - wait for webcam event
  - start game
  - send events 3, 2, 1, 0
  - on 0, take a picture on client
  - send pictures
  - compare with model
  - send winner
  - reset game
*/
