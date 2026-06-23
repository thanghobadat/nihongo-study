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
    
    const isMockMode = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder');
    if (isMockMode && !token.startsWith('mock-token-')) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token format in local mock mode' });
    }
    
    // Allow mock bypass for local testing if header starts with mock-token-
    if (token.startsWith('mock-token-')) {
      const userId = token.replace('mock-token-', '').replace('-admin', '');
      
      // Look up user in local JSON database
      let localUser = null;
      try {
        const fs = require('fs');
        const path = require('path');
        const usersFile = path.join(__dirname, '../db/users.json');
        if (fs.existsSync(usersFile)) {
          const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
          localUser = users.find(u => u.id === userId || u.email === userId);
        }
      } catch (err) {
        console.error('Error reading local users.json:', err);
      }

      if (localUser) {
        req.user = {
          id: localUser.id,
          email: localUser.email,
          role: localUser.role,
          displayName: localUser.displayName,
          isMock: true
        };
      } else {
        // Fallback for default mock tokens
        const mockRole = token.includes('-admin') ? 'admin' : 'user';
        req.user = {
          id: userId,
          email: mockRole === 'admin' ? 'admin@nihongoflow.com' : 'user@nihongoflow.com',
          role: mockRole,
          isMock: true
        };
      }
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
