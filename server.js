const express = require("express");
const cors = require("cors");
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());

// ✅ Home route
app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});


// 🎧 DOWNLOAD ROUTE (UPDATED - NO yt-dlp)
app.get("/download", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send("URL is required");
    }

    try {
        res.header("Content-Disposition", "attachment; filename=audio.mp3");

        const stream = ytdl(url, { quality: "highestaudio" });

        ffmpeg(stream)
            .audioBitrate(128)
            .format("mp3")
            .on("error", (err) => {
                console.error("FFmpeg error:", err);
                res.status(500).send("Conversion failed");
            })
            .pipe(res, { end: true });

    } catch (error) {
        console.error("Download error:", error);
        res.status(500).send("Download failed");
    }
});


// 🎬 VIDEO INFO ROUTE (PREVIEW)
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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});