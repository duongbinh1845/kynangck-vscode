import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { getDb, writeDb, syncDbWithSupabase } from './src/server/db';
import { Project, ParentCRM, CorporateCRM, TransactionHistory, NewsArticle, NotificationLog } from './src/types';

// Load environment variables from .env
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const aiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (aiApiKey && aiApiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: aiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- ADMIN AUTHENTICATION ---
// Mật khẩu quản trị lấy từ biến môi trường. Đổi trong file .env (ADMIN_PASSWORD).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kynangck-admin';
// Khóa ký token suy ra từ mật khẩu => token vẫn hợp lệ sau khi restart server
// (thuận tiện khi đang dev backend), và tự vô hiệu khi đổi mật khẩu.
const SESSION_SECRET = crypto.createHash('sha256').update('kynangck-session::' + ADMIN_PASSWORD).digest('hex');
// Token sống 12 tiếng: đăng nhập 1 lần cho cả phiên làm việc.
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function createToken(): string {
  const payload = String(Date.now() + TOKEN_TTL_MS);
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64');
}

function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payload, sig] = decoded.split('.');
    if (!payload || !sig) return false;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
    const exp = Number(payload);
    return !!exp && Date.now() <= exp;
  } catch {
    return false;
  }
}

function extractToken(req: express.Request): string {
  const header = (req.headers['authorization'] as string) || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

// Danh sách route CÔNG KHAI (end-user). Mọi route /api còn lại mặc định yêu cầu admin.
const PUBLIC_API_ROUTES: { method: string; pattern: RegExp }[] = [
  { method: 'POST', pattern: /^\/api\/auth\/login\/?$/ },
  { method: 'GET', pattern: /^\/api\/auth\/verify\/?$/ },
  { method: 'GET', pattern: /^\/api\/projects\/?$/ },
  { method: 'GET', pattern: /^\/api\/news\/?$/ },
  { method: 'GET', pattern: /^\/api\/cms\/?$/ },
  { method: 'GET', pattern: /^\/api\/guessing-screens\/?$/ },
  { method: 'GET', pattern: /^\/api\/feedbacks\/?$/ },
  { method: 'POST', pattern: /^\/api\/feedbacks\/?$/ },
  { method: 'POST', pattern: /^\/api\/register\/?$/ },
  { method: 'POST', pattern: /^\/api\/register-corporate\/?$/ },
  { method: 'POST', pattern: /^\/api\/parent\/lookup\/?$/ },
];

// Middleware chặn-mặc-định: mọi request /api không nằm trong danh sách công khai đều cần token admin.
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) return next();
  const isPublic = PUBLIC_API_ROUTES.some(r => r.method === req.method && r.pattern.test(req.path));
  if (isPublic) return next();
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Yêu cầu xác thực quản trị. Vui lòng đăng nhập lại.' });
  }
  next();
});

// Đăng nhập quản trị: nhận mật khẩu, trả token.
app.post('/api/auth/login', (req, res) => {
  const password = (req.body && req.body.password) || '';
  const a = Buffer.from(String(password));
  const b = Buffer.from(ADMIN_PASSWORD);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    return res.status(401).json({ error: 'Mật khẩu quản trị không đúng.' });
  }
  res.json({ token: createToken() });
});

// Kiểm tra token còn hợp lệ (frontend gọi lúc khởi động để giữ đăng nhập).
app.get('/api/auth/verify', (req, res) => {
  const token = extractToken(req);
  res.json({ valid: !!token && verifyToken(token) });
});

// --- API ROUTES ---

// 1. Get all projects
app.get('/api/projects', (req, res) => {
  try {
    const db = getDb();
    res.json(db.projects);
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể tải danh sách dự án: ' + error.message });
  }
});

// 2. Add a new project
app.post('/api/projects', (req, res) => {
  try {
    const db = getDb();
    const newProject: Project = {
      id: req.body.id || req.body.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      title: req.body.title,
      status: req.body.status || 'sắp diễn ra',
      category: req.body.category || 'Khóa học',
      mainCategory: req.body.mainCategory,
      subCategory: req.body.subCategory,
      eventTime: req.body.eventTime || '',
      description: req.body.description || '',
      imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
      ageRange: req.body.ageRange || '6 - 15 tuổi',
      duration: req.body.duration || '1 ngày',
      location: req.body.location || 'Tại trung tâm',
      journeyDetails: req.body.journeyDetails || '',
      learnerValues: req.body.learnerValues || [],
      faqs: req.body.faqs || [],
      sidebarConfig: req.body.sidebarConfig || {},
      pricingPackages: req.body.pricingPackages || [],
      aiLandingPage: req.body.aiLandingPage,
      createdAt: new Date().toISOString(),
    };

    // Ensure unique id
    const exists = db.projects.some(p => p.id === newProject.id);
    if (exists) {
      newProject.id = `${newProject.id}-${Date.now().toString().slice(-4)}`;
    }

    db.projects.unshift(newProject);
    writeDb(db);
    res.status(201).json(newProject);
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể đăng dự án mới: ' + error.message });
  }
});

// 3. AI Landing Page Builder utilizing gemini-3.5-flash
app.post('/api/projects/ai-generate', async (req, res) => {
  try {
    const { title, description, category, ageRange } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Thiếu tên dự án hoặc mô tả cơ bản để AI lập kế hoạch.' });
    }

    if (!ai) {
      // Return a beautiful mocked layout if API key is not yet set up
      console.log('Gemini API Key is missing. Returning a highly styled template.');
      const simulatedLanding = {
        headline: `Đánh Thức Bản Lĩnh Toàn Diện Của Con Qua Dự Án "${title}"`,
        subheadline: `Chương trình trải nghiệm ${category || 'kỹ năng sống'} đột phá giúp con tự lập, tự tin và vững vàng kỹ năng`,
        description: `Chào đón các bé bước vào hành trình rèn luyện kỹ năng thực tiễn lý thú. ${description} Giáo trình được thiết kế trực quan, sinh động giúp trẻ tiếp thu bài học thông qua trò chơi tương tác thực tế.`,
        keyTakeaways: [
          'Nắm vững kỹ năng cốt lõi giúp bé giải quyết tình huống độc lập',
          'Rèn luyện tinh thần kiên trì, thấu hiểu và kỹ năng làm việc nhóm',
          'Rời xa thế giới ảo của điện thoại để kết nối với trải nghiệm thực tế đầy hào hứng',
          'Hình thành thói quen kỷ luật, tự giác chăm sóc bản thân'
        ],
        bannerColor: category?.includes('sinh tồn') ? 'emerald' : category?.includes('tự lập') ? 'orange' : 'sky',
        accentColor: 'amber',
        faq: [
          { question: 'Chương trình có phù hợp với lứa tuổi của con tôi không?', answer: `Dự án được thiết kế chuyên biệt cho trẻ trong độ tuổi ${ageRange || 'từ 6-15 tuổi'} với giáo án phân hóa, đảm bảo an toàn và phát huy tối đa tiềm năng.` },
          { question: 'Có người giám sát hỗ trợ bé suốt hoạt động không?', answer: 'Có đội ngũ huấn luyện viên giàu kinh nghiệm, chuyên môn cao đồng hành sát sao cùng bé theo tỷ lệ an toàn cao nhất.' }
        ]
      };
      return res.json(simulatedLanding);
    }

    const prompt = `Bạn là một chuyên gia giáo dục và copywriter cao cấp cho trẻ em.
Hãy thiết kế nội dung landing page tối ưu bằng tiếng Việt cho dự án kỹ năng trẻ em sau:
- Tên dự án: ${title}
- Lĩnh vực: ${category || 'Kỹ năng tổng hợp'}
- Độ tuổi: ${ageRange || '6 - 15 tuổi'}
- Mô tả thô: ${description}

Hãy tạo ra tiêu đề lôi cuốn phụ huynh, mô tả chi tiết hấp dẫn, 4 lợi ích lớn nhất, lựa chọn màu sắc phù hợp ('emerald' cho dã ngoại/sinh tồn, 'orange' cho tự lập, 'red' cho an toàn/cứu hộ, 'sky' cho tư duy/logic), và bộ câu hỏi FAQ hữu ích.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Tiêu đề chính cực kỳ hấp dẫn, truyền cảm hứng' },
            subheadline: { type: Type.STRING, description: 'Tiêu đề phụ giải thích rõ giá trị và lợi ích cho con' },
            description: { type: Type.STRING, description: 'Đoạn mô tả chi tiết, thuyết phục bố mẹ đăng ký cho bé' },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Danh sách đúng 4 gạch đầu dòng về giá trị và kỹ năng thực tế bé nhận được'
            },
            bannerColor: { type: Type.STRING, description: 'Chỉ được chọn 1 trong: emerald, orange, red, sky, indigo, amber' },
            accentColor: { type: Type.STRING, description: 'Chỉ được chọn 1 trong: amber, red, sky, emerald, indigo, orange' },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ['question', 'answer']
              },
              description: 'Danh sách 2 câu hỏi lo lắng nhất của phụ huynh kèm lời giải đáp y khoa hoặc thực tế uy tín'
            }
          },
          required: ['headline', 'subheadline', 'description', 'keyTakeaways', 'bannerColor', 'accentColor', 'faq']
        }
      }
    });

    const landingData = JSON.parse(response.text || '{}');
    res.json(landingData);
  } catch (error: any) {
    res.status(500).json({ error: 'AI thất bại khi thiết kế Landing Page: ' + error.message });
  }
});

// 4. Register a course / project (for Parents & Kids)
app.post('/api/register', (req, res) => {
  try {
    const { parentName, parentPhone, parentEmail, studentName, studentAge, students, participantCount, totalAmount, projectId, packageId } = req.body;

    if (!parentName || !parentPhone || !parentEmail || (!studentName && (!students || students.length === 0)) || !projectId || !packageId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin đăng ký của phụ huynh và học viên.' });
    }

    const db = getDb();
    const project = db.projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Không tìm thấy dự án học tập này.' });
    }

    const pkg = project.pricingPackages.find(p => p.id === packageId);
    if (!pkg) {
      return res.status(404).json({ error: 'Không tìm thấy gói giá dịch vụ này.' });
    }

    const count = Number(participantCount) || (students && students.length > 0 ? students.length : 1);
    const finalAmount = Number(totalAmount) || (pkg.price * count);

    // Build children array
    const childrenList = (students && students.length > 0)
      ? students.map((s: any) => ({
          studentName: s.studentName || 'Học viên',
          studentAge: Number(s.studentAge) || 8,
          progressLog: [
            {
              date: new Date().toLocaleDateString('sv-SE'),
              skillName: `Khởi đầu rèn luyện: ${project.category}`,
              status: 'Đang rèn luyện',
              notes: `Học viên đã đăng ký khóa học "${project.title}". Giáo viên sẽ cập nhật chi tiết tiến trình rèn luyện kỹ năng tại đây.`
            }
          ]
        }))
      : [
          {
            studentName,
            studentAge: Number(studentAge) || 8,
            progressLog: [
              {
                date: new Date().toLocaleDateString('sv-SE'),
                skillName: `Khởi đầu rèn luyện: ${project.category}`,
                status: 'Đang rèn luyện',
                notes: `Học viên đã đăng ký khóa học "${project.title}". Giáo viên sẽ cập nhật chi tiết tiến trình rèn luyện kỹ năng tại đây.`
              }
            ]
          }
        ];

    const studentNamesStr = childrenList.map((c: any) => c.studentName).join(', ');

    // A. Add to Parents CRM
    const newParent: ParentCRM = {
      id: `parent-${Date.now().toString().slice(-6)}`,
      parentName,
      parentPhone,
      parentEmail,
      children: childrenList,
      registeredProjectId: projectId,
      packageName: `${pkg.name} (${count} học viên)`,
      amountPaid: finalAmount,
      paymentStatus: 'Đã thanh toán',
      createdAt: new Date().toISOString()
    };

    db.parents.unshift(newParent);

    // B. Create Transaction History
    const newTransaction: TransactionHistory = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('sv-SE'),
      amount: finalAmount,
      clientName: parentName,
      type: 'Phụ huynh',
      description: `Đăng ký ${pkg.name} (${count} học viên: ${studentNamesStr}) - ${project.title}`,
      status: 'Thành công'
    };

    db.transactions.unshift(newTransaction);

    // C. Send Automatic Notification
    const newNotif: NotificationLog = {
      id: `notif-${Date.now().toString().slice(-6)}`,
      recipient: `${parentName} (${parentEmail})`,
      type: 'Email',
      title: `[CONNECT KIDS] Xác nhận đăng ký dự án: ${project.title}`,
      content: `Kính gửi Anh/Chị ${parentName}, CONNECT KIDS đã nhận thành công đăng ký cho ${count} học viên (${studentNamesStr}) tham gia khóa "${project.title}". Mentor sẽ liên hệ với Anh/Chị qua SĐT ${parentPhone} trong vòng 24h để tư vấn lộ trình phù hợp.`,
      status: 'Đã gửi',
      sentAt: new Date().toISOString()
    };

    db.notifications.unshift(newNotif);

    writeDb(db);
    res.status(201).json({ success: true, parent: newParent, transaction: newTransaction });
  } catch (error: any) {
    res.status(500).json({ error: 'Đăng ký khóa học thất bại: ' + error.message });
  }
});

// 5. Register Corporate Client (Doanh nghiệp đặt lịch trải nghiệm kỹ năng dã ngoại/camping/sinh tồn)
app.post('/api/register-corporate', (req, res) => {
  try {
    const { corporateName, contactPerson, contactPhone, contactEmail, eventType, numberOfParticipants, pricePackage, amount } = req.body;

    if (!corporateName || !contactPerson || !contactPhone || !contactEmail || !eventType || !numberOfParticipants) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin tổ chức/doanh nghiệp.' });
    }

    const db = getDb();
    const estAmount = Number(amount) || (Number(numberOfParticipants) * 800000); // 800k/participant average if not specified

    const newCorp: CorporateCRM = {
      id: `corp-${Date.now().toString().slice(-6)}`,
      corporateName,
      contactPerson,
      contactPhone,
      contactEmail,
      eventType,
      numberOfParticipants: Number(numberOfParticipants),
      status: 'Chờ duyệt',
      pricePackage: pricePackage || `Sự kiện Kỹ Năng ${eventType} - ${numberOfParticipants} học viên`,
      amount: estAmount,
      paymentStatus: 'Chờ thanh toán',
      createdAt: new Date().toISOString()
    };

    db.corporates.unshift(newCorp);

    // Create Transaction History pending
    const newTransaction: TransactionHistory = {
      id: `TXN-CORP-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('sv-SE'),
      amount: estAmount,
      clientName: corporateName,
      type: 'Doanh nghiệp',
      description: `Đăng ký sự kiện ${eventType} cho ${numberOfParticipants} thành viên`,
      status: 'Đang xử lý'
    };

    db.transactions.unshift(newTransaction);

    // Automatic Notification for corporate client
    const newNotif: NotificationLog = {
      id: `notif-${Date.now().toString().slice(-6)}`,
      recipient: `${contactPerson} (${contactEmail})`,
      type: 'Email',
      title: `[KidSkill] Nhận yêu cầu tổ chức sự kiện kỹ năng tập thể: ${corporateName}`,
      content: `Kính gửi Anh/Chị ${contactPerson}, Ban tổ chức dã ngoại KidSkill đã tiếp nhận yêu cầu thiết kế hoạt động trải nghiệm "${eventType}" dành cho ${numberOfParticipants} người của đơn vị ${corporateName}. Chuyên viên sự kiện sẽ liên hệ qua điện thoại ${contactPhone} trong vòng 4 giờ làm việc để gửi bảng đề xuất chi tiết và báo giá ưu đãi.`,
      status: 'Đã gửi',
      sentAt: new Date().toISOString()
    };

    db.notifications.unshift(newNotif);

    writeDb(db);
    res.status(201).json({ success: true, corporate: newCorp });
  } catch (error: any) {
    res.status(500).json({ error: 'Đăng ký sự kiện doanh nghiệp thất bại: ' + error.message });
  }
});

// 6. Manage CRM: Add student progress log
app.post('/api/crm/student-progress', (req, res) => {
  try {
    const { parentId, childIndex, skillName, status, notes } = req.body;

    if (!parentId || childIndex === undefined || !skillName || !status) {
      return res.status(400).json({ error: 'Thiếu thông tin cập nhật học bạ phát triển.' });
    }

    const db = getDb();
    const parent = db.parents.find(p => p.id === parentId);
    if (!parent) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin phụ huynh.' });
    }

    const child = parent.children[Number(childIndex)];
    if (!child) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin học viên tương ứng.' });
    }

    // Add progress log
    child.progressLog.unshift({
      date: new Date().toLocaleDateString('sv-SE'),
      skillName,
      status,
      notes: notes || 'Học viên hoàn thành tốt mục tiêu rèn luyện.'
    });

    // Send automatic email warning child progress update
    const newNotif: NotificationLog = {
      id: `notif-${Date.now().toString().slice(-6)}`,
      recipient: `${parent.parentName} (${parent.parentEmail})`,
      type: 'Email',
      title: `[KidSkill] Cập nhật tiến trình rèn luyện kỹ năng của bé: ${child.studentName}`,
      content: `Kính chào Chị/Anh ${parent.parentName}, giáo viên chủ nhiệm vừa cập nhật học bạ rèn luyện kỹ năng của bé ${child.studentName} vào ngày hôm nay. Kỹ năng: "${skillName}" - Đạt mức: ${status}. Ghi chú: ${notes}. Vui lòng đăng nhập hệ thống để xem chi tiết lời khuyên hỗ trợ trẻ tại nhà.`,
      status: 'Đã gửi',
      sentAt: new Date().toISOString()
    };
    db.notifications.unshift(newNotif);

    writeDb(db);
    res.json({ success: true, children: parent.children });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể cập nhật tiến trình học viên: ' + error.message });
  }
});

// 7. Manage CRM: Update Corporate Event Status
app.post('/api/crm/corporate-status', (req, res) => {
  try {
    const { corpId, status, paymentStatus } = req.body;

    if (!corpId) {
      return res.status(400).json({ error: 'Thiếu mã đối tác doanh nghiệp.' });
    }

    const db = getDb();
    const corp = db.corporates.find(c => c.id === corpId);
    if (!corp) {
      return res.status(404).json({ error: 'Không tìm thấy đối tác tương ứng.' });
    }

    if (status) corp.status = status;
    if (paymentStatus) {
      corp.paymentStatus = paymentStatus;
      // If paid, find transaction pending and mark as successful
      if (paymentStatus === 'Đã thanh toán') {
        const txn = db.transactions.find(t => t.clientName === corp.corporateName && t.status === 'Đang xử lý');
        if (txn) {
          txn.status = 'Thành công';
        }
      }
    }

    writeDb(db);
    res.json({ success: true, corporate: corp });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái hợp đồng: ' + error.message });
  }
});

// 8. Get CRM Stats
app.get('/api/crm/stats', (req, res) => {
  try {
    const db = getDb();

    // Total parents revenue
    const parentRevenue = db.parents.reduce((sum, p) => p.paymentStatus === 'Đã thanh toán' ? sum + p.amountPaid : sum, 0);
    // Total corporate revenue (only completed/approved paid events)
    const corporateRevenue = db.corporates.reduce((sum, c) => c.paymentStatus === 'Đã thanh toán' ? sum + c.amount : sum, 0);

    const totalRevenue = parentRevenue + corporateRevenue;

    // Student signup stats
    const studentCount = db.parents.reduce((sum, p) => sum + p.children.length, 0);

    // Event bookings counts
    const corporateCount = db.corporates.length;

    // Stats by category
    const categorySignups: { [key: string]: number } = {};
    db.projects.forEach(proj => {
      const parentRegistrations = db.parents.filter(p => p.registeredProjectId === proj.id);
      const count = parentRegistrations.reduce((sum, p) => sum + p.children.length, 0);
      categorySignups[proj.title] = count;
    });

    res.json({
      totalRevenue,
      parentRevenue,
      corporateRevenue,
      studentCount,
      corporateCount,
      categorySignups,
      transactions: db.transactions.slice(0, 10),
      notifications: db.notifications.slice(0, 10)
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể tính toán thống kê CRM: ' + error.message });
  }
});

// Get Parent Feedbacks
app.get('/api/feedbacks', (req, res) => {
  try {
    const db = getDb();
    res.json(db.feedbacks || []);
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi tải danh sách ý kiến phụ huynh: ' + error.message });
  }
});

// Submit Parent Feedback
app.post('/api/feedbacks', (req, res) => {
  try {
    const { parentName, parentPhone, content, rating } = req.body;
    if (!parentName || !content) {
      return res.status(400).json({ error: 'Vui lòng điền tên và ý kiến góp ý.' });
    }
    const db = getDb();
    if (!db.feedbacks) db.feedbacks = [];
    
    const newFeedback = {
      id: `fb-${Date.now().toString().slice(-6)}`,
      parentName,
      parentPhone: parentPhone || '',
      content,
      rating: Number(rating) || 5,
      createdAt: new Date().toISOString()
    };
    db.feedbacks.unshift(newFeedback);
    writeDb(db);
    res.status(201).json({ success: true, feedback: newFeedback });
  } catch (error: any) {
    res.status(500).json({ error: 'Gửi góp ý thất bại: ' + error.message });
  }
});

// 9. Get News articles
app.get('/api/news', (req, res) => {
  try {
    const db = getDb();
    res.json(db.news);
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi tải danh mục tin tức: ' + error.message });
  }
});

// 10. Post new article or video sharing modern methods
app.post('/api/news', (req, res) => {
  try {
    const db = getDb();
    const newArticle: NewsArticle = {
      id: `art-${Date.now().toString().slice(-6)}`,
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      category: req.body.category || 'Phương pháp giáo dục',
      type: req.body.type || 'article',
      mediaUrl: req.body.mediaUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      date: new Date().toLocaleDateString('sv-SE'),
      author: req.body.author || 'Chuyên gia KynangCK'
    };

    db.news.unshift(newArticle);
    writeDb(db);
    res.status(201).json(newArticle);
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi đăng tin tức: ' + error.message });
  }
});

// Update an article (CMS Post)
app.put('/api/news/:id', (req, res) => {
  try {
    const db = getDb();
    const articleIndex = db.news.findIndex(a => a.id === req.params.id);
    if (articleIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    db.news[articleIndex] = {
      ...db.news[articleIndex],
      title: req.body.title || db.news[articleIndex].title,
      excerpt: req.body.excerpt || db.news[articleIndex].excerpt,
      content: req.body.content || db.news[articleIndex].content,
      category: req.body.category || db.news[articleIndex].category,
      type: req.body.type || db.news[articleIndex].type,
      mediaUrl: req.body.mediaUrl !== undefined ? req.body.mediaUrl : db.news[articleIndex].mediaUrl,
      thumbnailUrl: req.body.thumbnailUrl !== undefined ? req.body.thumbnailUrl : db.news[articleIndex].thumbnailUrl,
      author: req.body.author || db.news[articleIndex].author,
    };

    writeDb(db);
    res.json(db.news[articleIndex]);
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi sửa bài viết: ' + error.message });
  }
});

// Delete an article (CMS Post)
app.delete('/api/news/:id', (req, res) => {
  try {
    const db = getDb();
    const initialLength = db.news.length;
    db.news = db.news.filter(a => a.id !== req.params.id);
    if (db.news.length === initialLength) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }
    writeDb(db);
    res.json({ success: true, message: 'Đã xóa bài viết thành công.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi xóa bài viết: ' + error.message });
  }
});

// Update a Project (CMS Course)
app.put('/api/projects/:id', (req, res) => {
  try {
    const db = getDb();
    const projectIndex = db.projects.findIndex(p => p.id === req.params.id);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    }

    db.projects[projectIndex] = {
      ...db.projects[projectIndex],
      title: req.body.title !== undefined ? req.body.title : db.projects[projectIndex].title,
      status: req.body.status !== undefined ? req.body.status : db.projects[projectIndex].status,
      category: req.body.category !== undefined ? req.body.category : db.projects[projectIndex].category,
      mainCategory: req.body.mainCategory !== undefined ? req.body.mainCategory : db.projects[projectIndex].mainCategory,
      subCategory: req.body.subCategory !== undefined ? req.body.subCategory : db.projects[projectIndex].subCategory,
      eventTime: req.body.eventTime !== undefined ? req.body.eventTime : db.projects[projectIndex].eventTime,
      description: req.body.description !== undefined ? req.body.description : db.projects[projectIndex].description,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : db.projects[projectIndex].imageUrl,
      ageRange: req.body.ageRange !== undefined ? req.body.ageRange : db.projects[projectIndex].ageRange,
      duration: req.body.duration !== undefined ? req.body.duration : db.projects[projectIndex].duration,
      location: req.body.location !== undefined ? req.body.location : db.projects[projectIndex].location,
      journeyDetails: req.body.journeyDetails !== undefined ? req.body.journeyDetails : db.projects[projectIndex].journeyDetails,
      learnerValues: req.body.learnerValues !== undefined ? req.body.learnerValues : db.projects[projectIndex].learnerValues,
      faqs: req.body.faqs !== undefined ? req.body.faqs : db.projects[projectIndex].faqs,
      sidebarConfig: req.body.sidebarConfig !== undefined ? req.body.sidebarConfig : db.projects[projectIndex].sidebarConfig,
      pricingPackages: req.body.pricingPackages !== undefined ? req.body.pricingPackages : db.projects[projectIndex].pricingPackages,
      aiLandingPage: req.body.aiLandingPage !== undefined ? req.body.aiLandingPage : db.projects[projectIndex].aiLandingPage,
    };

    writeDb(db);
    res.json(db.projects[projectIndex]);
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi sửa dự án: ' + error.message });
  }
});

// Delete a Project (CMS Course)
app.delete('/api/projects/:id', (req, res) => {
  try {
    const db = getDb();
    const initialLength = db.projects.length;
    db.projects = db.projects.filter(p => p.id !== req.params.id);
    if (db.projects.length === initialLength) {
      return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    }
    writeDb(db);
    res.json({ success: true, message: 'Đã xóa dự án dã ngoại thành công.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi xóa dự án dã ngoại: ' + error.message });
  }
});

// --- CMS SPECIFIC API ROUTES (WordPress style) ---

// Get CMS whole config
app.get('/api/cms', (req, res) => {
  try {
    const db = getDb();
    res.json(db.cms);
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi tải cấu hình CMS: ' + error.message });
  }
});

// Save CMS Header settings
app.post('/api/cms/header', (req, res) => {
  try {
    const db = getDb();
    db.cms.header = {
      brandName: req.body.brandName || 'KynangCK',
      logoUrl: req.body.logoUrl || '',
      menuItems: req.body.menuItems || []
    };
    writeDb(db);
    res.json({ success: true, header: db.cms.header });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu cấu hình Header: ' + error.message });
  }
});

// Save CMS Footer settings
app.post('/api/cms/footer', (req, res) => {
  try {
    const db = getDb();
    db.cms.footer = {
      campAddress: req.body.campAddress || '',
      officeAddress: req.body.officeAddress || '',
      hotline: req.body.hotline || '',
      copyright: req.body.copyright || '',
      shortDescription: req.body.shortDescription || db.cms.footer.shortDescription || '',
      facebookUrl: req.body.facebookUrl !== undefined ? req.body.facebookUrl : (db.cms.footer.facebookUrl || ''),
      zaloUrl: req.body.zaloUrl !== undefined ? req.body.zaloUrl : (db.cms.footer.zaloUrl || ''),
      youtubeUrl: req.body.youtubeUrl !== undefined ? req.body.youtubeUrl : (db.cms.footer.youtubeUrl || ''),
      tiktokUrl: req.body.tiktokUrl !== undefined ? req.body.tiktokUrl : (db.cms.footer.tiktokUrl || '')
    };
    writeDb(db);
    res.json({ success: true, footer: db.cms.footer });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu cấu hình Footer: ' + error.message });
  }
});

// Save CMS Homepage settings
app.post('/api/cms/homepage', (req, res) => {
  try {
    const db = getDb();
    db.cms.homepage = {
      headline: req.body.headline || '',
      subheadline: req.body.subheadline || '',
      bannerUrl: req.body.bannerUrl || ''
    };
    writeDb(db);
    res.json({ success: true, homepage: db.cms.homepage });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu cấu hình Trang chủ: ' + error.message });
  }
});

// Save CMS Theme settings
app.post('/api/cms/theme', (req, res) => {
  try {
    const db = getDb();
    db.cms.theme = {
      primaryColor: req.body.primaryColor || '5C7A3E',
      accentColor: req.body.accentColor || 'F08C3A',
      webBgColor: req.body.webBgColor || 'FAF7F0',
      headerBgColor: req.body.headerBgColor || 'FAF7F0',
      footerBgColor: req.body.footerBgColor || '5C7A3E',
      linkColor: req.body.linkColor || '5C7A3E'
    };
    writeDb(db);
    res.json({ success: true, theme: db.cms.theme });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu cấu hình Giao diện màu sắc: ' + error.message });
  }
});

// Save CMS Corporate (Hợp Tác) settings
app.post('/api/cms/corporate', (req, res) => {
  try {
    const db = getDb();
    db.cms.corporate = req.body;
    writeDb(db);
    res.json({ success: true, corporate: db.cms.corporate });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu cấu hình Hợp tác B2B: ' + error.message });
  }
});

// Add or Edit CMS static pages
app.post('/api/cms/pages', (req, res) => {
  try {
    const db = getDb();
    const { id, title, slug, content } = req.body;
    if (!title || !slug) {
      return res.status(400).json({ error: 'Tiêu đề và đường dẫn tĩnh là bắt buộc.' });
    }

    const pageSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    
    if (id) {
      // Edit existing
      const pageIndex = db.cms.pages.findIndex(p => p.id === id);
      if (pageIndex !== -1) {
        db.cms.pages[pageIndex] = {
          ...db.cms.pages[pageIndex],
          title,
          slug: pageSlug,
          content
        };
        writeDb(db);
        return res.json({ success: true, page: db.cms.pages[pageIndex] });
      }
    }

    // Add new
    const newPage = {
      id: `page-${Date.now().toString().slice(-6)}`,
      title,
      slug: pageSlug,
      content,
      createdAt: new Date().toISOString()
    };
    db.cms.pages.push(newPage);
    writeDb(db);
    res.status(201).json({ success: true, page: newPage });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu trang tĩnh: ' + error.message });
  }
});

// Delete CMS static page
app.delete('/api/cms/pages/:id', (req, res) => {
  try {
    const db = getDb();
    db.cms.pages = db.cms.pages.filter(p => p.id !== req.params.id);
    writeDb(db);
    res.json({ success: true, message: 'Đã xóa trang tĩnh thành công.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể xóa trang tĩnh: ' + error.message });
  }
});

// Manage Categories (postCategories or pageCategories)
app.post('/api/cms/categories', (req, res) => {
  try {
    const db = getDb();
    const { type, categories } = req.body; // type: 'posts' | 'pages'
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Danh sách danh mục không hợp lệ.' });
    }

    if (type === 'posts') {
      db.cms.postCategories = categories;
    } else if (type === 'pages') {
      db.cms.pageCategories = categories;
    } else {
      return res.status(400).json({ error: 'Loại danh mục không hỗ trợ.' });
    }

    writeDb(db);
    res.json({ success: true, postCategories: db.cms.postCategories, pageCategories: db.cms.pageCategories });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu danh mục: ' + error.message });
  }
});

// Update postCategoryTree
app.post('/api/cms/post-category-tree', (req, res) => {
  try {
    const db = getDb();
    db.cms.postCategoryTree = req.body.tree;
    // Sync flat postCategories to include all subcategories for general compatibility
    const flat: string[] = [];
    if (req.body.tree) {
      Object.keys(req.body.tree).forEach(parent => {
        flat.push(parent);
        if (Array.isArray(req.body.tree[parent])) {
          req.body.tree[parent].forEach((sub: string) => {
            if (!flat.includes(sub)) flat.push(sub);
          });
        }
      });
    }
    db.cms.postCategories = flat.length > 0 ? flat : db.cms.postCategories;
    writeDb(db);
    res.json({ success: true, tree: db.cms.postCategoryTree, postCategories: db.cms.postCategories });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu sơ đồ danh mục bài viết: ' + error.message });
  }
});

// Update projectCategoryTree
app.post('/api/cms/project-category-tree', (req, res) => {
  try {
    const db = getDb();
    db.cms.projectCategoryTree = req.body.tree;
    writeDb(db);
    res.json({ success: true, tree: db.cms.projectCategoryTree });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu sơ đồ danh mục dự án: ' + error.message });
  }
});

// Update Site Title & Web Settings (Title, Description, Favicon)
app.post('/api/cms/site-title', (req, res) => {
  try {
    const db = getDb();
    if (req.body.siteTitle !== undefined) {
      db.cms.siteTitle = req.body.siteTitle || 'Connect Kids - Kỹ Năng cho bé';
    }
    if (req.body.siteDescription !== undefined) {
      db.cms.siteDescription = req.body.siteDescription;
      if (db.cms.footer) {
        db.cms.footer.shortDescription = req.body.siteDescription;
      }
    }
    if (req.body.faviconUrl !== undefined) {
      db.cms.faviconUrl = req.body.faviconUrl;
    }
    writeDb(db);
    res.json({
      success: true,
      siteTitle: db.cms.siteTitle,
      siteDescription: db.cms.siteDescription,
      faviconUrl: db.cms.faviconUrl
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu tiêu đề & cấu hình trang web: ' + error.message });
  }
});

// Update Support CTA
app.post('/api/cms/support-cta', (req, res) => {
  try {
    const db = getDb();
    db.cms.supportCta = {
      title: req.body.title || 'Cần hỗ trợ trực tiếp?',
      description: req.body.description || 'Đăng ký tham gia dã ngoại ngay tại Trang chủ để rèn luyện kỹ năng thực tế cho bé.',
      buttonText: req.body.buttonText || 'Xem lịch tuyển sinh',
      buttonLink: req.body.buttonLink || 'home'
    };
    writeDb(db);
    res.json({ success: true, supportCta: db.cms.supportCta });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu thông tin hỗ trợ trực tiếp: ' + error.message });
  }
});

// Get all guessing screens
app.get('/api/guessing-screens', (req, res) => {
  try {
    const db = getDb();
    res.json(db.guessingGameScreens || []);
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể tải danh sách màn chơi đoán chữ: ' + error.message });
  }
});

// Add or edit guessing screen
app.post('/api/guessing-screens', (req, res) => {
  try {
    const db = getDb();
    const { id, level, screenIndex, image, answer, hint } = req.body;
    if (!level || !screenIndex || !answer) {
      return res.status(400).json({ error: 'Thiếu thông tin Level, Thứ tự màn hoặc Đáp án.' });
    }

    if (!db.guessingGameScreens) db.guessingGameScreens = [];

    const normalizedAnswer = answer.toUpperCase().normalize('NFC').trim();

    if (id) {
      const idx = db.guessingGameScreens.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.guessingGameScreens[idx] = {
          ...db.guessingGameScreens[idx],
          level: Number(level),
          screenIndex: Number(screenIndex),
          image: image || db.guessingGameScreens[idx].image,
          answer: normalizedAnswer,
          hint: hint || ''
        };
        writeDb(db);
        return res.json({ success: true, screen: db.guessingGameScreens[idx] });
      }
    }

    const newScreen = {
      id: `guess-${level}-${screenIndex}-${Date.now().toString().slice(-4)}`,
      level: Number(level),
      screenIndex: Number(screenIndex),
      image: image || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80',
      answer: normalizedAnswer,
      hint: hint || ''
    };

    db.guessingGameScreens.push(newScreen);
    writeDb(db);
    res.status(201).json({ success: true, screen: newScreen });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể lưu màn chơi đoán chữ: ' + error.message });
  }
});

// Delete guessing screen
app.delete('/api/guessing-screens/:id', (req, res) => {
  try {
    const db = getDb();
    if (!db.guessingGameScreens) db.guessingGameScreens = [];
    db.guessingGameScreens = db.guessingGameScreens.filter(s => s.id !== req.params.id);
    writeDb(db);
    res.json({ success: true, message: 'Đã xóa màn chơi đoán chữ thành công.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể xóa màn chơi: ' + error.message });
  }
});

// 11. CRM database view for direct inspection
app.get('/api/crm/all', (req, res) => {
  try {
    const db = getDb();
    res.json({
      parents: db.parents,
      corporates: db.corporates,
      transactions: db.transactions,
      notifications: db.notifications
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể tải cơ sở dữ liệu CRM: ' + error.message });
  }
});

// 11b. Public parent lookup by phone (Cổng phụ huynh — chỉ trả về đúng 1 phụ huynh khớp SĐT)
// Thay cho việc gọi /api/crm/all rồi lọc phía client (vốn lộ toàn bộ danh sách khách hàng).
app.post('/api/parent/lookup', (req, res) => {
  try {
    const phone = String((req.body && req.body.phone) || '').trim();
    if (!phone) {
      return res.status(400).json({ error: 'Vui lòng nhập số điện thoại tra cứu.' });
    }
    const db = getDb();
    const parent = db.parents.find(p => p.parentPhone.trim() === phone);
    if (!parent) {
      return res.status(404).json({ error: 'Không tìm thấy phụ huynh nào với số điện thoại này.' });
    }
    res.json({ parent });
  } catch (error: any) {
    res.status(500).json({ error: 'Không thể tra cứu học bạ: ' + error.message });
  }
});

// 12. Google Drive Media Library API
import { google } from 'googleapis';

// In-memory store for admin tokens (prototype)
let adminDriveTokens: any = null;

const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );
};

app.post('/api/auth/google', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    adminDriveTokens = tokens;
    res.json({ success: true, message: 'Authenticated successfully' });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

app.get('/api/auth/google/status', (req, res) => {
  res.json({ authenticated: !!adminDriveTokens });
});

app.post('/api/auth/google/logout', (req, res) => {
  adminDriveTokens = null;
  res.json({ success: true });
});

app.get('/api/drive/files', async (req, res) => {
  if (!adminDriveTokens) {
    return res.status(401).json({ error: 'Not authenticated with Google Drive' });
  }
  
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(adminDriveTokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Fetch images and videos
    const response = await drive.files.list({
      q: "mimeType contains 'image/' or mimeType contains 'video/' and trashed = false",
      fields: 'nextPageToken, files(id, name, mimeType, webContentLink, webViewLink, thumbnailLink, createdTime, size)',
      orderBy: 'createdTime desc',
      pageSize: 50,
    });
    
    res.json({ files: response.data.files });
  } catch (error: any) {
    console.error('Drive API Error:', error);
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      adminDriveTokens = null;
      return res.status(401).json({ error: 'Authentication expired' });
    }
    res.status(500).json({ error: 'Failed to fetch files from Google Drive' });
  }
});

// Vite Middleware for Development / static build for production
if (process.env.NODE_ENV !== 'production') {
  syncDbWithSupabase().then(() => {
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server đã chạy tại cổng: http://localhost:${PORT}`);
      });
    });
  }).catch((err) => {
    console.error('Lỗi khi đồng bộ cơ sở dữ liệu Firebase lúc khởi động:', err);
  });
} else {
  syncDbWithSupabase().then(() => {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server đang chạy chế độ production tại cổng ${PORT}`);
    });
  }).catch((err) => {
    console.error('Lỗi khi đồng bộ cơ sở dữ liệu Firebase lúc khởi động:', err);
  });
}
