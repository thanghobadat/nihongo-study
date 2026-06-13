const apiGroups = {
  'Xác Thực (Auth - Public)': [
    {
      method: 'POST',
      path: '/api/auth/register',
      url: 'http://localhost:8080/api/auth/register',
      role: 'public',
      desc: 'Đăng ký tài khoản học viên mới trên Supabase Auth (Mặc định là role user).',
      specInput: 'JSON Body:\n{\n  "email": "student@example.com",\n  "password": "securepassword123",\n  "displayName": "Học Viên A"\n}',
      specOutput: 'JSON:\n{\n  "message": "Registration successful!...",\n  "user": { ... },\n  "session": { ... }\n}',
      defaultBody: {
        email: 'student@example.com',
        password: 'securepassword123',
        displayName: 'Học Viên A'
      }
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      url: 'http://localhost:8080/api/auth/login',
      role: 'public',
      desc: 'Đăng nhập bằng Email và Mật khẩu. Hộp kiểm và token header sẽ tự động gán token thực tế vừa đăng nhập cho các API khác.',
      specInput: 'JSON Body:\n{\n  "email": "student@example.com",\n  "password": "securepassword123"\n}',
      specOutput: 'JSON:\n{\n  "message": "Login successful!",\n  "session": { "access_token": "jwt-token-here", ... }\n}',
      defaultBody: {
        email: 'student@example.com',
        password: 'securepassword123'
      }
    },
    {
      method: 'POST',
      path: '/api/auth/forgot-password',
      url: 'http://localhost:8080/api/auth/forgot-password',
      role: 'public',
      desc: 'Yêu cầu gửi liên kết đặt lại mật khẩu đến email.',
      specInput: 'JSON Body:\n{\n  "email": "student@example.com"\n}',
      specOutput: 'JSON:\n{\n  "message": "Password reset link sent to your email."\n}',
      defaultBody: {
        email: 'student@example.com'
      }
    },
    {
      method: 'POST',
      path: '/api/auth/reset-password',
      url: 'http://localhost:8080/api/auth/reset-password',
      role: 'user',
      desc: 'Đặt lại mật khẩu mới cho tài khoản hiện tại (yêu cầu Authorization Header).',
      specInput: 'Header: Authorization: Bearer <token>\nJSON Body:\n{\n  "password": "newsecurepassword123"\n}',
      specOutput: 'JSON:\n{\n  "message": "Password updated successfully!"\n}',
      defaultBody: {
        password: 'newsecurepassword123'
      }
    }
  ],
  'Hệ Thống (Public)': [
    {
      method: 'GET',
      path: '/',
      url: 'http://localhost:8080/',
      role: 'public',
      desc: 'API chào mừng gốc. Dùng để kiểm tra kết nối cơ bản với máy chủ.',
      specInput: 'Không cần tham số hoặc Header.',
      specOutput: 'JSON:\n{\n  "message": "Welcome to Nihongo Flow Backend API!"\n}'
    },
    {
      method: 'GET',
      path: '/api/health',
      url: 'http://localhost:8080/api/health',
      role: 'public',
      desc: 'API kiểm tra sức khỏe của server (Health Check).',
      specInput: 'Không cần tham số.',
      specOutput: 'JSON:\n{\n  "status": "ok",\n  "timestamp": "2026-06-13T05:51:04Z"\n}'
    }
  ],
  'Học Viên (User & Admin)': [
    {
      method: 'GET',
      path: '/api/user/lessons',
      url: 'http://localhost:8080/api/user/lessons',
      role: 'user',
      desc: 'Lấy toàn bộ danh sách bài học của khóa học.',
      specInput: 'Header:\nAuthorization: Bearer <token>',
      specOutput: 'JSON Array:\n[\n  {\n    "id": 1,\n    "title": "Bài 1: Hajimemashite",\n    "description": "Giới thiệu bản thân"\n  }\n]'
    },
    {
      method: 'GET',
      path: '/api/user/lessons/:lessonId/vocabulary',
      url: 'http://localhost:8080/api/user/lessons/:lessonId/vocabulary',
      role: 'user',
      desc: 'Lấy từ vựng của bài học, ghép kèm trạng thái học thuộc ("not_learned", "learning", "mastered") của tài khoản hiện tại.',
      specInput: 'Header:\nAuthorization: Bearer <token>',
      specOutput: 'JSON Array:\n[\n  {\n    "id": 1,\n    "lesson_id": 1,\n    "hiragana": "わたし",\n    "romaji": "watashi",\n    "vietnamese_meaning": "tôi",\n    "status": "mastered"\n  }\n]'
    },
    {
      method: 'GET',
      path: '/api/user/lessons/:lessonId/kanji',
      url: 'http://localhost:8080/api/user/lessons/:lessonId/kanji',
      role: 'user',
      desc: 'Lấy danh sách chữ Hán bài học ghép trạng thái học của user.',
      specInput: 'Header:\nAuthorization: Bearer <token>',
      specOutput: 'JSON Array:\n[\n  {\n    "id": 1,\n    "character": "私",\n    "sino_vietnamese": "TƯ",\n    "status": "learning"\n  }\n]'
    },
    {
      method: 'GET',
      path: '/api/user/lessons/:lessonId/grammar',
      url: 'http://localhost:8080/api/user/lessons/:lessonId/grammar',
      role: 'user',
      desc: 'Lấy toàn bộ cấu trúc ngữ pháp thuộc bài học.',
      specInput: 'Header:\nAuthorization: Bearer <token>',
      specOutput: 'JSON Array:\n[\n  {\n    "id": 1,\n    "title": "N1 wa N2 desu",\n    "meaning": "N1 là N2",\n    "japanese_example": "わたしはマイクamp;middot;ミラーです。"\n  }\n]'
    },
    {
      method: 'GET',
      path: '/api/user/progress-summary',
      url: 'http://localhost:8080/api/user/progress-summary',
      role: 'user',
      desc: 'Lấy tổng hợp tiến độ thuộc từ vựng/Kanji phục vụ thống kê ở Dashboard.',
      specInput: 'Header:\nAuthorization: Bearer <token>',
      specOutput: 'JSON:\n{\n  "vocabulary": { "total": 15, "mastered": 5, "percentage": 33.3 },\n  "kanji": { "total": 8, "mastered": 2, "percentage": 25.0 }\n}'
    },
    {
      method: 'POST',
      path: '/api/user/progress',
      url: 'http://localhost:8080/api/user/progress',
      role: 'user',
      desc: 'Học viên cập nhật trạng thái học thuộc cho Từ vựng / Kanji.',
      specInput: 'JSON Body:\n{\n  "item_type": "vocabulary",\n  "item_id": 1,\n  "status": "mastered"\n}',
      specOutput: 'JSON:\n{\n  "message": "Progress updated successfully",\n  "progress": { "id": 1, "status": "mastered" }\n}',
      defaultBody: { item_type: 'vocabulary', item_id: 1, status: 'mastered' }
    },
    {
      method: 'GET',
      path: '/api/user/target-plan',
      url: 'http://localhost:8080/api/user/target-plan',
      role: 'user',
      desc: 'Lấy cấu hình kế hoạch học tập mục tiêu đã lưu trên Dashboard.',
      specInput: 'Header:\nAuthorization: Bearer <token>',
      specOutput: 'JSON:\n{\n  "start_date": "2026-06-13",\n  "end_date": "2026-06-20",\n  "vocabulary_target": 30,\n  "self_evaluation": "Tốt"\n}'
    },
    {
      method: 'POST',
      path: '/api/user/target-plan',
      url: 'http://localhost:8080/api/user/target-plan',
      role: 'user',
      desc: 'Cập nhật/Lập kế hoạch mục tiêu tiến độ trên Dashboard.',
      specInput: 'JSON Body:\n{\n  "start_date": "2026-06-13",\n  "end_date": "2026-06-20",\n  "vocabulary_target": 30,\n  "kanji_target": 10,\n  "self_evaluation": "Tốt"\n}',
      specOutput: 'JSON:\n{\n  "message": "Target plan updated successfully",\n  "plan": { ... }\n}',
      defaultBody: { start_date: '2026-06-13', end_date: '2026-06-20', vocabulary_target: 30, kanji_target: 10, self_evaluation: 'Tốt' }
    }
  ],
  'Quản Trị Viên (Chỉ Admin)': [
    {
      method: 'GET',
      path: '/api/admin/students',
      url: 'http://localhost:8080/api/admin/students',
      role: 'admin',
      desc: 'Lấy danh sách thông tin tất cả học viên trong hệ thống.',
      specInput: 'Header:\nAuthorization: Bearer <token_admin>',
      specOutput: 'JSON Array:\n[\n  {\n    "id": "uuid-hoc-vien",\n    "email": "student@gmail.com",\n    "display_name": "Học viên A"\n  }\n]'
    },
    {
      method: 'GET',
      path: '/api/admin/students/uuid-hoc-vien/progress',
      url: 'http://localhost:8080/api/admin/students/mock-student-uuid/progress',
      role: 'admin',
      desc: 'Theo dõi chi tiết tiến độ học tập và mục tiêu của học viên cụ thể theo ID.',
      specInput: 'Header:\nAuthorization: Bearer <token_admin>',
      specOutput: 'JSON:\n{\n  "student": { "email": "..." },\n  "progress": {\n    "vocabulary": { "total": 15, "mastered": 5 },\n    "kanji": { "total": 8, "mastered": 2 }\n  },\n  "targetPlan": { ... }\n}'
    },
    {
      method: 'POST',
      path: '/api/admin/lessons',
      url: 'http://localhost:8080/api/admin/lessons',
      role: 'admin',
      desc: 'Tạo một bài học mới trong cơ sở dữ liệu.',
      specInput: 'JSON Body:\n{\n  "title": "Bài 2: Kore wa Hon desu",\n  "description": "Học về đồ vật xung quanh"\n}',
      specOutput: 'JSON:\n{\n  "message": "Lesson created successfully",\n  "lesson": { "id": 2, "title": "Bài 2..." }\n}',
      defaultBody: { title: 'Bài 2: Kore wa Hon desu', description: 'Học về đồ vật xung quanh và đại từ chỉ định.' }
    },
    {
      method: 'POST',
      path: '/api/admin/vocabulary',
      url: 'http://localhost:8080/api/admin/vocabulary',
      role: 'admin',
      desc: 'Thêm từ vựng mới vào bài học.',
      specInput: 'JSON Body:\n{\n  "lesson_id": 1,\n  "hiragana": "ほん",\n  "romaji": "hon",\n  "vietnamese_meaning": "cuốn sách",\n  "word_type": "Danh từ"\n}',
      specOutput: 'JSON:\n{\n  "message": "Vocabulary added successfully",\n  "vocabulary": { ... }\n}',
      defaultBody: { lesson_id: 1, hiragana: 'ほん', romaji: 'hon', vietnamese_meaning: 'cuốn sách', word_type: 'Danh từ' }
    },
    {
      method: 'PUT',
      path: '/api/admin/vocabulary/1',
      url: 'http://localhost:8080/api/admin/vocabulary/1',
      role: 'admin',
      desc: 'Cập nhật thông tin từ vựng có sẵn.',
      specInput: 'JSON Body:\n{\n  "vietnamese_meaning": "quyển sách (cập nhật)"\n}',
      specOutput: 'JSON:\n{\n  "message": "Vocabulary updated successfully",\n  "vocabulary": { ... }\n}',
      defaultBody: { vietnamese_meaning: 'quyển sách (cập nhật)' }
    },
    {
      method: 'DELETE',
      path: '/api/admin/vocabulary/1',
      url: 'http://localhost:8080/api/admin/vocabulary/1',
      role: 'admin',
      desc: 'Xóa từ vựng ra khỏi hệ thống học liệu.',
      specInput: 'Header:\nAuthorization: Bearer <token_admin>',
      specOutput: 'JSON:\n{\n  "message": "Vocabulary deleted successfully"\n}'
    }
  ]
};

const apiList = document.getElementById('apiList');
const requestMethod = document.getElementById('requestMethod');
const requestUrl = document.getElementById('requestUrl');
const requestBody = document.getElementById('requestBody');
const bodyContainer = document.getElementById('bodyContainer');
const sendBtn = document.getElementById('sendBtn');
const responseJson = document.getElementById('responseJson');
const statusBadge = document.getElementById('statusBadge');
const tokenSelect = document.getElementById('tokenSelect');
const apiDescBanner = document.getElementById('apiDescBanner');

const specInput = document.getElementById('specInput');
const specOutput = document.getElementById('specOutput');
const lessonIdInput = document.getElementById('lessonIdInput');
let currentApi = null;

let isFirst = true;

// Render grouped APIs
for (const [groupName, apis] of Object.entries(apiGroups)) {
  const groupHeader = document.createElement('div');
  groupHeader.className = 'section-header';
  groupHeader.innerText = groupName;
  apiList.appendChild(groupHeader);

  apis.forEach((api) => {
    const item = document.createElement('div');
    item.className = 'api-item';
    if (isFirst) {
      item.classList.add('active');
      isFirst = false;
      selectApi(api);
    }

    const badgeClass = `badge-${api.method.toLowerCase()}`;
    const roleClass = `role-${api.role}`;
    const roleLabel = api.role === 'public' ? '🔓 Public' : (api.role === 'user' ? '🔒 User' : '🛡️ Admin');

    item.innerHTML = `
      <div class="meta-row">
        <span class="api-badge ${badgeClass}">${api.method}</span>
        <span class="role-badge ${roleClass}">${roleLabel}</span>
      </div>
      <div class="api-path">${api.path}</div>
    `;

    item.onclick = () => {
      document.querySelectorAll('.api-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      selectApi(api);
    };

    apiList.appendChild(item);
  });
}

function selectApi(api) {
  currentApi = api;
  requestMethod.value = api.method;
  
  const lessonId = lessonIdInput.value || '1';
  requestUrl.value = api.url.replace(':lessonId', lessonId);
  
  apiDescBanner.innerHTML = `<strong>Mô tả:</strong> ${api.desc} <br> <strong>Yêu cầu Auth:</strong> ${api.role === 'public' ? 'Không yêu cầu Auth (Public)' : (api.role === 'user' ? 'Quyền Học viên (User/Admin)' : 'Quyền Quản trị viên (Chỉ Admin)')}`;
  
  specInput.innerText = api.specInput.replace(':lessonId', lessonId);
  specOutput.innerText = api.specOutput.replace(':lessonId', lessonId);

  if (api.method === 'POST' || api.method === 'PUT') {
    bodyContainer.style.display = 'block';
    requestBody.value = JSON.stringify(api.defaultBody || {}, null, 2);
  } else {
    bodyContainer.style.display = 'none';
  }

  // Auto select matching token option in select header if appropriate
  if (api.role === 'public') {
    tokenSelect.value = '';
  } else if (api.role === 'user') {
    tokenSelect.value = 'Bearer mock-token-user123';
  } else if (api.role === 'admin') {
    tokenSelect.value = 'Bearer mock-token-admin123-admin';
  }
}

// Update URL dynamically when Lesson ID changes
lessonIdInput.oninput = () => {
  if (currentApi) {
    const lessonId = lessonIdInput.value || '1';
    requestUrl.value = currentApi.url.replace(':lessonId', lessonId);
  }
};

// Toggle body container on method change
requestMethod.onchange = () => {
  if (requestMethod.value === 'POST' || requestMethod.value === 'PUT') {
    bodyContainer.style.display = 'block';
  } else {
    bodyContainer.style.display = 'none';
  }
};

// Send Request
sendBtn.onclick = async () => {
  responseJson.innerText = 'Đang gửi yêu cầu...';
  statusBadge.style.display = 'none';

  const method = requestMethod.value;
  const url = requestUrl.value;
  const token = tokenSelect.value;

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = token;
  }

  const options = {
    method,
    headers
  };

  if (method === 'POST' || method === 'PUT') {
    try {
      options.body = JSON.stringify(JSON.parse(requestBody.value));
    } catch (e) {
      responseJson.innerText = 'Lỗi: JSON body gửi đi không đúng định dạng JSON.';
      return;
    }
  }

  try {
    const res = await fetch(url, options);
    statusBadge.style.display = 'inline-block';
    statusBadge.innerText = `HTTP ${res.status} ${res.statusText}`;

    if (res.status >= 200 && res.status < 300) {
      statusBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
      statusBadge.style.color = 'var(--success)';
    } else if (res.status >= 400) {
      statusBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
      statusBadge.style.color = 'var(--error)';
    }

    const data = await res.json();
    responseJson.innerText = JSON.stringify(data, null, 2);

    // Auto-capture Real Token on successful login
    if (res.status === 200 && url.includes('/api/auth/login') && data.session && data.session.access_token) {
      const realToken = `Bearer ${data.session.access_token}`;
      
      // Check if option already exists
      let realOption = Array.from(tokenSelect.options).find(opt => opt.value === realToken);
      if (!realOption) {
        realOption = document.createElement('option');
        realOption.value = realToken;
        realOption.text = `Tài khoản thực tế (Vừa đăng nhập)`;
        tokenSelect.appendChild(realOption);
      }
      tokenSelect.value = realToken;
      
      responseJson.innerText = JSON.stringify(data, null, 2) + "\n\n🔑 HỆ THỐNG ĐÃ TỰ ĐỘNG GÁN ACCESS_TOKEN THỰC TẾ NÀY VÀO AUTH HEADER CHO CÁC API TIẾP THEO!";
    }
  } catch (error) {
    statusBadge.style.display = 'inline-block';
    statusBadge.innerText = 'LỖI KẾT NỐI';
    statusBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
    statusBadge.style.color = 'var(--error)';
    responseJson.innerText = `Không thể kết nối đến Express Backend Server:\n\n${error.message}\n\nHãy đảm bảo bạn đã khởi động Express Backend server trước khi chạy test!`;
  }
};
