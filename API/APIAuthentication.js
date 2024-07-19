//API authentication (middleware)
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) { // Assuming req.isAuthenticated() is available
        next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        res.status(401).send("User is not authenticated"); // User is not authenticated, send an error response
    }
}

module.exports = { isAuthenticated };