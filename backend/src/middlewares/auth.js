const supabase = require('../db/supabase');

// Short-lived in-memory cache + single-flight deduplication for verified JWTs
const AUTH_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
const MAX_AUTH_CACHE_SIZE = 500;
const authCache = new Map();
const authInFlight = new Map();

function getJwtExpMs(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch (_) {
    return null;
  }
}

function invalidateAuthCache(userIdOrToken) {
  if (!userIdOrToken) {
    authCache.clear();
    return;
  }
  if (authCache.has(userIdOrToken)) {
    authCache.delete(userIdOrToken);
    return;
  }
  for (const [tok, entry] of authCache.entries()) {
    if (entry?.user?.id === userIdOrToken) {
      authCache.delete(tok);
    }
  }
}

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

    const now = Date.now();
    const expMs = getJwtExpMs(token);
    if (expMs !== null && now >= expMs) {
      authCache.delete(token);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token', code: 'TOKEN_EXPIRED' });
    }

    const cached = authCache.get(token);
    if (cached && now < cached.expiresAt) {
      req.user = { ...cached.user };
      return next();
    }

    let verifyPromise = authInFlight.get(token);
    if (!verifyPromise) {
      verifyPromise = (async () => {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          return null;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, display_name')
          .eq('id', user.id)
          .maybeSingle();

        const resolvedUser = {
          id: user.id,
          email: user.email,
          role: profile ? profile.role : 'user',
          displayName: profile ? profile.display_name : null
        };

        const ttlExpiry = Date.now() + AUTH_CACHE_TTL_MS;
        const expiresAt = expMs !== null ? Math.min(ttlExpiry, expMs - 1000) : ttlExpiry;
        if (expiresAt > Date.now()) {
          if (authCache.size >= MAX_AUTH_CACHE_SIZE) {
            const oldestKey = authCache.keys().next().value;
            if (oldestKey) authCache.delete(oldestKey);
          }
          authCache.set(token, { user: resolvedUser, expiresAt });
        }
        return resolvedUser;
      })().finally(() => {
        authInFlight.delete(token);
      });
      authInFlight.set(token, verifyPromise);
    }

    const verifiedUser = await verifyPromise;
    if (!verifiedUser) {
      authCache.delete(token);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token', code: 'TOKEN_EXPIRED' });
    }

    req.user = { ...verifiedUser };
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
  requireAdmin,
  invalidateAuthCache
};
