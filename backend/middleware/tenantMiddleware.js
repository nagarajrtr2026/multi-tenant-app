const tenantMiddleware = (req, res, next) => {
  if (!req.user || !req.user.org_id) {
    return res.status(403).json({ error: 'Tenant context missing.' });
  }
  
  // Attach org_id to the request object for easy access in controllers
  req.tenantId = req.user.org_id;
  next();
};

module.exports = tenantMiddleware;
