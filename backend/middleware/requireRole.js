const requireRole = (role) => {
  return (req, res, next) => {
    try {
      const userRole = req.admin?.role;
      if (!userRole) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      if (userRole !== role) {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient privileges' });
      }
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
};

export default requireRole;
