import axios from "axios"
import {Client, Message} from "@concurrent-world/client";
import {SimpleNote} from "@concurrent-world/client/dist/cjs/schemas/simpleNote";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;


// concurrent settings
const userAddress = process.env.CCID;
const privateKey = process.env.PRIVATE_KEY;
const host = process.env.CONCURRENT_HOST;
const clientSig = "spotify4concurrent";
const postStreams = process.env.CONCURENT_POST_STREAMS.split(',');


const client = new Client(host, {privatekey: privateKey, publickey: userAddress}, clientSig);

const concurrentUser = await client.getUser(userAddress)
const homeStream = concurrentUser.userstreams.payload.body.homeStream

const streamSocket = await client.newSocket();

streamSocket.listen([homeStream], async (e) => {
    if (e.type === "MessageCreated") {
        const message = await client.getMessage(e.body.id, e.body.owner)
        if (message.body && message.body.startsWith("/np")) {
            const nowPlaying = await getNowPlaying(false)
            if (nowPlaying) {
                await message.reply(e.body.streams, nowPlaying)
            } else {
                await message.reply(e.body.streams, "I'm not listening to anything")
            }
        }
    }
})

// streamSocket.on("MessageCreated", async (e) => {
//     const message = await client.getMessage(e.id, e.owner)
//     if (message.body && message.body.startsWith("/np")) {
//         const nowPlaying = await getNowPlaying(false)
//         const replyStream = message.streams.map(stream => stream.id)
//         if (nowPlaying) {
//             await client.reply(e.id, e.owner, replyStream, nowPlaying)
//         } else {
//             await client.reply(e.id, e.owner, replyStream, "I'm not listening to anything")
//         }
//     }
// })

const redirectUri = 'http://localhost:3000/callback';

let accessToken = null;

const getToken = async () => {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            params: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        accessToken = response.data.access_token;
        console.log("update access token")
    } catch (error) {
        console.error('Error retrieving access token:', error);
    }
}


let lastSongId = null
const checkNowPlaying = async () => {
    const nowPlaying = await getNowPlaying()
    if (nowPlaying) {
        await client.createCurrent(nowPlaying, postStreams, {});
    }
}

const getNowPlaying = async (updateLastSong = true) => {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        const data = response.data
        if (!data || !data.is_playing) {
            return
        }

        const songId = data.item.id
        const songName = data.item.name
        const artistNames = data.item.artists.map(artist => artist.name)
        const thumbnailUrl = data.item.album.images[0].url
        const songUrl = data.item.external_urls.spotify

        if(updateLastSong){
            if (songId === lastSongId) {
                return
            }
            lastSongId = songId
        }

        return `I'm listening to ${songName} by ${artistNames.join(",")} \n [🎵open spotify🎵](${songUrl}) \n ![](${thumbnailUrl})`

    } catch (error) {
        console.error('Error retrieving currently playing track:', error);
        return null
    }
}


await getToken()
setInterval(getToken, 30 * 60 * 1000);

await checkNowPlaying()
setInterval(checkNowPlaying, 10 * 1000)
