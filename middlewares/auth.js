const ensureAuth = (req, res, next) => {
   if (req.isAuthenticated()) {
     next();
   } else {
     res.status(401);
     next("User not yet authenticated");
   }
}

module.exports = {
  ensureAuth,
};
