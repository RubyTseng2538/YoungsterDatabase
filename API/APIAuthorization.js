const { getUserPermissions } = require("../CRUD/user");

const RoleLevel = {
    "ADMIN": 2,
    "AUDITOR": 1,
    "EVENTCOORDINATOR": 0
}

//API authorization (flexible permission addition)
function checkPermissionLevel(requiredLevel) {
    return async function(req, res, next) {
        // Assuming user's role is stored in req.user after authentication
        const permission = await getUserPermissions(req.user);
        if(!permission){
            return res.status(401).send("User is not authenticated");
        }
        req.permission = permission.permisson;
        req.permissionLevel = RoleLevel[req.permission];
        // Check if user's level meets the required level
        if (req.permissionLevel >= requiredLevel) {
            next(); // Permission granted, proceed to the next middleware/route handler
        } else {
            res.status(403).send("Insufficient permissions"); // Permission denied
        }
    };
}

module.exports = { checkPermissionLevel };