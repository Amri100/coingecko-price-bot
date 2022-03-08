// A server that keeps the discord bot alive via regular pings
// from https://replit.com/talk/learn/Hosting-discordjs-bots-on-replit-Works-for-both-discordjs-and-Eris/11027
const express = require('express');


const server = express();

// Request handler
server.all('/', (req, res) => {
    res.send('Server is up and running.')
})

// Listener function
function keepAlive(){
    server.listen(3000, ()=>{console.log("Server is Ready!")});
}

module.exports = keepAlive;
