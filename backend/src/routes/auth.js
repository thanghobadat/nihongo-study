const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth');

/**
 * POST /api/auth/register
 * Register a new user in Supabase Auth (default role is 'user')
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const role = 'user'; // Mặc định luôn là 'user'

    // Kiểm tra xem có đang chạy chế độ Mock Local (không cấu hình Supabase thực tế)
    const isMockMode = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder');
    if (isMockMode) {
      const fs = require('fs');
      const path = require('path');
      const usersFile = path.join(__dirname, '../db/users.json');
      
      let users = [];
      if (fs.existsSync(usersFile)) {
        users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      }

      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ error: 'Email đã được đăng ký.' });
      }

      const newUser = {
        id: 'user-' + Date.now(),
        email: email.toLowerCase(),
        password, // Lưu text thô để test cục bộ dễ dàng
        displayName: displayName || email.split('@')[0],
        role
      };
      
      users.push(newUser);
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

      // Thêm học sinh vào mockDb.students để hiển thị đồng bộ ở trang admin
      const mockDb = require('../db/mockDb');
      if (mockDb && mockDb.students) {
        mockDb.students.push({
          id: newUser.id,
          email: newUser.email,
          display_name: newUser.displayName,
          created_at: new Date().toISOString()
        });
      }

      return res.status(201).json({
        message: 'Đăng ký thành công (Local Mock Mode)!',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          user_metadata: {
            display_name: newUser.displayName,
            role: newUser.role
          }
        },
        session: {
          access_token: `mock-token-${newUser.id}`
        }
      });
    }

    // Call Supabase signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          display_name: displayName || email.split('@')[0]
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email for a confirmation link.',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * POST /api/auth/login
 * Sign in a user with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Kiểm tra xem có đang chạy chế độ Mock Local
    const isMockMode = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder');
    if (isMockMode) {
      const fs = require('fs');
      const path = require('path');
      const usersFile = path.join(__dirname, '../db/users.json');
      
      let users = [];
      if (fs.existsSync(usersFile)) {
        users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      }

      const user = users.find(u => 
        (u.email.toLowerCase() === email.toLowerCase() || 
         (u.displayName && u.displayName.toLowerCase() === email.toLowerCase())) 
        && u.password === password
      );
      if (!user) {
        return res.status(400).json({ error: 'Tài khoản hoặc mật khẩu không đúng.' });
      }

      return res.json({
        message: 'Đăng nhập thành công (Local Mock)!',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          user_metadata: {
            display_name: user.displayName,
            role: user.role
          }
        },
        session: {
          access_token: `mock-token-${user.id}${user.role === 'admin' ? '-admin' : ''}`
        }
      });
    }

    // Call Supabase signIn
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Login successful!',
      user: data.user,
      session: data.session // contains access_token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Kiểm tra xem có đang chạy chế độ Mock Local
    const isMockMode = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder');
    if (isMockMode) {
      const fs = require('fs');
      const path = require('path');
      const usersFile = path.join(__dirname, '../db/users.json');
      
      let users = [];
      if (fs.existsSync(usersFile)) {
        users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      }

      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userExists) {
        return res.status(400).json({ error: 'Không tìm thấy tài khoản với email này.' });
      }

      return res.json({
        message: 'Mã đặt lại mật khẩu đã được gửi (Local Mock Mode)!',
        mockToken: `mock-token-${email}`
      });
    }

    // Gửi email reset mật khẩu
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.origin || 'http://localhost:3000'}/reset-password`
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Password reset link sent to your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to request password reset' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password (uses user access_token passed in Authorization header)
 */
router.post('/reset-password', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Kiểm tra chế độ Mock Local
    if (req.user.isMock) {
      const fs = require('fs');
      const path = require('path');
      const usersFile = path.join(__dirname, '../db/users.json');
      
      let users = [];
      if (fs.existsSync(usersFile)) {
        users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      }

      const userIndex = users.findIndex(u => u.id === req.user.id);
      if (userIndex === -1) {
        return res.status(400).json({ error: 'Không tìm thấy người dùng để cập nhật mật khẩu.' });
      }

      users[userIndex].password = password;
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

      return res.json({
        message: 'Cập nhật mật khẩu thành công (Local Mock)!'
      });
    }

    // Dùng Service Role Admin API để cập nhật mật khẩu của user đã được authenticate từ JWT
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
      password: password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Password updated successfully!'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh session token using refresh_token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const isMockMode = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder');
    if (isMockMode || refreshToken.startsWith('mock-token-')) {
      // In local mock mode, we just return the same token as success
      return res.json({
        session: {
          access_token: refreshToken,
          refresh_token: refreshToken
        },
        user: {
          id: refreshToken.replace('mock-token-', '').replace('-admin', ''),
          email: 'mock-user@nihongoflow.com',
          user_metadata: {
            display_name: 'Mock User',
            role: refreshToken.endsWith('-admin') ? 'admin' : 'user'
          }
        }
      });
    }

    // Call Supabase auth.refreshSession
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: 'Token refreshed successfully!',
      session: data.session,
      user: data.user
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;
