import axios from "axios"
import express from "express";

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;


const redirectUri = 'http://localhost:3000/callback';

app.get('/login', (req, res) => {
    res.redirect(
        'https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + clientId +
        '&scope=user-read-currently-playing' +
        '&redirect_uri=' + encodeURIComponent(redirectUri)
    );
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const refresh_token = response.data.refresh_token;
        res.send(`Authentication successful! Your refresh token is ${refresh_token}`);
        console.log(`Authentication successful! Your refresh token is ${refresh_token}`)
    } catch (error) {
        res.status(500).send('Error authenticating with Spotify');
        console.log("Error authenticating with Spotify:", error)
    }
});

// サーバーを起動
app.listen(3000, () => {
    console.log('Server listening on port 3000');
    console.log("login url: http://localhost:3000/login")
});
