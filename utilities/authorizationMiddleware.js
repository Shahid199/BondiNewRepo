'use strict';
const roles = require('./roles');
/**
 * Authenticate then Authorize route
 * @param {Array} roles 
 * @returns next() | res
 */
const authorize = (allowedRoles = ['superadmin']) => {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            const currentRole = roles[req.user.role];
            if(allowedRoles.includes(currentRole)){
                return next();
            }
        }
        return res.status(403).send("Unauthorized");
    }
}

module.exports = authorize;