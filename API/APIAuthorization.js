const { getUserPermissions } = require("../CRUD/user");

const RoleLevel = {
    "ADMIN": 2,
    "AUDITOR": 1,
    "EVENTCOORDINATOR": 0
}

//API authorization (flexible permission addition)
async function checkPermission(req, res, next) {
    const permission = await getUserPermissions(req.user);
    if(!permission){
        return res.status(401).send("User is not authenticated");
    }
    req.permission = permission.permisson;
    req.permissionLevel = RoleLevel[req.permission];
    next();
}

function checkLevel(req, res, requiredLevel, next){
    if(req.permissionLevel < requiredLevel){
        return res.status(403).send("User does not have permission");
    }
    next();
}

module.exports = { checkPermission };