const mongoose = require("mongoose");

const campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {type: Date, default: Date.now},
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

module.exports = mongoose.model("Campground", campgroundSchema);