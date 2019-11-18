const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");
const NodeGeocoder = require("node-geocoder");

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

const geocoder = NodeGeocoder(options);

// INDEX - show all campgrounds
router.get("/", (req, res) => {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        // Get all campgrounds from DB
        Campground.find({name: regex}, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length < 1) {
                    noMatch = "No campgrounds match that query, please try again.";
                }
                res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
            }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
            }
        });
    }
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            console.log(err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        const lat = data[0].latitude;
        const lng = data[0].longitude;
        const location = data[0].formattedAddress;
        const newCampground = {
            name: name,
            image: image,
            price: price,
            description: desc,
            author: author,
            location: location,
            lat: lat,
            lng: lng
        };
        // Create a new campground and save to DB
        Campground.create(newCampground, function (err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
    });
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// SHOW - shows more info about campground
router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((error, foundCampground) => {
        if (error || !foundCampground) {
            req.flash("error", "Campground is not found!");
            res.redirect("back");
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (error, foundCampground) => {
        error ? res.redirect("/campgrounds") : res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE campground
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    geocoder.geocode(req.body.location, (error, data) => {
        if (error || !data.length) {
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success", "Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    });
});

// DELETE (DESTROY) campground route
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (error) => {
        error ? res.redirect("/campgrounds") : res.redirect("/campgrounds/");
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
