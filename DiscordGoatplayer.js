const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');

const client = new Discord.Client();

client.login(fs.readFileSync("token.txt", 'utf8').trim());

var audioConnection;

var playlist = [];
var dispatcher = -1;
var voiceChannel = -1;
var repeat = false;

client.on('ready', function() {
    console.log('discord app init');

    var channels = client.guilds.first().channels.array();
    for (var i in channels) {
        var channel = channels[i];
        if (channel.type === 'voice') {
            voiceChannel = channel;
            break;
        }
    }
});

client.on('message', function(message) {
    if (!message.author.bot) {
        var msgArray = message.content.split(' ');
        var command = msgArray[0];
        if (command === "!add") {
            if (msgArray.length > 0) {
                playlist.push(msgArray[1]);
                if (dispatcher === -1) {
                    voiceChannel.join().then(function (connection) {
                        audioConnection = connection;
                        playNext();
                    });
                }
            }
        } else if (command === "!skip") {
            if (dispatcher !== -1) {
                dispatcher.end();
            }
        } else if (command === "!repeat") {
            repeat = !repeat;
            message.channel.sendMessage("repeat: " + repeat);
        }
    }
});

function playNext() {
    if (playlist.length > 0) {
        var nextLink = playlist.pop();
        var stream = ytdl(nextLink, { filter : 'audioonly', highWaterMark: 32768 });
        dispatcher = audioConnection.playStream(stream);
        dispatcher.setVolume(1);
        dispatcher.on('end', function() {
            if (repeat) {
                playlist.push(nextLink);
            }
            playNext();
        });
    } else {
        dispatcher = -1;
        voiceChannel.leave();
    }
}