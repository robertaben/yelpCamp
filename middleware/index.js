const Campground = require("../models/campground");
const Comment = require("../models/comment");

const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, (error, foundCampground) => {
            if(error || !foundCampground) {
                req.flash("error", "Campground is not found!");
                res.redirect("back");
            } else {
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login to make this action");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (error, foundComment) => {
            if(error || !foundComment) {
                req.flash("error", "Comment is not found!");
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login to make this action");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash("error", "Please Login First!");
        res.redirect("/login");
    }
};

module.exports = middlewareObj;