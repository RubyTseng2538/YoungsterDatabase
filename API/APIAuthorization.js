const { getEvent, getEventsByUser } = require("../CRUD/event");
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
        const user = req.cookies.user;
        const permission = await getUserPermissions(user.id);
        if(!permission){
            return res.status(401).send("User is not authorized");
        }
        req.permission = permission.permission;
        req.permissionLevel = RoleLevel[req.permission];
        // Check if user's level meets the required level
        if (req.permissionLevel >= requiredLevel) {
            next(); // Permission granted, proceed to the next middleware/route handler
        } else {
            res.status(403).send("Insufficient permissions"); // Permission denied
        }
    };
}

async function eventCoordinators(req, res, next) { 
    if (req.permissionLevel == 0){
        const events = await getEventsByUser(req.user);
        req.eventIds = [];
        console.log(events);
        for(let i = 0; i < events.length; i++){
            req.eventIds.push(events[i].id);
        }
        next();
    }

}

module.exports = { checkPermissionLevel, eventCoordinators };