const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const ytdl = require("@distube/ytdl-core");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});


// 🎧 DOWNLOAD ROUTE
app.get("/download", (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send("URL is required");
    }

    const fileName = "audio.mp3";
    const filePath = path.join(__dirname, fileName);

    const command = `yt-dlp -x --audio-format mp3 -o "${filePath}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Error:", error);
            return res.status(500).send("Download failed");
        }

        res.download(filePath, "audio.mp3", (err) => {
            if (err) {
                console.error("Download error:", err);
            }

            fs.unlink(filePath, (err) => {
                if (err) console.error("Delete error:", err);
            });
        });
    });
});


// 🎬 VIDEO INFO ROUTE (Preview)
app.get("/info", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send("URL required");
    }

    try {
        const info = await ytdl.getInfo(url);

        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch info");
    }
});


app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
});