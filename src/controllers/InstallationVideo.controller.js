const InstallationVideo = require("../models/InstallationVideo.model.js");

// ✅ Create Installation Video
const createInstallationVideo = async (req, res) => {
  try {
    const { title, description, channelName } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "Please upload a video file" });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    const videoPath = videoFile.location; // ✅ Linode S3 URL
    const thumbnailPath = thumbnailFile ? thumbnailFile.location : null;

    const newVideo = new InstallationVideo({
      title,
      description,
      channelName,
      videoPath,
      thumbnail: thumbnailPath,
      createdBy: req.userId || null,
    });

    await newVideo.save();

    res.status(201).json({
      message: "Video uploaded successfully",
      data: newVideo,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Installation Videos
const getAllInstallationVideos = async (req, res) => {
  try {
    const videos = await InstallationVideo.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { createInstallationVideo, getAllInstallationVideos };
