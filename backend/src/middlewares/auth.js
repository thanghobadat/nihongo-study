const supabase = require('../db/supabase');

/**
 * Middleware to require authentication via Supabase JWT
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    
    // In test environment, allow mock bypass if headers are present
    if (process.env.NODE_ENV === 'test' && token.startsWith('mock-token-')) {
      const mockRole = token.includes('-admin') ? 'admin' : 'user';
      req.user = {
        id: token.replace('mock-token-', '').replace('-admin', ''),
        email: mockRole === 'admin' ? 'admin@nihongoflow.com' : 'user@nihongoflow.com',
        role: mockRole
      };
      return next();
    }

    // Call Supabase Auth to get the user from JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Query user profile to get the custom role ('admin' or 'user')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile ? profile.role : 'user',
      displayName: profile ? profile.display_name : null
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

/**
 * Middleware to require admin privilege
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
