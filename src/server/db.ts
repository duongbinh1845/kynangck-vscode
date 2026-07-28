import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { DBData, Project, ParentCRM, CorporateCRM, TransactionHistory, NewsArticle, NotificationLog } from '../types';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export let inMemoryDbCache: DBData | null = null;
export let isSupabaseEnabled = false;
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
    isSupabaseEnabled = true;
    console.log('✓ Supabase client initialized');
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
  }
}


// Helper to ensure data directory and file exist with mock data
function ensureDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DBData = {
      projects: [
        {
          id: 'du-an-chien-binh-rung-xanh',
          title: 'Chiến Binh Rừng Xanh - Sinh Tồn Dã Ngoại',
          status: 'đang thực hiện',
          category: 'Trải Nghiệm » Cắm trại hoang dã',
          mainCategory: 'Trải Nghiệm',
          subCategory: 'Cắm trại hoang dã',
          eventTime: '15/08/2026 - 18/08/2026',
          description: 'Hành trình trải nghiệm thực tế giúp trẻ tự tin, biết cách tự vệ, dựng lều, tìm nguồn nước và định vị phương hướng giữa thiên nhiên kỳ vĩ.',
          imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
          ageRange: '8 - 15 tuổi',
          duration: '3 ngày 2 đêm',
          location: 'Vườn Quốc Gia Cát Tiên, Đồng Nai',
          pricingPackages: [
            {
              id: 'pkg-basic',
              name: 'Gói Trải Nghiệm',
              price: 3500000,
              description: 'Bao gồm chi phí đi lại, ăn uống tiêu chuẩn và dụng cụ sinh tồn cơ bản.',
              benefits: ['Xe đưa đón khứ hồi từ TP.HCM', 'Ăn uống 3 bữa/ngày đầy đủ dinh dưỡng', 'Dụng cụ bảo hộ và lều trại chung', 'Chứng nhận hoàn thành khóa học']
            },
            {
              id: 'pkg-premium',
              name: 'Gói Chiến Binh Toàn Diện',
              price: 5200000,
              description: 'Tất cả dịch vụ của gói cơ bản cộng với bộ kit sinh tồn cá nhân cao cấp mang về.',
              benefits: ['Đầy đủ quyền lợi của Gói Trải Nghiệm', 'Tặng riêng bộ Kit sinh tồn: La bàn, còi cứu hộ, đèn pin siêu sáng, bình nước dã ngoại', 'Bộ ảnh và video lưu niệm cá nhân từ nhiếp ảnh gia chuyên nghiệp', 'Bảo hiểm du lịch mức cao nhất (50.000.000đ)']
            }
          ],
          aiLandingPage: {
            headline: 'Biến Trẻ Thành Những Chiến Binh Thực Thụ Giữa Thiên Nhiên',
            subheadline: 'Học kỹ năng sinh tồn thực tế, khơi dậy bản lĩnh tự lập và tinh thần đồng đội',
            description: 'Khóa dã ngoại thực tế độc đáo nhất năm dành cho các em nhỏ muốn bứt phá giới hạn bản thân. Trẻ sẽ học cách dựng lều, nhóm lửa không dùng diêm, sơ cứu vết thương, định vị phương hướng bằng chòm sao và vượt qua các thử thách thể lực lý thú.',
            keyTakeaways: [
              'Tự tin làm chủ tình huống nguy hiểm nơi hoang dã',
              'Rèn luyện thể chất dẻo dai và tư duy giải quyết vấn đề linh hoạt',
              'Yêu thiên nhiên, giảm thời gian xem màn hình điện thoại',
              'Kết nối những người bạn cùng chí hướng bền chặt'
            ],
            bannerColor: 'emerald',
            accentColor: 'amber',
            faq: [
              { question: 'Có an toàn cho bé không?', answer: 'Cực kỳ an toàn. Tỷ lệ huấn luyện viên là 1 kèm 4 học sinh, cùng đội ngũ y tế túc trực 24/7.' },
              { question: 'Bé cần mang theo những gì?', answer: 'Ban tổ chức sẽ gửi cẩm nang chi tiết. Bé chỉ cần mang trang phục dã ngoại, giày thể thao và đồ dùng cá nhân cơ bản.' }
            ]
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'du-an-dau-bep-nhi',
          title: 'Đầu Bếp Nhí Tài Ba - Rèn Luyện Tự Lập',
          status: 'đã hoàn thành',
          category: 'Khóa Học » Kỹ năng tự lập',
          mainCategory: 'Khóa Học',
          subCategory: 'Kỹ năng tự lập',
          eventTime: '01/06/2026 - 30/06/2026',
          description: 'Học cách chuẩn bị bữa ăn dinh dưỡng, quản lý gian bếp an toàn và thấu hiểu giá trị của thực phẩm cùng lòng biết ơn cha mẹ.',
          imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
          ageRange: '6 - 12 tuổi',
          duration: '4 buổi (Chủ Nhật hàng tuần)',
          location: 'Học viện Ẩm thực KidChef, Quận 3, TP.HCM',
          pricingPackages: [
            {
              id: 'pkg-chef-standard',
              name: 'Gói MasterKid',
              price: 2400000,
              description: 'Bao gồm nguyên liệu thực hành bếp Âu - Á cao cấp và chứng nhận khóa học.',
              benefits: ['Nguyên liệu tươi sạch tiêu chuẩn organic', 'Bộ tạp dề và mũ bếp trưởng thêu tên bé', 'Học trực tiếp với đầu bếp chuyên nghiệp chuyên nghiệp', 'Sổ tay công thức món ngon độc quyền']
            }
          ],
          aiLandingPage: {
            headline: 'Để Gian Bếp Trở Thành Trường Học Kỹ Năng Đầu Đời Của Con',
            subheadline: 'Rèn luyện khả năng tổ chức, tư duy logic và sẻ chia công việc gia đình',
            description: 'Thông qua nghệ thuật ẩm thực, trẻ không chỉ biết nấu ăn mà còn được rèn luyện khả năng lập kế hoạch, đo lường nguyên liệu (toán học thực tiễn) và làm quen với lối sống tự lập, gọn gàng ngăn nắp.',
            keyTakeaways: [
              'Tự tay nấu được ít nhất 5 món ăn gia đình bổ dưỡng',
              'Sử dụng các dụng cụ bếp (dao, thớt, bếp gas/hồng ngoại) an toàn tuyệt đối',
              'Hiểu rõ tháp dinh dưỡng và thói quen ăn uống lành mạnh',
              'Biết dọn dẹp gian bếp sạch sẽ sau khi hoàn thành nấu nướng'
            ],
            bannerColor: 'orange',
            accentColor: 'red',
            faq: [
              { question: 'Các bé nhỏ tuổi dùng dao kéo có nguy hiểm không?', answer: 'Học viên được trang bị bộ dao kéo chuyên dụng bằng nhựa cao cấp và silicon chuyên dành cho trẻ em, đảm bảo cắt thái được thực phẩm nhưng không gây tổn thương da bé.' }
            ]
          },
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'du-an-so-cuu-an-toan',
          title: 'Kỹ Năng Sơ Cứu & Phòng Chống Tai Nạn Thương Tích',
          status: 'sắp diễn ra',
          category: 'Khóa Học » Kỹ năng sinh tồn',
          mainCategory: 'Khóa Học',
          subCategory: 'Kỹ năng sinh tồn',
          eventTime: '10/09/2026',
          description: 'Trang bị cho con các kỹ năng nhận biết nguy hiểm, cách xử lý khi bị bỏng, chảy máu, hóc dị vật, hoặc điện giật thông qua các tình huống giả lập kịch tính.',
          imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
          ageRange: '7 - 14 tuổi',
          duration: '1 ngày',
          location: 'Trung tâm Phát triển Kỹ năng Trẻ em, TP.HCM',
          pricingPackages: [
            {
              id: 'pkg-aid-basic',
              name: 'Gói Tiêu Chuẩn',
              price: 1200000,
              description: 'Khóa học 1 ngày thực hành chuyên sâu kỹ thuật sơ cứu ép tim ngoài lồng ngực CPR, xử lý hóc dị vật Heimlich.',
              benefits: ['Giáo trình sơ cứu trực quan sinh động', 'Thực hành trực tiếp trên mô hình thông minh điện tử', 'Hộp cứu thương mini sơ cứu mang về cho bé', 'Bữa trưa dinh dưỡng cho bé tại lớp']
            }
          ],
          aiLandingPage: {
            headline: 'Khi Tai Nạn Bất Ngờ Xảy Ra, Con Sẽ Là Người Hùng Cứu Hộ',
            subheadline: 'Học cách bình tĩnh sơ cứu bản thân và những người xung quanh trong gang tấc',
            description: 'Khóa học sinh động được thiết kế dưới dạng trò chơi nhập vai bác sĩ nhí, lính cứu hỏa nhí giúp trẻ ghi nhớ lâu dài các bước xử lý cấp cứu thiết yếu, giảm thiểu rủi ro tai nạn trong đời sống học đường và gia đình.',
            keyTakeaways: [
              'Gọi số khẩn cấp (113, 114, 115) chuẩn xác và cung cấp đủ thông tin cần thiết',
              'Nắm vững quy trình xử lý hóc dị vật cứu người trong 3 phút vàng',
              'Biết cách băng bó vết thương hở và cố định xương gãy tạm thời',
              'Nhận diện các mối nguy hiểm cháy nổ, đuối nước để phòng tránh'
            ],
            bannerColor: 'red',
            accentColor: 'sky',
            faq: [
              { question: 'Bé học xong có thực hành được không?', answer: 'Hơn 80% thời lượng khóa học là thực hành đóng vai tình huống thực tế giúp bé hình thành phản xạ tự nhiên khi gặp sự cố thật.' }
            ]
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'du-an-thua-ruong-xanh',
          title: 'Nông Dân Nhí Trải Nghiệm Làng Quê & Cây Trồng',
          status: 'sắp diễn ra',
          category: 'Trải Nghiệm » Dã ngoại thực tế',
          mainCategory: 'Trải Nghiệm',
          subCategory: 'Dã ngoại thực tế',
          eventTime: '05/09/2026 - 06/09/2026',
          description: 'Cho trẻ hòa mình vào nhịp sống nông thôn, tự tay gặt lúa, bắt cá đồng, cấy rau sạch và học cách trân trọng mồ hôi sức lao động.',
          imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
          ageRange: '6 - 12 tuổi',
          duration: '2 ngày 1 đêm',
          location: 'Nông trang Sinh thái Củ Chi, TP.HCM',
          pricingPackages: [
            {
              id: 'pkg-farm-1',
              name: 'Gói Trải Nghiệm Xanh',
              price: 1800000,
              description: 'Hành trình 2 ngày 1 đêm trải nghiệm trồng trọt và sinh hoạt tại nhà vườn sinh thái.',
              benefits: ['Xe đưa đón tận nơi', 'Hướng dẫn viên nông nghiệp thân thiện', 'Thu hoạch nông sản organic mang về gia đình', 'Bảo hiểm du lịch dã ngoại']
            }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 'du-an-cuoc-thi-sinh-ton',
          title: 'Đại Hội Thử Thách Sinh Tồn Nhí KynangCK',
          status: 'sắp diễn ra',
          category: 'Sân Chơi » Cuộc thi sinh tồn',
          mainCategory: 'Sân Chơi',
          subCategory: 'Cuộc thi sinh tồn',
          eventTime: '20/09/2026',
          description: 'Sân chơi thi đấu kỹ năng sinh tồn quy mô toàn quốc dành cho học sinh. Các đội vượt qua chướng ngại vật, giải mật mã và sơ cứu đồng đội.',
          imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
          ageRange: '8 - 15 tuổi',
          duration: '1 ngày',
          location: 'Khu Đô Thị Dã Ngoại Đầm Sen, TP.HCM',
          pricingPackages: [
            {
              id: 'pkg-arena-1',
              name: 'Vé Thi Đấu Đội Nhí',
              price: 850000,
              description: 'Bao gồm áo đấu, bộ kit thử thách sinh tồn và huy chương kỷ niệm.',
              benefits: ['Bộ áo đấu độc quyền KynangCK', 'Dụng cụ vượt chướng ngại vật', 'Cúp và huy chương danh dự cho đội thắng cuộc']
            }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 'du-an-trong-rung-xanh',
          title: 'Chiến Dịch Rừng Xanh Hy Vọng - Nhỏ Tuổi Việc Nhỏ',
          status: 'sắp diễn ra',
          category: 'Cộng Đồng » Hoạt động xã hội',
          mainCategory: 'Cộng Đồng',
          subCategory: 'Hoạt động xã hội',
          eventTime: '12/10/2026',
          description: 'Dự án cộng đồng giúp các em nhỏ tự tay gieo mầm 1.000 cây xanh phủ xanh đồi trọc, dọn rác bãi biển và giao lưu tặng quà trẻ em vùng cao.',
          imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
          ageRange: '6 - 15 tuổi',
          duration: '1 ngày',
          location: 'Rừng Phòng Hộ Cần Giờ, TP.HCM',
          pricingPackages: [
            {
              id: 'pkg-green-1',
              name: 'Gói Tình Nguyện Cây Xanh',
              price: 500000,
              description: 'Tài trợ 5 cây gieo mầm, giấy chứng nhận tình nguyện viên nhí và dụng cụ dã ngoại.',
              benefits: ['Bao gồm 5 cây xanh gieo mầm ghi tên bé', 'Giấy chứng nhận Hoạt Động Xã Hội cấp bởi Học Viện', 'Áo phông tình nguyện viên nhí']
            }
          ],
          createdAt: new Date().toISOString()
        }
      ],
      parents: [
        {
          id: 'parent-1',
          parentName: 'Nguyễn Văn Hùng',
          parentPhone: '0901234567',
          parentEmail: 'hung.nguyen@gmail.com',
          children: [
            {
              studentName: 'Nguyễn Minh Quân',
              studentAge: 10,
              progressLog: [
                { date: '2026-07-10', skillName: 'Kỹ năng thắt nút dây dựng lều dã ngoại', status: 'Đã hoàn thành', notes: 'Bé nắm kỹ thuật thắt nút dẹt và nút thuyền chài rất nhanh, chủ động hỗ trợ các bạn cùng đội.' },
                { date: '2026-07-11', skillName: 'Kỹ năng nhóm lửa dã chiến', status: 'Đang rèn luyện', notes: 'Bé biết cách sắp xếp củi nhóm lò nhưng cần rèn luyện thêm sự kiên nhẫn khi đánh lửa bằng đá lửa.' },
                { date: '2026-07-12', skillName: 'Kỹ năng sơ cứu vết thương trầy xước', status: 'Đã hoàn thành', notes: 'Thực hành băng bó vết thương sạch sẽ, đúng quy trình vệ sinh sát khuẩn.' }
              ]
            }
          ],
          registeredProjectId: 'du-an-chien-binh-rung-xanh',
          packageName: 'Gói Chiến Binh Toàn Diện',
          amountPaid: 5200000,
          paymentStatus: 'Đã thanh toán',
          createdAt: '2026-07-01T10:30:00Z'
        },
        {
          id: 'parent-2',
          parentName: 'Trần Thị Mai',
          parentPhone: '0987654321',
          parentEmail: 'mai.tran@yahoo.com',
          children: [
            {
              studentName: 'Lê Quỳnh Chi',
              studentAge: 8,
              progressLog: [
                { date: '2026-06-15', skillName: 'Kỹ năng đo lường nguyên liệu làm bánh', status: 'Đã hoàn thành', notes: 'Bé đong chính xác gram bột và mililit sữa, sử dụng cân điện tử thành thạo.' },
                { date: '2026-06-22', skillName: 'Kỹ năng tự dọn dẹp bàn ăn ngăn nắp', status: 'Đã hoàn thành', notes: 'Tự giác rửa chén đĩa cá nhân, lau dọn khu vực chế biến sạch sẽ không cần nhắc nhở.' }
              ]
            }
          ],
          registeredProjectId: 'du-an-dau-bep-nhi',
          packageName: 'Gói MasterKid',
          amountPaid: 2400000,
          paymentStatus: 'Đã thanh toán',
          createdAt: '2026-06-10T14:20:00Z'
        },
        {
          id: 'parent-3',
          parentName: 'Phạm Minh Đức',
          parentPhone: '0912345678',
          parentEmail: 'duc.pham@gmail.com',
          children: [
            {
              studentName: 'Phạm Tuấn Kiệt',
              studentAge: 11,
              progressLog: []
            }
          ],
          registeredProjectId: 'du-an-so-cuu-an-toan',
          packageName: 'Gói Tiêu Chuẩn',
          amountPaid: 1200000,
          paymentStatus: 'Đã thanh toán',
          createdAt: '2026-07-15T09:15:00Z'
        }
      ],
      corporates: [
        {
          id: 'corp-1',
          corporateName: 'Công ty Công nghệ VNG Corporation',
          contactPerson: 'Bùi Anh Tuấn',
          contactPhone: '0933445566',
          contactEmail: 'tuanba@vng.com.vn',
          eventType: 'Kỹ năng sinh tồn',
          numberOfParticipants: 45,
          status: 'Đã lên lịch',
          pricePackage: 'Chương trình Chiến Binh Sinh Tồn 2 ngày 1 đêm dã ngoại',
          amount: 45000000,
          paymentStatus: 'Chờ thanh toán',
          createdAt: '2026-07-10T11:00:00Z'
        },
        {
          id: 'corp-2',
          corporateName: 'Hệ thống Trường mầm non Việt Úc VAS',
          contactPerson: 'Nguyễn Thanh Thủy',
          contactPhone: '0909887766',
          contactEmail: 'thuy.nt@vas.edu.vn',
          eventType: 'Kỹ năng cắm trại',
          numberOfParticipants: 120,
          status: 'Đã hoàn thành',
          pricePackage: 'Ngày hội Cắm Trại Trải Nghiệm Hoang Dã cho khối tiểu học',
          amount: 98000000,
          paymentStatus: 'Đã thanh toán',
          createdAt: '2026-05-12T08:30:00Z'
        },
        {
          id: 'corp-3',
          corporateName: 'Tập đoàn Bất động sản Novaland',
          contactPerson: 'Lê Hoàng Hải',
          contactPhone: '0911223344',
          contactEmail: 'hai.lh@novaland.com.vn',
          eventType: 'Team building tập thể',
          numberOfParticipants: 60,
          status: 'Chờ duyệt',
          pricePackage: 'Workshop Kỹ Năng Sơ Cứu và Phản Ứng Nhanh Nơi Đô Thị',
          amount: 35000000,
          paymentStatus: 'Chờ thanh toán',
          createdAt: '2026-07-18T16:45:00Z'
        }
      ],
      transactions: [
        {
          id: 'TXN-001',
          date: '2026-07-01',
          amount: 5200000,
          clientName: 'Nguyễn Văn Hùng',
          type: 'Phụ huynh',
          description: 'Thanh toán Gói Chiến Binh Toàn Diện - Chiến Binh Rừng Xanh',
          status: 'Thành công'
        },
        {
          id: 'TXN-002',
          date: '2026-06-10',
          amount: 2400000,
          clientName: 'Trần Thị Mai',
          type: 'Phụ huynh',
          description: 'Thanh toán Gói MasterKid - Đầu Bếp Nhí Tài Ba',
          status: 'Thành công'
        },
        {
          id: 'TXN-003',
          date: '2026-05-15',
          amount: 98000000,
          clientName: 'Hệ thống Trường mầm non Việt Úc VAS',
          type: 'Doanh nghiệp',
          description: 'Thanh toán hợp đồng Trại Hè Trải Nghiệm Hoang Dã khối tiểu học',
          status: 'Thành công'
        },
        {
          id: 'TXN-004',
          date: '2026-07-15',
          amount: 1200000,
          clientName: 'Phạm Minh Đức',
          type: 'Phụ huynh',
          description: 'Thanh toán Gói Tiêu Chuẩn - Kỹ Năng Sơ Cứu & An Toàn',
          status: 'Thành công'
        }
      ],
      news: [
        {
          id: 'art-1',
          title: '5 Phương Pháp Giáo Dục Kỹ Năng Sống Hiện Đại Cho Trẻ Cha Mẹ Nên Biết',
          excerpt: 'Tại sao việc rèn luyện kỹ năng sinh tồn và tự lập quan trọng hơn điểm số học tập? Khám phá xu hướng giáo dục Steiner và Montessori ứng dụng kỹ năng thực tế.',
          content: 'Trong kỷ nguyên số, việc bảo bọc con quá mức vô tình tước đi khả năng thích nghi và giải quyết vấn đề của trẻ. Các nghiên cứu chỉ ra rằng trẻ được tham gia các hoạt động giáo dục kỹ năng dã ngoại, sinh tồn hoang dã sẽ tăng cường hormone tự tin, có sức đề kháng tâm lý tốt hơn khi đối mặt với căng thẳng ở tuổi trưởng thành.\n\nCác phương pháp hiện đại tập trung vào 4 điểm cốt lõi:\n1. Học tập qua trải nghiệm thực tế (Experiential Learning).\n2. Cho phép trẻ mắc sai lầm có kiểm soát (Safe Risk-taking).\n3. Rèn luyện tư duy độc lập thông qua việc tự chế tạo công cụ.\n4. Gắn kết chặt chẽ với thế giới tự nhiên để cân bằng cảm xúc.',
          category: 'Phương pháp giáo dục',
          type: 'article',
          date: '2026-07-10',
          author: 'TS. Tâm lý Lê Anh Thư'
        },
        {
          id: 'art-2',
          title: 'Hướng dẫn trẻ cách xử lý khi bị hóc dị vật trong 3 phút vàng',
          excerpt: 'Xem video hướng dẫn thực hành động tác sơ cứu Heimlich chuẩn y khoa dành riêng cho học sinh tiểu học, giúp bé có thể tự cứu mình hoặc cứu bạn.',
          content: 'Hóc dị vật là tai nạn cực kỳ nguy hiểm có thể cướp đi sinh mạng của trẻ chỉ trong vài phút ngắn ngủi. Video này hướng dẫn chi tiết từng bước động tác đẩy bụng Heimlich cứu hộ, phân biệt cách xử lý ở trẻ nhũ nhi dưới 1 tuổi và trẻ lớn trên 2 tuổi.\n\nQuy tắc cơ bản:\n1. Khuyến khích trẻ ho mạnh nếu trẻ vẫn còn nói hoặc ho được.\n2. Vỗ lưng 5 phát dứt khoát giữa hai xương bả vai.\n3. Ấn ngực/Đẩy bụng Heimlich 5 lần liên tục nếu dị vật chưa thoát ra.\n4. Gọi khẩn cấp 115 ngay lập tức.',
          category: 'Kỹ năng sinh tồn',
          type: 'video',
          mediaUrl: 'https://www.youtube.com/embed/gD6vWeD9X4E', // Standard Red Cross Heimlich instruction embed
          date: '2026-07-12',
          author: 'Bác sĩ cấp cứu Nguyễn Huy Hoàng'
        },
        {
          id: 'art-3',
          title: 'Cẩm nang cắm trại dã ngoại cùng con: Chuẩn bị gì để chuyến đi trọn vẹn?',
          excerpt: 'Liệt kê danh sách các vật dụng cứu sinh, cách chọn lều trại chống mưa dông và các mẹo giữ ấm cơ thể khi nhiệt độ ban đêm xuống thấp cho trẻ em.',
          content: 'Đi cắm trại là cơ hội tuyệt vời để gắn kết tình cảm gia đình, đồng thời dạy trẻ cách thích nghi với cuộc sống thiếu thốn tiện nghi công nghệ. Cẩm nang tổng hợp các vật dụng cứu sinh không thể thiếu:\n- Hộp sơ cứu khẩn cấp chứa băng cá nhân, cồn sát khuẩn, thuốc hạ sốt.\n- Thiết bị chiếu sáng cá nhân (đèn đeo đầu) để trẻ tự tin đi lại trong đêm.\n- Quần áo giữ nhiệt tốt và xịt phòng chống muỗi vắt côn trùng rừng núi dã ngoại.',
          category: 'Kỹ năng cắm trại',
          type: 'article',
          date: '2026-07-18',
          author: 'Chuyên gia Dã Ngoại Trần Thế Linh'
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          recipient: 'Nguyễn Văn Hùng (hung.nguyen@gmail.com)',
          type: 'Email',
          title: 'Xác nhận đăng ký & Thanh toán thành công - Dự án Chiến Binh Rừng Xanh',
          content: 'Kính gửi Anh Hùng, Ban tổ chức KidSkill xác nhận đã nhận đủ số tiền 5.200.000đ đăng ký Gói Chiến Binh Toàn Diện cho bé Nguyễn Minh Quân. Hướng dẫn chuẩn bị đồ dùng đã được gửi kèm.',
          status: 'Đã gửi',
          sentAt: '2026-07-01T10:35:00Z'
        },
        {
          id: 'notif-2',
          recipient: 'Trần Thị Mai (mai.tran@yahoo.com)',
          type: 'Email',
          title: 'Cập nhật tiến trình rèn luyện hàng tuần của bé Lê Quỳnh Chi',
          content: 'Chào Chị Mai, bé Quỳnh Chi đã hoàn thành xuất sắc kỹ năng "Tự dọn dẹp bàn ăn ngăn nắp" tại buổi học Đầu Bếp Nhí Tài Ba hôm nay. Tiến trình phát triển đã được cập nhật trên cổng phụ huynh.',
          status: 'Đã gửi',
          sentAt: '2026-06-22T17:00:00Z'
        }
      ],
      cms: {
        siteTitle: 'Connect Kids - Kỹ Năng cho bé',
        header: {
          brandName: 'Connect Kids - Kỹ Năng cho bé',
          logoUrl: 'https://ibb.co/JWjMppVz',
          menuItems: [
            { label: 'Trang chủ', tab: 'home' },
            { label: 'Dự Án', tab: 'projects-list' },
            { label: 'Trò Chơi', tab: 'game' },
            { label: 'Thư Viện', tab: 'hub' },
            { label: 'Phụ Huynh', tab: 'parent-portal' },
            { label: 'Hợp Tác', tab: 'corporate-portal' },
            { label: 'Giới thiệu', tab: 'page-about' },
            { label: 'Liên hệ', tab: 'page-contact' }
          ]
        },
        footer: {
          campAddress: 'Vườn Quốc Gia Nam Cát Tiên, Tân Phú, Đồng Nai',
          officeAddress: 'Học viện Kỹ Năng Connect Kids, Quận 3, TP. Hồ Chí Minh',
          hotline: '1900 8123 (Phục vụ 24/7)',
          copyright: '© 2026 Connect Kids Platform. Bảo lưu mọi quyền.',
          facebookUrl: 'https://facebook.com',
          zaloUrl: 'https://zalo.me',
          youtubeUrl: 'https://youtube.com',
          tiktokUrl: 'https://tiktok.com'
        },
        homepage: {
          headline: 'Kiến Tạo Thế Hệ Trẻ Tự Lập, Bản Lĩnh Và Vững Vàng Kỹ Năng',
          subheadline: 'Chương trình huấn luyện dã ngoại sinh tồn, cắm trại thực tế phối hợp cùng các hoạt động tương tác, kết nối doanh nghiệp và hỗ trợ học bạ phát triển CRM tối ưu cho gia đình.',
          bannerUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
        },
        pages: [
          {
            id: 'page-about',
            title: 'Giới thiệu về Connect Kids',
            slug: 'about',
            content: 'Connect Kids (kynangck.edu.vn) là đơn vị giáo dục tiên phong tại Việt Nam chuyên thiết kế các chương trình dã ngoại, huấn luyện sinh tồn thực tế và kỹ năng sống tự lập cho thanh thiếu nhi từ 6-15 tuổi.\n\nSứ mệnh của Connect Kids là đưa trẻ rời xa thế giới ảo của điện thoại, máy tính để đắm mình vào môi trường dã ngoại tự nhiên hùng vĩ, thông qua đó rèn luyện bản lĩnh kiên cường, tính kỷ luật, khả năng tự chăm sóc bản thân và tinh thần đồng đội thấu hiểu.',
            createdAt: new Date().toISOString()
          },
          {
            id: 'page-contact',
            title: 'Liên hệ & Trụ sở Connect Kids',
            slug: 'contact',
            content: 'Mọi thông tin chi tiết và hỗ trợ tư vấn học bạ kỹ năng hoặc đặt trại dã ngoại cho tập thể, xin vui lòng liên hệ với Connect Kids:\n\n- Hotline trung tâm CRM: 1900 8123 (Hỗ trợ 24/7)\n- Email liên hệ: crm@kynangck.edu.vn\n- Trụ sở chính: Học viện Kỹ Năng Connect Kids, Thành phố Hồ Chí Minh\n- Địa điểm cắm trại chính: Khu vực dã ngoại rừng quốc gia Nam Cát Tiên, Tân Phú, Đồng Nai.',
            createdAt: new Date().toISOString()
          },
          {
            id: 'page-terms',
            title: 'Điều khoản sử dụng dịch vụ & dã ngoại Connect Kids',
            slug: 'terms',
            content: `CHÍNH SÁCH VÀ ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ DÃ NGOẠI & HỌC BẠ CRM CONNECT KIDS

Chào mừng Quý phụ huynh và các em học viên đến với Hệ thống Giáo dục & Dã ngoại Kỹ năng Connect Kids (kynangck.edu.vn). Khi truy cập website, đăng ký các dự án dã ngoại hoặc sử dụng Cổng Phụ huynh CRM, Quý khách đồng ý tuân thủ các điều khoản dịch vụ dưới đây:

1. QUY ĐỊNH ĐĂNG KÝ VÀ THAM GIA KHÓA HỌC/DÃ NGOẠI
- Học viên tham gia các chương trình dã ngoại sinh tồn, cắm trại thực tế cần đáp ứng yêu cầu độ tuổi từ 6 đến 15 tuổi (hoặc theo quy định cụ thể của từng dự án).
- Phụ huynh có trách nhiệm cung cấp chính xác thông tin tình trạng sức khỏe, tiền sử dị ứng, hoặc nhu cầu chăm sóc đặc biệt của con khi hoàn tất form đăng ký trực tuyến.

2. QUY ĐỊNH THANH TOÁN VÀ HOÀN HỦY VÉ
- Tất cả các khoản phí dã ngoại được thanh toán qua kênh ngân hàng điện tử chính thức của Connect Kids.
- Trường hợp phụ huynh cần hủy đăng ký trước 7 ngày khởi hành: Được hoàn 100% học phí hoặc bảo lưu sang dự án tiếp theo.
- Hủy trong vòng 3 đến 6 ngày trước khởi hành: Được hỗ trợ chuyển suất dã ngoại cho bé khác hoặc bảo lưu 70% phí.
- Trường hợp hoãn/hủy do thời tiết thiên tai nguy hiểm: Ban tổ chức sẽ chủ động thông báo và hoàn trả 100% phí hoặc xếp lịch trải nghiệm bù an toàn nhất.

3. AN TOÀN VÀ BẢO HIỂM TRẢI NGHIỆM
- 100% học viên tham gia dã ngoại được đóng bảo hiểm du lịch trải nghiệm cao cấp.
- Đội ngũ huấn luyện viên (tỷ lệ 1 KTV kèm 4-5 học sinh) cùng y tế túc trực 24/7 trong suốt chuyến hành trình.
- Học viên phải tuân thủ nghiêm ngặt các quy định an toàn dã ngoại, không tự ý rời khỏi khu vực tập trung khi chưa có sự đồng ý của Trại trưởng.

4. BẢO VỆ DỮ LIỆU CÁ NHÂN VÀ HỌC BẠ ĐIỆN TỬ CRM
- Thông tin học bạ kỹ năng, hình ảnh trải nghiệm của học viên chỉ phục vụ cho việc theo dõi tiến trình phát triển và gửi báo cáo cho phụ huynh trên Cổng CRM.
- Ban tổ chức cam kết không chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại.

5. ĐIỀU CHỈNH VÀ CẬP NHẬT
Connect Kids có quyền cập nhật các điều khoản này để phù hợp với quy định pháp luật và nâng cao chất lượng dịch vụ. Mọi thay đổi sẽ được công bố công khai trên website.`,
            createdAt: new Date().toISOString()
          },
          {
            id: 'page-privacy',
            title: 'Chính sách bảo mật thông tin & dữ liệu Connect Kids',
            slug: 'privacy',
            content: `CHÍNH SÁCH BẢO MẬT THÔNG TIN VÀ DỮ LIỆU PHỤ HUYNH & HỌC VIÊN CONNECT KIDS

Connect Kids (kynangck.edu.vn) cam kết bảo vệ tuyệt đối thông tin riêng tư của Quý phụ huynh và các em học sinh khi tương tác trên nền tảng trực tuyến cũng như trong suốt quá trình tham gia các khóa học dã ngoại.

1. THÔNG TIN THU THẬP
Chúng tôi thu thập các thông tin cần thiết nhằm phục vụ cho việc tổ chức dã ngoại an toàn và theo dõi học bạ kỹ năng:
- Thông tin Phụ huynh: Họ tên, Số điện thoại (dùng tra cứu sổ học bạ CRM), Email, Địa chỉ liên hệ.
- Thông tin Học viên: Họ tên bé, Tuổi, Lớp học, Tiền sử sức khỏe/dị ứng (nếu có), Tiến trình rèn luyện kỹ năng.

2. MỤC ĐÍCH SỬ DỤNG THÔNG TIN
Thông tin thu thập được sử dụng duy nhất cho các mục đích:
- Xác nhận đăng ký và gửi thông báo lịch trình dã ngoại, cẩm nang chuẩn bị.
- Cập nhật nhật ký rèn luyện kỹ năng thực tế lên Cổng tra cứu Phụ huynh CRM.
- Mua bảo hiểm du lịch dã ngoại khẩn cấp cho bé.
- Gửi thông báo chăm sóc khách hàng và các chương trình ưu đãi giáo dục mới.

3. CAM KẾT BẢO MẬT DỮ LIỆU
- Dữ liệu được lưu trữ mã hóa an toàn trên hệ thống máy chủ đám mây tiên tiến.
- Tuyệt đối KHÔNG bán, chia sẻ hoặc trao đổi thông tin phụ huynh cho bất kỳ đơn vị quảng cáo thứ ba nào.
- Chỉ đội ngũ giáo viên, huấn luyện viên trực tiếp quản lý trại mới có quyền truy cập thông tin học viên để hỗ trợ chăm sóc bé.

4. HÌNH ẢNH VÀ TRUYỀN THÔNG DÃ NGOẠI
- Hình ảnh và video ghi lại quá trình trải nghiệm dã ngoại của các bé sẽ được lưu trữ trong thư viện khoảnh khắc cho phụ huynh xem và tải về.
- Nếu Quý phụ huynh không muốn hiển thị hình ảnh của con trên kênh truyền thông chung, vui lòng gửi yêu cầu đến email crm@kynangck.edu.vn hoặc hotline 1900 8123.

5. QUYỀN CỦA PHỤ HUYNH ĐỐI VỚI DỮ LIỆU
Phụ huynh có quyền tra cứu, chỉnh sửa thông tin cá nhân hoặc yêu cầu xóa dữ liệu học bạ sau khi khóa học kết thúc bằng cách liên hệ với bộ phận CSKH của Connect Kids.`,
            createdAt: new Date().toISOString()
          }
        ],
        postCategories: ['Phương pháp giáo dục', 'Kỹ năng cắm trại', 'Kỹ năng sinh tồn', 'Tâm lý trẻ em'],
        pageCategories: ['Giới thiệu', 'Chính sách', 'Tuyển sinh', 'Liên hệ'],
        postCategoryTree: {
          "Bài viết": ["Phương pháp giáo dục", "Tâm lý trẻ em", "Cẩm nang dã ngoại"],
          "Hình ảnh": ["Hoạt động dã ngoại", "Rèn luyện tự lập"],
          "Video": ["Video thực hành", "Hướng dẫn sinh tồn"]
        },
        projectCategoryTree: {
          "Khóa Học": ["Kỹ năng sống", "Kỹ năng tự lập", "Tư duy sinh tồn", "Phản ứng khẩn cấp"],
          "Trải Nghiệm": ["Cắm trại hoang dã", "Dã ngoại thực tế", "Lớp học thiên nhiên", "Thám hiểm tự nhiên"],
          "Sân Chơi": ["Trò chơi vận động", "Thử thách trí tuệ", "Cuộc thi sinh tồn", "Sân chơi gia đình", "Hội trại dã ngoại"],
          "Cộng Đồng": ["Dự án xanh", "Tình nguyện nhí", "Gắn kết phụ huynh", "Hoạt động xã hội"]
        },
        supportCta: {
          title: 'Cần hỗ trợ trực tiếp?',
          description: 'Đăng ký tham gia dã ngoại ngay tại Trang chủ để rèn luyện kỹ năng thực tế cho bé.',
          buttonText: 'Xem lịch tuyển sinh',
          buttonLink: 'home'
        },
        theme: {
          primaryColor: '5C7A3E',
          accentColor: 'F08C3A',
          webBgColor: 'FAF7F0',
          headerBgColor: 'FAF7F0',
          footerBgColor: '5C7A3E',
          linkColor: '5C7A3E'
        }
      }
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function ensureCmsIntegrity(db: DBData): boolean {
  if (!db.cms) db.cms = {} as any;
  let modified = false;

  // 1. Static Pages Integrity
  if (!db.cms.pages || !Array.isArray(db.cms.pages)) {
    db.cms.pages = [];
    modified = true;
  }

  const defaultPages = [
    {
      id: 'page-about',
      title: 'Giới thiệu Hệ thống Giáo dục & Dã ngoại Connect Kids',
      slug: 'about',
      content: `HỌC VIỆN DÃ NGOẠI & KỸ NĂNG SINH TỒN CONNECT KIDS (KYNANGCK)\n\nConnect Kids là đơn vị tiên phong tại Việt Nam tích hợp giáo dục trải nghiệm dã ngoại thực tế, rèn luyện kỹ năng sinh tồn và học bạ điện tử CRM theo dõi sự trưởng thành của trẻ.\n\nTẦM NHÌN & SỨ MỆNH:\n- Giúp trẻ bứt phá sự tự tin, tự lập và kiên cường.\n- Tách trẻ khỏi các thiết bị điện tử, đưa con về với thiên nhiên.\n- Đội ngũ 100% chuyên gia và huấn luyện viên quốc tế.`,
      createdAt: new Date().toISOString()
    },
    {
      id: 'page-contact',
      title: 'Liên hệ & Trụ sở Connect Kids',
      slug: 'contact',
      content: `Mọi thông tin chi tiết và hỗ trợ tư vấn học bạ kỹ năng hoặc đặt trại dã ngoại cho tập thể, xin vui lòng liên hệ with Connect Kids:\n\n- Hotline trung tâm CRM: 1900 8123 (Hỗ trợ 24/7)\n- Email liên hệ: crm@kynangck.edu.vn\n- Trụ sở chính: Học viện Kỹ Năng Connect Kids, Thành phố Hồ Chí Minh\n- Địa điểm cắm trại chính: Khu vực dã ngoại rừng quốc gia Nam Cát Tiên, Tân Phú, Đồng Nai.`,
      createdAt: new Date().toISOString()
    },
    {
      id: 'page-team',
      title: 'Đội Ngũ Huấn Luyện Viên & Chuyên Gia Connect Kids',
      slug: 'team',
      content: `ĐỘI NGŨ HUẤN LUYỆN VIÊN & CHUYÊN GIA GIÁO DỤC CONNECT KIDS\n\nĐội ngũ huấn luyện viên và chuyên gia dã ngoại tại Connect Kids bao gồm các bác sĩ tâm lý, chuyên gia sinh tồn hoang dã và huấn luyện viên kỹ năng sống giàu kinh nghiệm.\n\n- TS. Lê Anh Thư - Chuyên gia Tâm lý Trẻ em & Phương pháp Steiner\n- Bác sĩ Nguyễn Huy Hoàng - Chuyên gia Y tế Cấp cứu & Sơ cứu dã ngoại\n- Huấn luyện viên Trần Thế Linh - Chuyên gia Sinh tồn & Kỹ năng cắm trại hoang dã\n- Đội ngũ Kỹ thuật viên (tỷ lệ 1 KTV kèm 4-5 học viên) túc trực 24/7 trong suốt các chuyến dã ngoại.`,
      createdAt: new Date().toISOString()
    },
    {
      id: 'page-terms',
      title: 'Điều khoản sử dụng dịch vụ & dã ngoại Connect Kids',
      slug: 'terms',
      content: `CHÍNH SÁCH VÀ ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ DÃ NGOẠI & HỌC BẠ CRM CONNECT KIDS\n\nChào mừng Quý phụ huynh và các em học viên đến với Hệ thống Giáo dục & Dã ngoại Kỹ năng Connect Kids (kynangck.edu.vn). Khi truy cập website, đăng ký các dự án dã ngoại hoặc sử dụng Cổng Phụ huynh CRM, Quý khách đồng ý tuân thủ các điều khoản dịch vụ dưới đây:\n\n1. QUY ĐỊNH ĐĂNG KÝ VÀ THAM GIA KHÓA HỌC/DÃ NGOẠI\n- Học viên tham gia các chương trình dã ngoại sinh tồn, cắm trại thực tế cần đáp ứng yêu cầu độ tuổi từ 6 đến 15 tuổi.\n- Phụ huynh có trách nhiệm cung cấp chính xác thông tin tình trạng sức khỏe, tiền sử dị ứng, hoặc nhu cầu chăm sóc đặc biệt của con khi hoàn tất form đăng ký trực tuyến.\n\n2. QUY ĐỊNH THANH TOÁN VÀ HOÀN HỦY VÉ\n- Tất cả các khoản phí dã ngoại được thanh toán qua kênh ngân hàng điện tử chính thức của Connect Kids.\n- Hủy đăng ký trước 7 ngày khởi hành: Được hoàn 100% học phí hoặc bảo lưu sang dự án tiếp theo.\n- Hủy trong vòng 3 đến 6 ngày trước khởi hành: Được hỗ trợ chuyển suất dã ngoại cho bé khác hoặc bảo lưu 70% phí.\n\n3. AN TOÀN VÀ BẢO HIỂM TRẢI NGHIỆM\n- 100% học viên tham gia dã ngoại được đóng bảo hiểm du lịch trải nghiệm cao cấp.\n- Đội ngũ huấn luyện viên (tỷ lệ 1 KTV kèm 4-5 học sinh) cùng y tế túc trực 24/7 trong suốt chuyến hành trình.\n\n4. BẢO VỆ DỮ LIỆU CÁ NHÂN VÀ HỌC BẠ ĐIỆN TỬ CRM\n- Thông tin học bạ kỹ năng, hình ảnh trải nghiệm của học viên chỉ phục vụ cho việc theo dõi tiến trình phát triển và gửi báo cáo cho phụ huynh trên Cổng CRM.`,
      createdAt: new Date().toISOString()
    },
    {
      id: 'page-privacy',
      title: 'Chính sách bảo mật thông tin & dữ liệu Connect Kids',
      slug: 'privacy',
      content: `CHÍNH SÁCH BẢO MẬT THÔNG TIN VÀ DỮ LIỆU PHỤ HUYNH & HỌC VIÊN CONNECT KIDS\n\nConnect Kids (kynangck.edu.vn) cam kết bảo vệ tuyệt đối thông tin riêng tư của Quý phụ huynh và các em học sinh.\n\n1. THÔNG TIN THU THẬP\nWe collect information required for safety and skill progress tracking:\n- Thông tin Phụ huynh: Họ tên, Số điện thoại (dùng tra cứu sổ học bạ CRM), Email, Địa chỉ liên hệ.\n- Thông tin Học viên: Họ tên bé, Tuổi, Lớp học, Tiền sử sức khỏe/dị ứng.\n\n2. MỤC ĐÍCH SỬ DỤNG THÔNG TIN\n- Xác nhận đăng ký và gửi thông báo lịch trình dã ngoại.\n- Cập nhật nhật ký rèn luyện kỹ năng thực tế lên Cổng tra cứu Phụ huynh CRM.\n- Mua bảo hiểm du lịch dã ngoại khẩn cấp cho bé.\n\n3. CAM KẾT BẢO MẬT DỮ LIỆU\n- Dữ liệu được lưu trữ mã hóa an toàn trên hệ thống máy chủ đám mây tiên tiến.\n- Tuyệt đối KHÔNG bán, chia sẻ hoặc trao đổi thông tin phụ huynh cho bất kỳ đơn vị thứ ba nào.`,
      createdAt: new Date().toISOString()
    }
  ];

  defaultPages.forEach(def => {
    if (!db.cms.pages.some((p: any) => p.slug === def.slug)) {
      db.cms.pages.push(def);
      modified = true;
    }
  });

  // 2. Post Category Tree Integrity
  if (!db.cms.postCategoryTree) {
    db.cms.postCategoryTree = {};
    modified = true;
  }
  const defaultPostTree: { [parent: string]: string[] } = {
    "Bài viết": ["Phương pháp giáo dục", "Tâm lý trẻ em", "Cẩm nang dã ngoại", "Kiến thức kỹ năng", "Sơ cứu & An toàn"],
    "Hình ảnh": ["Hoạt động dã ngoại", "Khu cắm trại", "Thánh địa sinh tồn", "Khoảnh khắc học viên", "Rèn luyện tự lập"],
    "Video": ["Video thực hành", "Hướng dẫn sinh tồn", "Góc nhìn học viên", "Kỷ niệm dã ngoại", "Kỹ năng cắm trại"]
  };
  Object.keys(defaultPostTree).forEach(pKey => {
    if (!db.cms.postCategoryTree[pKey]) {
      db.cms.postCategoryTree[pKey] = [...defaultPostTree[pKey]];
      modified = true;
    } else {
      defaultPostTree[pKey].forEach(sub => {
        if (!db.cms.postCategoryTree[pKey].includes(sub)) {
          db.cms.postCategoryTree[pKey].push(sub);
          modified = true;
        }
      });
    }
  });
  if (db.news) {
    db.news.forEach(art => {
      if (!art.category) return;
      const targetBranch = art.type === 'image' ? "Hình ảnh" : art.type === 'video' ? "Video" : "Bài viết";
      if (db.cms.postCategoryTree[targetBranch] && !db.cms.postCategoryTree[targetBranch].includes(art.category)) {
        db.cms.postCategoryTree[targetBranch].push(art.category);
        modified = true;
      }
    });
  }

  // 3. Project Category Tree Integrity
  if (!db.cms.projectCategoryTree) {
    db.cms.projectCategoryTree = {};
    modified = true;
  }

  // Handle legacy 'Khóa học' key if present in projectCategoryTree
  if (db.cms.projectCategoryTree["Khóa học"]) {
    const legacySubs = db.cms.projectCategoryTree["Khóa học"] || [];
    delete db.cms.projectCategoryTree["Khóa học"];
    if (!db.cms.projectCategoryTree["Khóa Học"]) {
      db.cms.projectCategoryTree["Khóa Học"] = [];
    }
    legacySubs.forEach((s: string) => {
      if (!db.cms.projectCategoryTree["Khóa Học"].includes(s)) {
        db.cms.projectCategoryTree["Khóa Học"].push(s);
      }
    });
    modified = true;
  }

  const defaultProjectTree: { [parent: string]: string[] } = {
    "Khóa Học": ["Kỹ năng sinh tồn", "Kỹ năng tự lập", "An toàn dã ngoại", "Kỹ năng sống", "Tư duy sinh tồn", "Phản ứng khẩn cấp"],
    "Trải Nghiệm": ["Cắm trại hoang dã", "Dã ngoại thực tế", "Lớp học thiên nhiên", "Thám hiểm rừng sâu", "Hành trình di sản", "Thám hiểm tự nhiên"],
    "Sân Chơi": ["Cuộc thi sinh tồn", "Sân chơi sáng tạo", "Ngày hội gia đình", "Trò chơi vận động", "Thử thách trí tuệ", "Sân chơi gia đình", "Hội trại dã ngoại"],
    "Cộng Đồng": ["Dự án xanh", "Tình nguyện nhí", "Gắn kết phụ huynh", "Hoạt động xã hội"]
  };

  Object.keys(defaultProjectTree).forEach(pKey => {
    if (!db.cms.projectCategoryTree[pKey]) {
      db.cms.projectCategoryTree[pKey] = [...defaultProjectTree[pKey]];
      modified = true;
    } else {
      defaultProjectTree[pKey].forEach(sub => {
        if (!db.cms.projectCategoryTree[pKey].includes(sub)) {
          db.cms.projectCategoryTree[pKey].push(sub);
          modified = true;
        }
      });
    }
  });

  // Sync projects casing and sync project subcategories into cms.projectCategoryTree
  if (db.projects) {
    db.projects.forEach(proj => {
      if (proj.mainCategory === 'Khóa học') {
        proj.mainCategory = 'Khóa Học';
        modified = true;
      }
      if (proj.category && proj.category.startsWith('Khóa học »')) {
        proj.category = proj.category.replace('Khóa học »', 'Khóa Học »');
        modified = true;
      }
      const mCat = proj.mainCategory || 'Khóa Học';
      const sCat = proj.subCategory || (proj.category && proj.category.includes('»') ? proj.category.split('»')[1].trim() : proj.category);
      if (mCat && sCat && db.cms.projectCategoryTree[mCat]) {
        if (!db.cms.projectCategoryTree[mCat].includes(sCat)) {
          db.cms.projectCategoryTree[mCat].push(sCat);
          modified = true;
        }
      }
    });
  }

  return modified;
}

export function getDb(): DBData {
  if (inMemoryDbCache) {
    return inMemoryDbCache;
  }
  ensureDb();
  const content = fs.readFileSync(DB_FILE, 'utf-8');
  const db = JSON.parse(content);

  let modified = false;
  if (!db.projects) { db.projects = []; modified = true; }
  if (!db.parents) { db.parents = []; modified = true; }
  if (!db.corporates) { db.corporates = []; modified = true; }
  if (!db.transactions) { db.transactions = []; modified = true; }
  if (!db.news) {
    db.news = [
      {
        id: 'art-1',
        title: '5 Phương Pháp Giáo Dục Kỹ Năng Sống Hiện Đại Cho Trẻ Cha Mẹ Nên Biết',
        excerpt: 'Tại sao việc rèn luyện kỹ năng sinh tồn và tự lập quan trọng hơn điểm số học tập? Khám phá xu hướng giáo dục Steiner và Montessori ứng dụng kỹ năng thực tế.',
        content: 'Trong kỷ nguyên số, việc bảo bọc con quá mức vô tình tước đi khả năng thích nghi và giải quyết vấn đề của trẻ. Các nghiên cứu chỉ ra rằng trẻ được tham gia các hoạt động giáo dục kỹ năng dã ngoại, sinh tồn hoang dã sẽ tăng cường hormone tự tin, có sức đề kháng tâm lý tốt hơn khi đối mặt với căng thẳng ở tuổi trưởng thành.\n\nCác phương pháp hiện đại tập trung vào 4 điểm cốt lõi:\n1. Học tập qua trải nghiệm thực tế (Experiential Learning).\n2. Cho phép trẻ mắc sai lầm có kiểm soát (Safe Risk-taking).\n3. Rèn luyện tư duy độc lập thông qua việc tự chế tạo công cụ.\n4. Gắn kết chặt chẽ với thế giới tự nhiên để cân bằng cảm xúc.',
        category: 'Phương pháp giáo dục',
        type: 'article',
        date: '2026-07-10',
        author: 'TS. Tâm lý Lê Anh Thư'
      },
      {
        id: 'art-2',
        title: 'Hướng dẫn trẻ cách xử lý khi bị hóc dị vật trong 3 phút vàng',
        excerpt: 'Xem video hướng dẫn thực hành động tác sơ cứu Heimlich chuẩn y khoa dành riêng cho học sinh tiểu học, giúp bé có thể tự cứu mình hoặc cứu bạn.',
        content: 'Hóc dị vật là tai nạn cực kỳ nguy hiểm có thể cướp đi sinh mạng của trẻ chỉ trong vài phút ngắn ngủi. Video này hướng dẫn chi tiết từng bước động tác đẩy bụng Heimlich cứu hộ, phân biệt cách xử lý ở trẻ nhũ nhi dưới 1 tuổi và trẻ lớn trên 2 tuổi.\n\nQuy tắc cơ bản:\n1. Khuyến khích trẻ ho mạnh nếu trẻ vẫn còn nói hoặc ho được.\n2. Vỗ lưng 5 phát dứt khoát giữa hai xương bả vai.\n3. Ấn ngực/Đẩy bụng Heimlich 5 lần liên tục nếu dị vật chưa thoát ra.\n4. Gọi khẩn cấp 115 ngay lập tức.',
        category: 'Kỹ năng sinh tồn',
        type: 'video',
        mediaUrl: 'https://www.youtube.com/embed/gD6vWeD9X4E',
        date: '2026-07-12',
        author: 'Bác sĩ cấp cứu Nguyễn Huy Hoàng'
      },
      {
        id: 'art-3',
        title: 'Cẩm nang cắm trại dã ngoại cùng con: Chuẩn bị gì để chuyến đi trọn vẹn?',
        excerpt: 'Liệt kê danh sách các vật dụng cứu sinh, cách chọn lều trại chống mưa dông và các mẹo giữ ấm cơ thể khi nhiệt độ ban đêm xuống thấp cho trẻ em.',
        content: 'Đi cắm trại là cơ hội tuyệt vời để gắn kết tình cảm gia đình, đồng thời dạy trẻ cách thích nghi với cuộc sống thiếu thốn tiện nghi công nghệ. Cẩm nang tổng hợp các vật dụng cứu sinh không thể thiếu:\n- Hộp sơ cứu khẩn cấp chứa băng cá nhân, cồn sát khuẩn, thuốc hạ sốt.\n- Thiết bị chiếu sáng cá nhân (đèn đeo đầu) để trẻ tự tin đi lại trong đêm.\n- Quần áo giữ nhiệt tốt và xịt phòng chống muỗi vắt côn trùng rừng núi dã ngoại.',
        category: 'Kỹ năng cắm trại',
        type: 'article',
        date: '2026-07-18',
        author: 'Chuyên gia Dã Ngoại Trần Thế Linh'
      }
    ];
    modified = true;
  }
  if (!db.notifications) { db.notifications = []; modified = true; }
  if (modified) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  if (!db.cms) {
    db.cms = {
      header: {
        brandName: 'Connect Kids',
        logoUrl: 'https://i.ibb.co/LDd2ggmC/logo-kynangck.webp',
        menuItems: [
          { label: 'Trang chủ', tab: 'home' },
          { label: 'Trò Chơi', tab: 'game' },
          { label: 'Thư Viện', tab: 'hub' },
          { label: 'Phụ Huynh', tab: 'parent-portal' }
        ]
      },
      footer: {
        campAddress: 'Vườn Quốc Gia Nam Cát Tiên, Tân Phú, Đồng Nai',
        officeAddress: 'Học viện Kỹ Năng KynangCK, Quận 3, TP. Hồ Chí Minh',
        hotline: '1900 8123 (Phục vụ 24/7)',
        copyright: '© 2026 KynangCK Education Platform (kynangck.edu.vn). Bảo lưu mọi quyền.'
      },
      homepage: {
        headline: 'Kiến Tạo Thế Hệ Trẻ Tự Lập, Bản Lĩnh Và Vững Vàng Kỹ Năng',
        subheadline: 'Chương trình huấn luyện dã ngoại sinh tồn, cắm trại thực tế phối hợp cùng các hoạt động tương tác, kết nối doanh nghiệp và hỗ trợ học bạ phát triển CRM tối ưu cho gia đình.',
        bannerUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
      },
      pages: [
        {
          id: 'page-about',
          title: 'Giới thiệu về KynangCK',
          slug: 'about',
          content: 'KynangCK (kynangck.edu.vn) là đơn vị giáo dục tiên phong tại Việt Nam chuyên thiết kế các chương trình dã ngoại, huấn luyện sinh tồn thực tế và kỹ năng sống tự lập cho thanh thiếu nhi từ 6-15 tuổi.\n\nSứ mệnh của KynangCK là đưa trẻ rời xa thế giới ảo của điện thoại, máy tính để đắm mình vào môi trường dã ngoại tự nhiên hùng vĩ, thông qua đó rèn luyện bản lĩnh kiên cường, tính kỷ luật, khả năng tự chăm sóc bản thân và tinh thần đồng đội thấu hiểu.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'page-contact',
          title: 'Liên hệ & Trụ sở KynangCK',
          slug: 'contact',
          content: 'Mọi thông tin chi tiết và hỗ trợ tư vấn học bạ kỹ năng hoặc đặt trại dã ngoại cho tập thể, xin vui lòng liên hệ with KynangCK:\n\n- Hotline trung tâm CRM: 1900 8123 (Hỗ trợ 24/7)\n- Email liên hệ: crm@kynangck.edu.vn\n- Trụ sở chính: Học viện Kỹ Năng KynangCK, Thành phố Hồ Chí Minh\n- Địa điểm cắm trại chính: Khu vực dã ngoại rừng quốc gia Nam Cát Tiên, Tân Phú, Đồng Nai.',
          createdAt: new Date().toISOString()
        }
      ],
      postCategories: ['Phương pháp giáo dục', 'Kỹ năng cắm trại', 'Kỹ năng sinh tồn', 'Tâm lý trẻ em'],
      pageCategories: ['Giới thiệu', 'Chính sách', 'Tuyển sinh', 'Liên hệ'],
      postCategoryTree: {
        "Bài viết": ["Phương pháp giáo dục", "Tâm lý trẻ em", "Cẩm nang dã ngoại"],
        "Hình ảnh": ["Hoạt động dã ngoại", "Rèn luyện tự lập"],
        "Video": ["Video thực hành", "Hướng dẫn sinh tồn"]
      },
      projectCategoryTree: {
        "Khóa Học": ["Kỹ năng sống", "Kỹ năng tự lập", "Tư duy sinh tồn"],
        "Trải Nghiệm": ["Cắm trại hoang dã", "Dã ngoại thực tế", "Lớp học thiên nhiên"],
        "Sân Chơi": ["Trò chơi vận động", "Thử thách trí tuệ"]
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
  if (db.cms && db.cms.header) {
    const default4MenuItems = [
      { label: 'Trang chủ', tab: 'home' },
      { label: 'Trò Chơi', tab: 'game' },
      { label: 'Thư Viện', tab: 'hub' },
      { label: 'Phụ Huynh', tab: 'parent-portal' }
    ];
    let needsSave = false;
    if (db.cms.header.brandName === 'KynangCK' || db.cms.header.brandName === 'Connect Kids - Kỹ Năng cho bé') {
      db.cms.header.brandName = 'Connect Kids';
      needsSave = true;
    }
    if (!db.cms.header.menuItems || !Array.isArray(db.cms.header.menuItems) || db.cms.header.menuItems.length === 0) {
      db.cms.header.menuItems = default4MenuItems;
      needsSave = true;
    } else {
      // Clean up legacy item names if any exist
      db.cms.header.menuItems = db.cms.header.menuItems.map((m: any) => {
        let label = m.label || 'Trang';
        let tab = m.tab || (m.link ? m.link.replace(/^\//, '') : 'home');
        if (label === 'Sân chơi Kỹ năng' || label === 'Sân chơi Kỹ Năng' || (tab === 'game' && label === 'Sân chơi')) {
          label = 'Trò Chơi';
          needsSave = true;
        } else if (label === 'Chia Sẻ Kỹ Năng' || (tab === 'hub' && label === 'Chia sẻ')) {
          label = 'Thư Viện';
          needsSave = true;
        } else if (label === 'Cổng Phụ Huynh' || (tab === 'parent-portal' && label === 'Học bạ CRM')) {
          label = 'Phụ Huynh';
          needsSave = true;
        }
        return { label, tab };
      });
    }
    if (needsSave) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
  }

  if (db.cms && db.cms.pages) {
    let pagesChanged = false;
    if (!db.cms.pages.some((p: any) => p.slug === 'terms')) {
      db.cms.pages.push({
        id: 'page-terms',
        title: 'Điều khoản sử dụng dịch vụ & dã ngoại Connect Kids',
        slug: 'terms',
        content: `CHÍNH SÁCH VÀ ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ DÃ NGOẠI & HỌC BẠ CRM CONNECT KIDS

Chào mừng Quý phụ huynh và các em học viên đến với Hệ thống Giáo dục & Dã ngoại Kỹ năng Connect Kids (kynangck.edu.vn). Khi truy cập website, đăng ký các dự án dã ngoại hoặc sử dụng Cổng Phụ huynh CRM, Quý khách đồng ý tuân thủ các điều khoản dịch vụ dưới đây:

1. QUY ĐỊNH ĐĂNG KÝ VÀ THAM GIA KHÓA HỌC/DÃ NGOẠI
- Học viên tham gia các chương trình dã ngoại sinh tồn, cắm trại thực tế cần đáp ứng yêu cầu độ tuổi từ 6 đến 15 tuổi.
- Phụ huynh có trách nhiệm cung cấp chính xác thông tin tình trạng sức khỏe, tiền sử dị ứng, hoặc nhu cầu chăm sóc đặc biệt của con khi hoàn tất form đăng ký trực tuyến.

2. QUY ĐỊNH THANH TOÁN VÀ HOÀN HỦY VÉ
- Tất cả các khoản phí dã ngoại được thanh toán qua kênh ngân hàng điện tử chính thức của Connect Kids.
- Hủy đăng ký trước 7 ngày khởi hành: Được hoàn 100% học phí hoặc bảo lưu sang dự án tiếp theo.
- Hủy trong vòng 3 đến 6 ngày trước khởi hành: Được hỗ trợ chuyển suất dã ngoại cho bé khác hoặc bảo lưu 70% phí.

3. AN TOÀN VÀ BẢO HIỂM TRẢI NGHIỆM
- 100% học viên tham gia dã ngoại được đóng bảo hiểm du lịch trải nghiệm cao cấp.
- Đội ngũ huấn luyện viên (tỷ lệ 1 KTV kèm 4-5 học sinh) cùng y tế túc trực 24/7 trong suốt chuyến hành trình.

4. BẢO VỆ DỮ LIỆU CÁ NHÂN VÀ HỌC BẠ ĐIỆN TỬ CRM
- Thông tin học bạ kỹ năng, hình ảnh trải nghiệm của học viên chỉ phục vụ cho việc theo dõi tiến trình phát triển và gửi báo cáo cho phụ huynh trên Cổng CRM.`,
        createdAt: new Date().toISOString()
      });
      pagesChanged = true;
    }
    if (!db.cms.pages.some((p: any) => p.slug === 'privacy')) {
      db.cms.pages.push({
        id: 'page-privacy',
        title: 'Chính sách bảo mật thông tin & dữ liệu Connect Kids',
        slug: 'privacy',
        content: `CHÍNH SÁCH BẢO MẬT THÔNG TIN VÀ DỮ LIỆU PHỤ HUYNH & HỌC VIÊN CONNECT KIDS

Connect Kids (kynangck.edu.vn) cam kết bảo vệ tuyệt đối thông tin riêng tư của Quý phụ huynh và các em học sinh.

1. THÔNG TIN THU THẬP
We collect information required for safety and skill progress tracking:
- Thông tin Phụ huynh: Họ tên, Số điện thoại (dùng tra cứu sổ học bạ CRM), Email, Địa chỉ liên hệ.
- Thông tin Học viên: Họ tên bé, Tuổi, Lớp học, Tiền sử sức khỏe/dị ứng.

2. MỤC ĐÍCH SỬ DỤNG THÔNG TIN
- Xác nhận đăng ký và gửi thông báo lịch trình dã ngoại.
- Cập nhật nhật ký rèn luyện kỹ năng thực tế lên Cổng tra cứu Phụ huynh CRM.
- Mua bảo hiểm du lịch dã ngoại khẩn cấp cho bé.

3. CAM KẾT BẢO MẬT DỮ LIỆU
- Dữ liệu được lưu trữ mã hóa an toàn trên hệ thống máy chủ đám mây tiên tiến.
- Tuyệt đối KHÔNG bán, chia sẻ hoặc trao đổi thông tin phụ huynh cho bất kỳ đơn vị thứ ba nào.`,
        createdAt: new Date().toISOString()
      });
      pagesChanged = true;
    }
    if (!db.cms.pages.some((p: any) => p.slug === 'team')) {
      db.cms.pages.push({
        id: 'page-team',
        title: 'Đội Ngũ Huấn Luyện Viên & Chuyên Gia Connect Kids',
        slug: 'team',
        content: `ĐỘI NGŨ HUẤN LUYỆN VIÊN & CHUYÊN GIA GIÁO DỤC CONNECT KIDS

Đội ngũ huấn luyện viên và chuyên gia dã ngoại tại Connect Kids bao gồm các bác sĩ tâm lý, chuyên gia sinh tồn hoang dã và huấn luyện viên kỹ năng sống giàu kinh nghiệm.

- TS. Lê Anh Thư - Chuyên gia Tâm lý Trẻ em & Phương pháp Steiner
- Bác sĩ Nguyễn Huy Hoàng - Chuyên gia Y tế Cấp cứu & Sơ cứu dã ngoại
- Huấn luyện viên Trần Thế Linh - Chuyên gia Sinh tồn & Kỹ năng cắm trại hoang dã
- Đội ngũ Kỹ thuật viên (tỷ lệ 1 KTV kèm 4-5 học viên) túc trực 24/7 trong suốt các chuyến dã ngoại.`,
        createdAt: new Date().toISOString()
      });
      pagesChanged = true;
    }
    if (pagesChanged) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
  }

  if (db.cms && !db.cms.theme) {
    db.cms.theme = {
      primaryColor: '5C7A3E',
      accentColor: 'F08C3A',
      webBgColor: 'FAF7F0',
      headerBgColor: 'FAF7F0',
      footerBgColor: '5C7A3E',
      linkColor: '5C7A3E'
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
  if (!db.feedbacks) {
    db.feedbacks = [
      {
        id: 'fb-1',
        parentName: 'Nguyễn Thị Hoa',
        parentPhone: '0901234567',
        content: 'Chương trình dã ngoại Chiến Binh Rừng Xanh rất tuyệt vời! Bé nhà tôi về nhà tự lập hẳn, biết dọn dẹp lều trại và tự rửa bát đĩa sạch sẽ. Rất cảm ơn đội ngũ huấn luyện viên KynangCK.',
        rating: 5,
        createdAt: '2026-07-15T08:00:00.000Z'
      },
      {
        id: 'fb-2',
        parentName: 'Trần Văn Tú',
        parentPhone: '0987654321',
        content: 'Bé Quỳnh Chi học Đầu Bếp Nhí về nhà thích vào bếp nấu ăn giúp mẹ lắm. Khóa học bổ ích, các thầy cô giáo dã ngoại nhiệt tình, chu đáo và cập nhật học bạ CRM rất đúng hạn.',
        rating: 5,
        createdAt: '2026-07-18T14:30:00.000Z'
      }
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  // Ensure rich sample projects exist for all 4 main CPT tabs (Khóa Học, Trải Nghiệm, Sân Chơi, Cộng Đồng)
  if (db.projects) {
    const existingIds = new Set(db.projects.map((p: any) => p.id));
    const sampleProjectsToAdd: Project[] = [
      {
        id: 'du-an-lap-trinh-robot-nhi',
        title: 'Kiến Tạo Robot Nhí & Tư Duy Thuật Toán',
        status: 'sắp diễn ra',
        category: 'Khóa Học » Tư duy sáng tạo',
        mainCategory: 'Khóa Học',
        subCategory: 'Tư duy sáng tạo',
        eventTime: '01/10/2026 - 30/11/2026',
        description: 'Chương trình rèn luyện tư duy lập trình robot ứng dụng, kết hợp lắp ráp cơ khí và giải thuật thông minh giúp trẻ phát triển logic vượt trội.',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        ageRange: '8 - 14 tuổi',
        duration: '8 buổi',
        location: 'Học viện STEAM Connect Kids, Quận 1, TP.HCM',
        journeyDetails: 'Trẻ được tiếp cận lập trình trực quan, tự tay thiết kế và lập trình điều khiển Robot vượt chướng ngại vật dã ngoại.',
        pricingPackages: [{ id: 'p1', name: 'Gói STEM Pro', price: 2800000, description: 'Bao gồm bộ Kit Robot Lego Spike mang về', benefits: ['Bộ Kit Robot cao cấp', 'Chứng chỉ lập trình nhí'] }],
        createdAt: new Date().toISOString()
      },
      {
        id: 'du-an-chinh-phuc-vach-da',
        title: 'Chinh Phục Vách Đá & Vượt Thác Dã Ngoại',
        status: 'sắp diễn ra',
        category: 'Trải Nghiệm » Thám hiểm tự nhiên',
        mainCategory: 'Trải Nghiệm',
        subCategory: 'Thám hiểm tự nhiên',
        eventTime: '18/09/2026 - 20/09/2026',
        description: 'Hành trình đu dây vượt vách đá, leo núi dã ngoại an toàn tuyệt đối dưới sự hướng dẫn chuyên nghiệp của các kiện tướng leo núi.',
        imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',
        ageRange: '10 - 15 tuổi',
        duration: '2 ngày 1 đêm',
        location: 'Thánh địa Leo núi Núi Bà Đen, Tây Ninh',
        journeyDetails: 'Trẻ vượt qua nỗi sợ độ cao, làm chủ kỹ thuật đu dây an toàn rappel và chinh phục đỉnh núi dã ngoại.',
        pricingPackages: [{ id: 'p1', name: 'Gói Thám Hiểm Pro', price: 4200000, description: 'Bao gồm trang thiết bị bảo hộ chuẩn UIAA', benefits: ['Đầy đủ trang phục đai an toàn', 'Bảo hiểm mức cao'] }],
        createdAt: new Date().toISOString()
      },
      {
        id: 'du-an-ngay-hoi-gia-dinh-da-ngoai',
        title: 'Ngày Hội Dã Ngoại Gia Đình Connect Kids',
        status: 'sắp diễn ra',
        category: 'Sân Chơi » Sân chơi gia đình',
        mainCategory: 'Sân Chơi',
        subCategory: 'Sân chơi gia đình',
        eventTime: '25/09/2026',
        description: 'Ngày hội gắn kết cha mẹ và con cái với các trò chơi teambuilding gia đình, thi dựng lều nhanh và đêm hội hóa trang dã ngoại.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
        ageRange: '5 - 15 tuổi',
        duration: '1 ngày',
        location: 'Công viên Dã ngoại Bách Thảo, TP.HCM',
        journeyDetails: 'Cha mẹ đồng hành cùng con vượt qua 5 trạm thử thách kỹ năng sống, thắt chặt tình cảm gia đình.',
        pricingPackages: [{ id: 'p1', name: 'Vé Gia Đình (2 người lớn + 2 trẻ)', price: 1500000, description: 'Trọn gói tiệc nướng BBQ & quà tặng', benefits: ['Set nướng BBQ gia đình', 'Kỷ niệm chương'] }],
        createdAt: new Date().toISOString()
      },
      {
        id: 'du-an-thu-gom-rac-thai-bien',
        title: 'Chiến Dịch Biển Xanh Hy Vọng - Tình Nguyện Nhí',
        status: 'đang thực hiện',
        category: 'Cộng Đồng » Tình nguyện nhí',
        mainCategory: 'Cộng Đồng',
        subCategory: 'Tình nguyện nhí',
        eventTime: '05/10/2026',
        description: 'Trẻ em cùng tham gia dọn dẹp rác thải nhựa bãi biển, học cách phân loại rác và làm sản phẩm tái chế bảo vệ hệ sinh thái đại dương.',
        imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
        ageRange: '6 - 15 tuổi',
        duration: '1 ngày',
        location: 'Bãi biển Cần Giờ - Vũng Tàu',
        journeyDetails: 'Nhận thức sâu sắc về tác hại rác thải nhựa, rèn luyện tinh thần sống xanh và trách nhiệm với xã hội.',
        pricingPackages: [{ id: 'p1', name: 'Gói Tình Nguyện Xanh', price: 450000, description: 'Tài trợ dụng cụ nhặt rác & Áo phông', benefits: ['Áo phông tình nguyện nhí', 'Bao tay & kẹp rác chuyên dụng'] }],
        createdAt: new Date().toISOString()
      },
      {
        id: 'du-an-hoc-vien-phong-pccc',
        title: 'Học Viện PCCC Nhí - Kỹ Năng Thoát Hiểm Cháy Nổ',
        status: 'sắp diễn ra',
        category: 'Khóa Học » Phản ứng khẩn cấp',
        mainCategory: 'Khóa Học',
        subCategory: 'Phản ứng khẩn cấp',
        eventTime: '12/09/2026',
        description: 'Giả lập tình huống khói độc và cháy nhà tầng cao. Trẻ học cách bò khom người, dùng khăn ướt che mũi và dùng bình chữa cháy mini.',
        imageUrl: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=800&q=80',
        ageRange: '7 - 14 tuổi',
        duration: '1 ngày',
        location: 'Trung tâm Thực hành PCCC P. An Phú, TP. Thủ Đức',
        journeyDetails: 'Hình thành phản xạ nhanh nhạy, không hoảng loạn khi xảy ra sự cố cháy nổ chung cư hoặc trường học.',
        pricingPackages: [{ id: 'p1', name: 'Gói An Toàn PCCC', price: 950000, description: 'Bao gồm mặt nạ phòng độc mini tặng kèm', benefits: ['Mặt nạ lọc độc bỏ túi', 'Thực hành vòi xịt chữa cháy thật'] }],
        createdAt: new Date().toISOString()
      },
      {
        id: 'du-an-hoi-trai-sinh-ton-dem',
        title: 'Đêm Ngắm Sao & Đốt Lửa Trại Dã Ngoại',
        status: 'đang thực hiện',
        category: 'Sân Chơi » Hội trại dã ngoại',
        mainCategory: 'Sân Chơi',
        subCategory: 'Hội trại dã ngoại',
        eventTime: '15/10/2026 - 16/10/2026',
        description: 'Hội trại dã ngoại ban đêm kết hợp kính thiên văn quan sát chòm sao, học cách định vị phương hướng đêm và hát quanh lửa trại.',
        imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
        ageRange: '7 - 15 tuổi',
        duration: '2 ngày 1 đêm',
        location: 'Khu trại Sinh thái Mã Đà, Đồng Nai',
        journeyDetails: 'Quan sát dải ngân hà bằng kính thiên văn chuyên nghiệp, hòa mình vào không khí đêm trại ấm áp.',
        pricingPackages: [{ id: 'p1', name: 'Gói Đêm Hội Đốt Lửa', price: 2100000, description: 'Trọn gói lều cắm trại & Tiệc nướng đêm', benefits: ['Lều cắm trại cao cấp', 'Sử dụng kính thiên văn'] }],
        createdAt: new Date().toISOString()
      }
    ];

    let projAdded = false;
    sampleProjectsToAdd.forEach(p => {
      if (!existingIds.has(p.id)) {
        db.projects.push(p);
        projAdded = true;
      }
    });

    if (projAdded) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
  }

  // Ensure sample photos and videos exist in db.news for library completeness
  if (db.news) {
    const existingNewsIds = new Set(db.news.map((n: any) => n.id));
    const sampleMediaToAdd: NewsArticle[] = [
      {
        id: 'art-photo-1',
        title: 'Cắm trại đêm đầy sao',
        excerpt: 'Khoảnh khắc lung linh tuyệt đẹp của trại cắm trại Nam Cát Tiên dưới bầu trời đêm.',
        content: 'Bức ảnh ghi lại khoảnh khắc các bé cùng dựng lều và tham gia đêm lửa trại đáng nhớ.',
        category: 'Khu cắm trại',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-20',
        author: 'Nhiếp ảnh gia Dã ngoại'
      },
      {
        id: 'art-photo-2',
        title: 'Hành trình leo núi dã ngoại',
        excerpt: 'Chuyến trekking chinh phục vách đá dã ngoại của các đội sinh tồn nhí.',
        content: 'Tự tin bước qua những thử thách vách đá với sự đồng hành 24/7 của đội ngũ huấn luyện viên.',
        category: 'Thánh địa sinh tồn',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-19',
        author: 'Nhiếp ảnh gia Dã ngoại'
      },
      {
        id: 'art-photo-3',
        title: 'Thực hành tự dựng lều dã ngoại',
        excerpt: 'Học viên tự tay kéo cọc, thắt nút dây dệt để cố định lều bạt chống mưa dông.',
        content: 'Kỹ năng dựng lều chuẩn chỉnh giúp học viên sẵn sàng thích ứng với mọi thời tiết dã ngoại.',
        category: 'Hoạt động dã ngoại',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-18',
        author: 'Nhiếp ảnh gia Dã ngoại'
      },
      {
        id: 'art-photo-4',
        title: 'Nấu ăn tự lập ngoài trời dã ngoại',
        excerpt: 'Trẻ tự chuẩn bị bữa trưa dã ngoại dinh dưỡng cho bản thân và đồng đội.',
        content: 'Thực hành kỹ năng làm bếp dã ngoại an toàn, cân đong thực phẩm tự lập.',
        category: 'Rèn luyện tự lập',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-17',
        author: 'Nhiếp ảnh gia Dã ngoại'
      },
      {
        id: 'art-photo-5',
        title: 'Sơ cứu khẩn cấp sinh tồn dã ngoại',
        excerpt: 'Lớp học kỹ năng thực hành băng bó vết thương và sơ cứu dã ngoại.',
        content: 'Trẻ được hướng dẫn quy trình sơ cứu nhanh và bình tĩnh xử lý sự cố ngoài tự nhiên.',
        category: 'Khoảnh khắc học viên',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-16',
        author: 'Nhiếp ảnh gia Dã ngoại'
      },
      {
        id: 'art-photo-6',
        title: 'Định vị tìm đường la bàn dã ngoại',
        excerpt: 'Thử thách xác định phương hướng la bàn và bản đồ địa hình rừng.',
        content: 'Rèn luyện tư duy quan sát, nhận biết hướng đông tây nam bắc và mặt trời.',
        category: 'Thánh địa sinh tồn',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-15',
        author: 'Nhiếp ảnh gia Dã ngoại'
      },
      {
        id: 'art-photo-7',
        title: 'Trekking khám phá thám hiểm rừng',
        excerpt: 'Băng qua lối nhỏ trong rừng nguyên sinh rèn luyện sức bền và bản lĩnh.',
        content: 'Rèn luyện đôi chân dẻo dốc và khả năng làm việc nhóm trên hành trình băng rừng.',
        category: 'Hoạt động dã ngoại',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-14',
        author: 'Nhiếp ảnh gia Dã ngoại'
      },
      {
        id: 'art-photo-8',
        title: 'Tìm kiếm nguồn nước sạch sinh tồn',
        excerpt: 'Thực hành lọc nước dã chiến bằng sỏi, cát và than hoạt tính.',
        content: 'Hiểu nguyên lý lọc nước tự nhiên để bảo vệ sức khỏe khi cắm trại sinh tồn.',
        category: 'Thánh địa sinh tồn',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-13',
        author: 'Nhiếp ảnh gia Dã ngoại'
      },
      {
        id: 'art-video-2',
        title: 'Video thực hành kỹ thuật thắt nút dây thuyền chài dã ngoại',
        excerpt: 'Video hướng dẫn quay chậm từng bước thắt nút dây cố định lều bạt dã ngoại dành cho học sinh.',
        content: 'Nút thuyền chài là một trong những kỹ thuật nút dây cơ bản nhưng quan trọng bậc nhất trong cắm trại.',
        category: 'Video thực hành',
        type: 'video',
        mediaUrl: 'https://www.youtube.com/embed/gD6vWeD9X4E',
        date: '2026-07-16',
        author: 'Chuyên gia Dã Ngoại'
      },
      {
        id: 'art-video-3',
        title: 'Trải nghiệm vượt chướng ngại vật & giải mật mã sinh tồn',
        excerpt: 'Thước phim sống động về ngày hội thử thách sinh tồn của các đội nhí Connect Kids.',
        content: 'Các bé cùng hợp sức vượt vách dây cáp, giải mật mã la bàn để tìm hòm cứu thương dã ngoại.',
        category: 'Kỷ niệm dã ngoại',
        type: 'video',
        mediaUrl: 'https://www.youtube.com/embed/gD6vWeD9X4E',
        date: '2026-07-14',
        author: 'Chuyên gia Dã Ngoại'
      }
    ];

    let newsAdded = false;
    sampleMediaToAdd.forEach(m => {
      if (!existingNewsIds.has(m.id)) {
        db.news.push(m);
        newsAdded = true;
      }
    });

    if (newsAdded) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
  }

  if (!db.guessingGameScreens || db.guessingGameScreens.length === 0) {
    const listAnswers = [
      "DUNG LEU", "NHOM LUA", "SO CUU", "LA BAN", "BOI LOI", "CAM TRAI", "TU LAP", "AN TOAN", "TRONG CAY", "LAM VUON",
      "RE LIEN", "DOI NHOM", "KIEN TRI", "TU TIN", "RUA CHEN", "QUET NHA", "XEP MEN", "SAP GIAN", "LANH DAO", "QUY TAC",
      "CUU HO", "THOAT HIEM", "DAY CUU SINH", "HUAN LUYEN", "CAP CUU", "TRU AN", "TIN HIEU", "HO TRO", "BAO VE", "DOAN KET",
      "XEP BALO", "DI LO", "CUI KHO", "BONG MAT", "CHAM SOC", "GIU AM", "DANH LUA", "KEO THAC", "TU VE", "DAN THOAT",
      "CAP CUU", "PHONG CHONG DICH", "DE KHANG", "QUET DO", "SAP BALO", "TRUONG LOP", "CONG DONG", "GOP Y", "TUYET VOI", "HOAN THANH",
      "CHINH XAC", "PHU HUYNH", "HOP TAC", "THU VIEN", "KY NANG", "DOI NHOM", "BAN LINH", "PHAT TRIEN", "KIDSKILL", "DA NGOAI",
      "GIA DINH", "XEP QUAN AO", "DANG KY", "HOC BAN", "KIEN TRI", "LANH DAO", "QUY TAC", "NHOM TRUONG", "TRAI HE", "TU LAP",
      "THONG THAI", "TRA CUU", "TU VE", "DAN THOAT", "DO LOC", "CUI KHO", "BONG MAT", "CHAM SOC", "GIU AM", "DANH LUA",
      "KEO THAC", "CAN THIEP", "AN TOAN DIEN", "THOAT HIEM", "DAY CUU SINH", "HUAN LUYEN", "CHUYEN GIA", "KHAO SAT", "DI LO", "XEP BALO"
    ];

    const keywords = [
      "tent", "campfire", "first-aid", "compass", "swimming", "camping", "child-cooking", "helmet-safety", "planting-tree", "gardening",
      "exercise", "teamwork", "hiking", "confident-child", "wash-dishes", "cleaning-floor", "fold-blanket", "bookshelf", "leadership", "rules",
      "rescue", "escape", "rope", "training", "first-aid-kit", "shelter", "signal-flag", "support", "security", "unity",
      "backpack", "forest-trail", "dry-wood", "shadow-tree", "caring", "warm-jacket", "fire-starter", "waterfall", "self-defense", "map-reading",
      "ambulance", "washing-hands", "vitamins", "clean-desk", "pack-backpack", "school-yard", "community", "feedback", "celebration", "finish-line",
      "correct", "parents", "handshake", "library", "skills", "team", "brave", "growing", "children-play", "picnic",
      "family", "clothe-folding", "register", "study", "perseverance", "leadership", "guidelines", "group-leader", "summer-camp", "independent",
      "wisdom", "search", "self-defense", "escape-hatch", "water-filter", "firewood", "sun-shade", "pediatrician", "campfire-warmth", "ignite",
      "climbing", "conflict-resolution", "electrical-plug", "fire-exit", "safety-rope", "coaching", "expert", "survey", "hiking", "packing"
    ];

    const hints = [
      "Dựng nơi trú ẩn khi dã ngoại hoang dã", "Nhóm bếp sưởi ấm và nấu nướng", "Sơ cứu vết thương cơ bản", "Định vị phương hướng địa lý", "Rèn luyện thể chất dưới nước", "Hoạt động ngoài trời qua đêm", "Khả năng tự lo cho bản thân", "Đội mũ bảo hiểm bảo vệ đầu", "Trồng cây xanh bảo vệ môi trường", "Chăm sóc vườn hoa cây cảnh",
      "Tập thể dục nâng cao sức khỏe", "Phối hợp cùng bạn bè vượt thử thách", "Kiên trì leo núi vượt dốc", "Tự tin phát biểu trước đám đông", "Rửa chén bát sạch sẽ sau ăn", "Quét dọn giữ nhà cửa gọn gàng", "Xếp chăn màn ngăn nắp khi ngủ dậy", "Sắp xếp kệ sách gọn gàng", "Vai trò dẫn dắt đội nhóm", "Tuân thủ nội quy trại dã ngoại",
      "Giải cứu người gặp nạn khẩn cấp", "Tìm đường thoát hiểm khi cháy nổ", "Kỹ thuật thắt dây cứu nạn", "Đội ngũ huấn luyện viên dã ngoại", "Gọi cứu hộ khẩn cấp 115", "Tìm nơi trú ẩn giông bão", "Gửi tín hiệu SOS khẩn cấp", "Hỗ trợ đồng đội khi gặp khó khăn", "Bảo vệ an toàn cho bản thân", "Tinh thần đoàn kết gắn bó",
      "Sắp xếp balo dã ngoại gọn gàng", "Khám phá cung đường rừng dã ngoại", "Thu lượm củi khô nhóm lửa", "Nghỉ ngơi dưới tán bóng mát", "Chăm sóc sức khỏe y tế", "Mặc áo ấm giữ nhiệt cơ thể", "Kỹ thuật đánh đá tạo lửa dã chiến", "Vượt thác dã ngoại thử thách", "Tự vệ trước nguy hiểm", "Dẫn đầu đoàn dã ngoại thoát nạn",
      "Kêu cứu y tế khẩn cấp", "Rửa tay phòng chống virus dịch bệnh", "Tăng sức đề kháng cơ thể", "Quét dọn rác thải dã ngoại", "Bố trí đồ dùng trong balo", "Hoạt động kỹ năng trường học", "Kết nối cộng đồng chia sẻ", "Góp ý cải tiến học tập", "Cảm giác tuyệt vời khi chiến thắng", "Hoàn thành xuất sắc nhiệm vụ",
      "Đưa ra quyết định chính xác", "Phụ huynh đồng hành rèn luyện", "Hợp tác hữu nghị đôi bên", "Thư viện tri thức kỹ năng sống", "Rèn luyện kỹ năng cốt lõi", "Sức mạnh tập thể đội nhóm", "Bản lĩnh vượt qua khó khăn", "Phát triển tư duy toàn diện", "Sân chơi trẻ em lành mạnh", "Chuyến đi dã ngoại lý thú",
      "Mái ấm gia đình hạnh phúc", "Xếp quần áo ngăn nắp vào tủ", "Đăng ký khóa học dã ngoại mới", "Bàn học tập rèn luyện ngăn nắp", "Kiên trì hoàn thành mục tiêu", "Kỹ năng lãnh đạo đội nhóm", "Quy tắc an toàn sinh tồn", "Vai trò nhóm trưởng gánh vác", "Ngày hội trại hè bổ ích", "Sống tự lập tự giác cao",
      "Trí tuệ thông thái vượt thử thách", "Tra cứu thông tin học bạ CRM", "Tự vệ khi gặp kẻ xấu", "Dẫn thoát hiểm lối thoát hiểm", "Bộ lọc nước dã ngoại sạch", "Thu gom củi khô dã chiến", "Bóng mát bóng râm che nắng", "Chăm sóc trẻ em chu đáo", "Ủ ấm giữ ấm cơ thể ban đêm", "Kỹ thuật mồi lửa dã ngoại",
      "Leo vách đá thử thách bản lĩnh", "Thảo luận giải quyết xung đột", "Sử dụng thiết bị điện an toàn", "Lối thoát hiểm khẩn cấp", "Dây thừng cứu sinh chắc chắn", "Chuyên gia huấn luyện kỹ năng", "Huấn luyện viên dã ngoại đầu ngành", "Khảo sát ý kiến đóng góp", "Khám phá rừng xanh dã ngoại", "Sắp xếp hành lý gọn gàng"
    ];

    const screens: any[] = [];
    for (let i = 0; i < 100; i++) {
      const level = Math.floor(i / 10) + 1;
      const screenIndex = (i % 10) + 1;
      const answer = listAnswers[i] || "KY NANG";
      const keyword = keywords[i] || "camping";
      const hint = hints[i] || "Kiến thức đời sống và kỹ năng quanh trẻ";
      
      screens.push({
        id: `guess-${level}-${screenIndex}`,
        level,
        screenIndex,
        image: `https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80&sig=${i}&q=${keyword}`,
        answer,
        hint
      });
    }

    db.guessingGameScreens = screens;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  if (db.cms && !db.cms.corporate) {
    db.cms.corporate = {
      heroTitle: 'Kiến Tạo Trải Nghiệm Tập Thể Đột Phá',
      heroSub: 'KynangCK mang đến giáo án huấn luyện sinh tồn dã ngoại thực tế chuyên nghiệp cho trường học, doanh nghiệp và tổ chức đoàn thể. Chúng tôi cam kết an toàn tuyệt đối và quy trình quản trị dự án hiện đại.',
      organization: {
        title: 'Dành Cho Tổ Chức & Hội Đoàn',
        description: 'Thiết kế các chương trình dã ngoại chuyên sâu, xây dựng tinh thần đồng đội cho các hội nhóm thanh thiếu niên, câu lạc bộ sở thích, các tổ chức thiện nguyện xã hội.',
        focusTitle: 'HẠNG MỤC TRỌNG TÂM',
        focusItems: [
          'Kỹ năng lãnh đạo dã ngoại: Tổ chức hoạt động sơ cứu, dựng trại tập thể khẩn cấp và bảo vệ an toàn cho thành viên.',
          'Hành trình giải mật thư: Thử thách trí tuệ đồng đội vượt địa hình phức tạp, định vị vệ tinh và la bàn thủ công.'
        ],
        highlightText: 'Dịch vụ trọn gói bảo hiểm dã ngoại chuẩn quốc tế cho toàn bộ thành viên đoàn thể tham gia.'
      },
      business: {
        title: 'Dành Cho Doanh Nghiệp (Team building)',
        description: 'Xóa nhòa khoảng cách cấp bậc trong doanh nghiệp, tạo cầu nối thấu hiểu bền chặt giữa các phòng ban thông qua kịch bản dã ngoại khắc nghiệt thử thách khả năng sinh tồn.',
        focusTitle: 'CHƯƠNG TRÌNH ĐỘT PHÁ',
        focusItems: [
          'Trại sinh tồn lãnh đạo CEO: Vượt chướng ngại vật thiên nhiên, rèn luyện kỹ năng quản trị khủng hoảng và teamwork thực chiến.',
          'Thử thách Robinson: Tự lập lều bạt dã chiến, lọc nước ngọt tự nhiên từ bùn đất, dập lửa khói báo tín hiệu định vị cứu hộ.'
        ],
        highlightText: 'Cung cấp báo giá, hợp đồng & hóa đơn VAT chuẩn chỉnh lưu vào CRM tiện dụng cho kế toán doanh nghiệp.'
      },
      school: {
        title: 'Dành Cho Trường Học & Học Xá',
        description: 'Hợp tác thiết kế học vụ dã ngoại ngoại khóa tích hợp, chuẩn hóa giáo dục trực quan, giúp học sinh trải nghiệm thực tế sinh động thay vì lý thuyết sách vở.',
        focusTitle: 'DỊCH VỤ CHUYÊN BIỆT',
        focusItems: [
          'Học kỳ quân đội dã ngoại: Kỹ năng tự lập sinh hoạt, gấp chăn màn quân đội, sơ cứu thương tích cơ bản và định hướng rừng rậm.',
          'Trại kỹ năng tự bảo vệ vệ sĩ nhí: Nhận diện nguy hiểm tiềm ẩn, phòng tránh lạc đường, xử lý tình huống hỏa hoạn và đuối nước dã ngoại.'
        ],
        highlightText: 'Huấn luyện viên dã ngoại đạt chứng chỉ sơ cứu quốc tế trực tiếp giám sát dã ngoại tỉ lệ 1 HLV kèm 5 bé học sinh.'
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  const cmsWasModified = ensureCmsIntegrity(db);
  if (cmsWasModified) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  inMemoryDbCache = db;
  return db;
}

export function writeDb(data: DBData) {
  ensureDb();
  ensureCmsIntegrity(data);
  inMemoryDbCache = data;
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');

  // Push updates to Supabase asynchronously in background
  if (isSupabaseEnabled && supabaseClient) {
    const keys: (keyof DBData)[] = [
      'projects', 'parents', 'corporates', 'transactions',
      'news', 'notifications', 'cms', 'feedbacks', 'guessingGameScreens'
    ];

    Promise.all(
      keys.map(async (key) => {
        try {
          const val = data[key] !== undefined ? data[key] : (key === 'cms' ? {} : []);
          const { error } = await (supabaseClient!
            .from('app_state') as any)
            .upsert({ key, data: val }, { onConflict: 'key' });
          if (error) console.error(`Supabase upsert failed for ${key}:`, error.message);
        } catch (err) {
          console.error(`Background Supabase update failed for ${key}:`, err);
        }
      })
    );
  }
}

export async function syncDbWithSupabase(): Promise<void> {
  if (!supabaseClient) {
    console.log('⚠ Supabase not configured, skipping sync');
    return;
  }

  try {
    console.log('🔄 Syncing database with Supabase...');
    const keysToSync = ['projects', 'news', 'cms', 'parents', 'corporates', 'transactions', 'notifications'];

    const { data, error } = await (supabaseClient.from('app_state') as any)
      .select('key, data')
      .in('key', keysToSync);

    if (error) {
      console.error('❌ Supabase sync error:', error);
      return;
    }

    let localDb = getDb();

    data?.forEach((row: any) => {
      if (row.key && row.data) {
        localDb[row.key as keyof DBData] = row.data;
        console.log(`✓ Synced ${row.key} from Supabase`);
      }
    });

    inMemoryDbCache = localDb;
    console.log('✅ Database synced successfully');
  } catch (err) {
    console.error('❌ Sync failed:', err);
  }
}

