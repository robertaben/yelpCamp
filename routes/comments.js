const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");

// NEW Comment
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (error, campground) => {
        error ? console.log(error) : res.render("comments/new", {campground: campground});
    });
});

// CREATE Comment
router.post("/", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (error, campground) => {
        if (error) {
            console.log(error);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, (error, comment) => {
                if (error) {
                    console.log(error);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "You have successfully created a comment!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// EDIT comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (error, foundCampground) => {
        if (error || !foundCampground) {
            req.flash("error", "Campground is not found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (error, foundComment) => {
            if (error) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// UPDATE comment
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (error, updatedComment) => {
        if (error) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DELETE (destroy) comment
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (error) => {
        if (error) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;
