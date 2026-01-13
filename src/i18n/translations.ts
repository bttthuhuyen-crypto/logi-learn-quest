// Translation type structure

interface NavTranslations {
  community: string;
  classroom: string;
  calendar: string;
  members: string;
  leaderboard: string;
  admin: string;
  about: string;
  search: string;
  login: string;
  logout: string;
  profile: string;
  affiliate: string;
}

interface AuthTranslations {
  login: string;
  signup: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  forgotPassword: string;
  noAccount: string;
  hasAccount: string;
  orContinueWith: string;
  loginSuccess: string;
  signupSuccess: string;
  logoutSuccess: string;
  emailRequired: string;
  passwordRequired: string;
  passwordMinLength: string;
  passwordMismatch: string;
  invalidEmail: string;
  userExists: string;
  invalidCredentials: string;
}

interface CommonTranslations {
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  confirm: string;
  close: string;
  back: string;
  next: string;
  submit: string;
  level: string;
  points: string;
  search: string;
  filter: string;
  sort: string;
  export: string;
  all: string;
  none: string;
  yes: string;
  no: string;
  enable: string;
  disable: string;
  enabled: string;
  disabled: string;
  settings: string;
  actions: string;
  details: string;
  preview: string;
  days: string;
  hours: string;
  minutes: string;
  characters: string;
}

interface WelcomeTranslations {
  title: string;
  subtitle: string;
  getStarted: string;
}

interface ClassroomTranslations {
  title: string;
  createCourse: string;
  editCourse: string;
  deleteCourse: string;
  courseName: string;
  courseDescription: string;
  courseType: string;
  freeType: string;
  paidType: string;
  coverImage: string;
  recommendedRatio: string;
  addSection: string;
  editSection: string;
  deleteSection: string;
  sectionName: string;
  addLesson: string;
  editLesson: string;
  deleteLesson: string;
  lessonName: string;
  accessPublic: string;
  accessPublicDesc: string;
  accessMember: string;
  accessMemberDesc: string;
  accessLevel: string;
  accessLevelDesc: string;
  introduction: string;
  introductionPlaceholder: string;
  ctaConfig: string;
  buttonName: string;
  desktop: string;
  mobile: string;
  lessonCount: string;
  duration: string;
  published: string;
  draft: string;
  publish: string;
  unpublish: string;
  reorder: string;
  move: string;
  uploadCover: string;
  deleteIntroduction: string;
  deleteIntroductionConfirm: string;
  editContent: string;
  clearContent: string;
  price: string;
}

interface MembershipTranslations {
  joinTitle: string;
  joinSubtitle: string;
  questionOf: string;
  textAnswer: string;
  multipleChoice: string;
  emailType: string;
  submitRequest: string;
  agreeTerms: string;
  pendingApproval: string;
  pendingMessage: string;
  membershipRequests: string;
  questionSettings: string;
  enableQuestions: string;
  autoApprove: string;
  autoApproveDesc: string;
  addQuestion: string;
  editQuestion: string;
  deleteQuestion: string;
  questionText: string;
  questionTextEn: string;
  questionType: string;
  questionOptions: string;
  isRequired: string;
  approve: string;
  decline: string;
  viewAnswers: string;
  hoursAgo: string;
  daysAgo: string;
}

interface AffiliateTranslations {
  dashboardTitle: string;
  totalEarnings: string;
  pendingAmount: string;
  availableAmount: string;
  totalWithdrawn: string;
  clicks: string;
  signups: string;
  purchases: string;
  conversionRate: string;
  yourLink: string;
  copyLink: string;
  linkCopied: string;
  shareToFacebook: string;
  shareToZalo: string;
  withdrawTitle: string;
  withdrawAll: string;
  minimumAmount: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchName: string;
  confirmWithdraw: string;
  settingsTitle: string;
  enableAffiliate: string;
  defaultCommission: string;
  cookieDuration: string;
  pendingPeriod: string;
  pendingPeriodDesc: string;
  minPayoutAmount: string;
  transactionHistory: string;
  courseSettings: string;
  commissionRate: string;
  payoutRequests: string;
  topAffiliates: string;
  totalRevenue: string;
  totalCommission: string;
  referrals: string;
  payoutNote: string;
  earnCommission: string;
  shareAndEarn: string;
}

interface AdminTranslations {
  title: string;
  membershipSettings: string;
  affiliateSettings: string;
  memberManagement: string;
  contentModeration: string;
  communitySettings: string;
  analytics: string;
  inviteMember: string;
  removeMember: string;
  banMember: string;
  promoteToModerator: string;
  demoteToMember: string;
  questionsList: string;
  noQuestions: string;
  maxQuestionsReached: string;
  saveSettings: string;
  settingsSaved: string;
}

interface CommunityTranslations {
  title: string;
  subtitle: string;
  comingSoon: string;
  createPost: string;
  writePost: string;
  postPlaceholder: string;
  like: string;
  comment: string;
  reply: string;
  share: string;
  pin: string;
  unpin: string;
  deletePost: string;
  editPost: string;
  channels: string;
  announcements: string;
  qna: string;
  shareExperience: string;
  introductions: string;
  sortNewest: string;
  sortBestWeek: string;
  sortBestMonth: string;
  sortBestAll: string;
}

interface CalendarTranslations {
  title: string;
  subtitle: string;
  createEvent: string;
  editEvent: string;
  deleteEvent: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
  eventTime: string;
  eventLink: string;
  rsvp: string;
  attending: string;
  notAttending: string;
  maybe: string;
  upcomingEvents: string;
  noEvents: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
}

interface MembersTranslations {
  title: string;
  memberCount: string;
  searchPlaceholder: string;
  filterOnline: string;
  filterLevel: string;
  filterJoinDate: string;
  viewProfile: string;
  follow: string;
  unfollow: string;
  message: string;
  followers: string;
  following: string;
  recentPosts: string;
  activityChart: string;
  joinedOn: string;
  online: string;
  offline: string;
}

interface LeaderboardTranslations {
  title: string;
  subtitle: string;
  last7Days: string;
  last30Days: string;
  allTime: string;
  rank: string;
  member: string;
  data7Days: string;
  data30Days: string;
  dataAllTime: string;
}

interface AboutTranslations {
  title: string;
  subtitle: string;
  community: string;
  communityDesc: string;
  learning: string;
  learningDesc: string;
  growth: string;
  growthDesc: string;
  guidelines: string;
  guidelineRespect: string;
  guidelineShare: string;
  guidelineNoSpam: string;
  guidelineProfessional: string;
  guidelineSupport: string;
  contact: string;
}

interface NotificationTranslations {
  newSignup: string;
  newPurchase: string;
  commissionConfirmed: string;
  commissionReversed: string;
  payoutRequested: string;
  payoutCompleted: string;
  payoutRejected: string;
  membershipApproved: string;
  membershipDeclined: string;
  newMemberRequest: string;
  welcomeMessage: string;
}

interface NotificationSettingsTranslations {
  title: string;
  emailSection: string;
  emailDigest: string;
  emailNotifications: string;
  adminAnnouncements: string;
  eventReminders: string;
  inAppSection: string;
  likes: string;
  comments: string;
  mentions: string;
  followers: string;
  followingPosts: string;
  pushSection: string;
  pushEnabled: string;
  off: string;
  instant: string;
  daily: string;
  weekly: string;
  settingsSaved: string;
}

interface MessengerTranslations {
  title: string;
  searchPlaceholder: string;
  newMessage: string;
  typeMessage: string;
  send: string;
  noConversations: string;
  selectConversation: string;
  messageDeleted: string;
  you: string;
  online: string;
  offline: string;
  sending: string;
  sent: string;
  delivered: string;
  read: string;
  attachFile: string;
  attachImage: string;
  yesterday: string;
  today: string;
  newConversation: string;
  selectUser: string;
}

interface StatusTranslations {
  pending: string;
  approved: string;
  declined: string;
  processing: string;
  completed: string;
  rejected: string;
  confirmed: string;
  paid: string;
  reversed: string;
  published: string;
  draft: string;
  active: string;
  inactive: string;
  online: string;
  offline: string;
}

interface ErrorTranslations {
  required: string;
  invalidFormat: string;
  minLength: string;
  maxLength: string;
  networkError: string;
  serverError: string;
  unauthorized: string;
  forbidden: string;
  notFound: string;
  somethingWentWrong: string;
  tryAgain: string;
  sessionExpired: string;
}

export interface TranslationKeys {
  nav: NavTranslations;
  auth: AuthTranslations;
  common: CommonTranslations;
  welcome: WelcomeTranslations;
  classroom: ClassroomTranslations;
  membership: MembershipTranslations;
  affiliate: AffiliateTranslations;
  admin: AdminTranslations;
  community: CommunityTranslations;
  calendar: CalendarTranslations;
  members: MembersTranslations;
  leaderboard: LeaderboardTranslations;
  about: AboutTranslations;
  notifications: NotificationTranslations;
  notificationSettings: NotificationSettingsTranslations;
  messenger: MessengerTranslations;
  status: StatusTranslations;
  errors: ErrorTranslations;
}

export const translations: Record<'vi' | 'en', TranslationKeys> = {
  vi: {
    nav: {
      community: 'Thảo luận',
      classroom: 'Học tập',
      calendar: 'Lịch',
      members: 'Thành viên',
      leaderboard: 'Bảng xếp hạng',
      admin: 'Quản trị cộng đồng',
      about: 'Giới thiệu',
      search: 'Tìm kiếm...',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      profile: 'Hồ sơ',
      affiliate: 'Affiliate',
    },
    auth: {
      login: 'Đăng nhập',
      signup: 'Đăng ký',
      email: 'Email',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu',
      fullName: 'Họ và tên',
      forgotPassword: 'Quên mật khẩu?',
      noAccount: 'Chưa có tài khoản?',
      hasAccount: 'Đã có tài khoản?',
      orContinueWith: 'Hoặc tiếp tục với',
      loginSuccess: 'Đăng nhập thành công!',
      signupSuccess: 'Đăng ký thành công!',
      logoutSuccess: 'Đăng xuất thành công!',
      emailRequired: 'Email là bắt buộc',
      passwordRequired: 'Mật khẩu là bắt buộc',
      passwordMinLength: 'Mật khẩu phải có ít nhất 6 ký tự',
      passwordMismatch: 'Mật khẩu không khớp',
      invalidEmail: 'Email không hợp lệ',
      userExists: 'Tài khoản đã tồn tại',
      invalidCredentials: 'Email hoặc mật khẩu không đúng',
    },
    common: {
      loading: 'Đang tải...',
      save: 'Lưu',
      cancel: 'Hủy',
      delete: 'Xóa',
      edit: 'Chỉnh sửa',
      create: 'Tạo mới',
      confirm: 'Xác nhận',
      close: 'Đóng',
      back: 'Quay lại',
      next: 'Tiếp theo',
      submit: 'Gửi',
      level: 'Cấp',
      points: 'Điểm',
      search: 'Tìm kiếm',
      filter: 'Lọc',
      sort: 'Sắp xếp',
      export: 'Xuất',
      all: 'Tất cả',
      none: 'Không có',
      yes: 'Có',
      no: 'Không',
      enable: 'Bật',
      disable: 'Tắt',
      enabled: 'Đã bật',
      disabled: 'Đã tắt',
      settings: 'Cài đặt',
      actions: 'Hành động',
      details: 'Chi tiết',
      preview: 'Xem trước',
      days: 'ngày',
      hours: 'giờ',
      minutes: 'phút',
      characters: 'ký tự',
    },
    welcome: {
      title: 'Chào mừng đến với 10X Logistics',
      subtitle: 'Nền tảng học tập và cộng đồng cho ngành Logistics',
      getStarted: 'Bắt đầu ngay',
    },
    classroom: {
      title: 'Học tập',
      createCourse: 'Tạo khóa học',
      editCourse: 'Chỉnh sửa khóa học',
      deleteCourse: 'Xóa khóa học',
      courseName: 'Tên khóa học',
      courseDescription: 'Mô tả khóa học',
      courseType: 'Loại khóa học',
      freeType: 'Miễn phí',
      paidType: 'Trả phí',
      coverImage: 'Ảnh bìa',
      recommendedRatio: 'Khuyến nghị tỉ lệ: 16:9',
      addSection: 'Thêm danh mục',
      editSection: 'Chỉnh sửa danh mục',
      deleteSection: 'Xóa danh mục',
      sectionName: 'Tên danh mục',
      addLesson: 'Thêm bài học',
      editLesson: 'Chỉnh sửa bài học',
      deleteLesson: 'Xóa bài học',
      lessonName: 'Tên bài học',
      accessPublic: 'Công khai',
      accessPublicDesc: 'Mọi người đều có thể truy cập nội dung này.',
      accessMember: 'Thành viên',
      accessMemberDesc: 'Người dùng cần tham gia cộng đồng để truy cập nội dung này.',
      accessLevel: 'Cấp bậc',
      accessLevelDesc: 'Người dùng cần đạt đến cấp bậc tối thiểu để truy cập.',
      introduction: 'Giới thiệu',
      introductionPlaceholder: 'Hãy mô tả, giới thiệu về khóa học',
      ctaConfig: 'Cấu hình nút CTA',
      buttonName: 'Tên nút',
      desktop: 'Máy tính',
      mobile: 'Điện thoại',
      lessonCount: 'Số lượng',
      duration: 'Thời lượng',
      published: 'Đã xuất bản',
      draft: 'Bản nháp',
      publish: 'Xuất bản',
      unpublish: 'Hủy xuất bản',
      reorder: 'Sắp xếp',
      move: 'Di chuyển',
      uploadCover: 'Upload ảnh bìa',
      deleteIntroduction: 'Xóa giới thiệu khóa học',
      deleteIntroductionConfirm: 'Bạn có chắc muốn xóa nội dung này không? Nội dung sẽ không thể khôi phục.',
      editContent: 'Sửa nội dung',
      clearContent: 'Xóa nội dung',
      price: 'Giá',
    },
    membership: {
      joinTitle: 'Tham gia 10X Logistics',
      joinSubtitle: 'Vui lòng trả lời các câu hỏi dưới đây để Admin xem xét yêu cầu tham gia của bạn.',
      questionOf: 'Câu hỏi',
      textAnswer: 'Câu trả lời văn bản',
      multipleChoice: 'Chọn nhiều',
      emailType: 'Email',
      submitRequest: 'Gửi yêu cầu',
      agreeTerms: 'Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật',
      pendingApproval: 'Đang chờ duyệt',
      pendingMessage: 'Yêu cầu tham gia của bạn đang được xem xét. Vui lòng chờ Admin duyệt.',
      membershipRequests: 'Yêu cầu tham gia',
      questionSettings: 'Cài đặt câu hỏi gia nhập',
      enableQuestions: 'Bật câu hỏi gia nhập',
      autoApprove: 'Tự động duyệt',
      autoApproveDesc: 'Khi bật, thành viên sẽ được tự động duyệt sau khi trả lời',
      addQuestion: 'Thêm câu hỏi',
      editQuestion: 'Sửa câu hỏi',
      deleteQuestion: 'Xóa câu hỏi',
      questionText: 'Nội dung câu hỏi',
      questionTextEn: 'Nội dung tiếng Anh',
      questionType: 'Loại câu hỏi',
      questionOptions: 'Các lựa chọn',
      isRequired: 'Bắt buộc',
      approve: 'Duyệt',
      decline: 'Từ chối',
      viewAnswers: 'Xem câu trả lời',
      hoursAgo: 'giờ trước',
      daysAgo: 'ngày trước',
    },
    affiliate: {
      dashboardTitle: 'Affiliate Dashboard',
      totalEarnings: 'Tổng thu nhập',
      pendingAmount: 'Đang chờ',
      availableAmount: 'Có thể rút',
      totalWithdrawn: 'Đã rút',
      clicks: 'Clicks',
      signups: 'Đăng ký',
      purchases: 'Mua hàng',
      conversionRate: 'Tỷ lệ chuyển đổi',
      yourLink: 'Link giới thiệu của bạn',
      copyLink: 'Copy Link',
      linkCopied: 'Đã copy link!',
      shareToFacebook: 'Chia sẻ lên Facebook',
      shareToZalo: 'Chia sẻ lên Zalo',
      withdrawTitle: 'Rút tiền hoa hồng',
      withdrawAll: 'Rút tất cả',
      minimumAmount: 'Số tiền tối thiểu',
      bankName: 'Ngân hàng',
      accountNumber: 'Số tài khoản',
      accountName: 'Tên chủ tài khoản',
      branchName: 'Chi nhánh',
      confirmWithdraw: 'Xác nhận rút tiền',
      settingsTitle: 'Cài đặt Affiliate',
      enableAffiliate: 'Bật hệ thống Affiliate',
      defaultCommission: 'Hoa hồng mặc định',
      cookieDuration: 'Thời gian tracking (Cookie)',
      pendingPeriod: 'Thời gian chờ thanh toán',
      pendingPeriodDesc: 'Hoa hồng sẽ được giữ lại để đề phòng hoàn tiền',
      minPayoutAmount: 'Số tiền tối thiểu để rút',
      transactionHistory: 'Lịch sử giao dịch',
      courseSettings: 'Cài đặt riêng cho từng khóa học',
      commissionRate: 'Tỷ lệ hoa hồng',
      payoutRequests: 'Yêu cầu rút tiền',
      topAffiliates: 'Top Affiliates',
      totalRevenue: 'Tổng doanh thu',
      totalCommission: 'Tổng hoa hồng',
      referrals: 'Referrals',
      payoutNote: 'Yêu cầu rút tiền sẽ được xử lý trong 3-5 ngày làm việc',
      earnCommission: 'Kiếm hoa hồng',
      shareAndEarn: 'Giới thiệu bạn bè & Kiếm hoa hồng!',
    },
    admin: {
      title: 'Quản trị cộng đồng',
      membershipSettings: 'Cài đặt thành viên',
      affiliateSettings: 'Cài đặt Affiliate',
      memberManagement: 'Quản lý thành viên',
      contentModeration: 'Kiểm duyệt nội dung',
      communitySettings: 'Cài đặt cộng đồng',
      analytics: 'Phân tích',
      inviteMember: 'Mời thành viên',
      removeMember: 'Xóa thành viên',
      banMember: 'Cấm thành viên',
      promoteToModerator: 'Nâng làm Moderator',
      demoteToMember: 'Hạ về Member',
      questionsList: 'Danh sách câu hỏi',
      noQuestions: 'Chưa có câu hỏi nào',
      maxQuestionsReached: 'Đã đạt số lượng câu hỏi tối đa',
      saveSettings: 'Lưu cài đặt',
      settingsSaved: 'Đã lưu cài đặt',
    },
    community: {
      title: 'Thảo luận',
      subtitle: 'Diễn đàn thảo luận cho cộng đồng',
      comingSoon: 'Diễn đàn thảo luận sẽ sớm ra mắt. Bạn sẽ có thể đăng bài, bình luận, và kết nối với cộng đồng.',
      createPost: 'Tạo bài viết',
      writePost: 'Viết bài',
      postPlaceholder: 'Bạn đang nghĩ gì?',
      like: 'Thích',
      comment: 'Bình luận',
      reply: 'Trả lời',
      share: 'Chia sẻ',
      pin: 'Ghim',
      unpin: 'Bỏ ghim',
      deletePost: 'Xóa bài viết',
      editPost: 'Sửa bài viết',
      channels: 'Kênh',
      announcements: 'Thông báo',
      qna: 'Hỏi đáp',
      shareExperience: 'Chia sẻ kinh nghiệm',
      introductions: 'Giới thiệu bản thân',
      sortNewest: 'Mới nhất',
      sortBestWeek: 'Tốt nhất tuần',
      sortBestMonth: 'Tốt nhất tháng',
      sortBestAll: 'Tốt nhất mọi thời',
    },
    calendar: {
      title: 'Lịch sự kiện',
      subtitle: 'Theo dõi các sự kiện và webinar sắp tới',
      createEvent: 'Tạo sự kiện',
      editEvent: 'Sửa sự kiện',
      deleteEvent: 'Xóa sự kiện',
      eventTitle: 'Tiêu đề sự kiện',
      eventDescription: 'Mô tả sự kiện',
      eventDate: 'Ngày',
      eventTime: 'Thời gian',
      eventLink: 'Link tham gia',
      rsvp: 'Xác nhận tham gia',
      attending: 'Sẽ tham gia',
      notAttending: 'Không tham gia',
      maybe: 'Có thể',
      upcomingEvents: 'Sự kiện sắp tới',
      noEvents: 'Không có sự kiện nào',
      today: 'Hôm nay',
      thisWeek: 'Tuần này',
      thisMonth: 'Tháng này',
    },
    members: {
      title: 'Thành viên',
      memberCount: 'thành viên',
      searchPlaceholder: 'Tìm kiếm thành viên...',
      filterOnline: 'Đang online',
      filterLevel: 'Cấp độ',
      filterJoinDate: 'Ngày tham gia',
      viewProfile: 'Xem hồ sơ',
      follow: 'Theo dõi',
      unfollow: 'Bỏ theo dõi',
      message: 'Nhắn tin',
      followers: 'Người theo dõi',
      following: 'Đang theo dõi',
      recentPosts: 'Bài viết gần đây',
      activityChart: 'Biểu đồ hoạt động',
      joinedOn: 'Tham gia ngày',
      online: 'Online',
      offline: 'Offline',
    },
    leaderboard: {
      title: 'Bảng xếp hạng',
      subtitle: 'Thành viên tích cực nhất',
      last7Days: '7 ngày',
      last30Days: '30 ngày',
      allTime: 'Tất cả',
      rank: 'Hạng',
      member: 'Thành viên',
      data7Days: 'Dữ liệu 7 ngày',
      data30Days: 'Dữ liệu 30 ngày',
      dataAllTime: 'Tổng điểm tất cả thời gian',
    },
    about: {
      title: '10X Logistics',
      subtitle: 'Cộng đồng học tập và kết nối cho ngành Logistics',
      community: 'Cộng đồng',
      communityDesc: 'Kết nối với hàng nghìn chuyên gia trong ngành',
      learning: 'Học tập',
      learningDesc: 'Khóa học chất lượng từ chuyên gia hàng đầu',
      growth: 'Phát triển',
      growthDesc: 'Nâng cao kỹ năng và phát triển sự nghiệp',
      guidelines: 'Quy tắc cộng đồng',
      guidelineRespect: 'Tôn trọng tất cả thành viên',
      guidelineShare: 'Chia sẻ kiến thức có giá trị',
      guidelineNoSpam: 'Không spam hoặc quảng cáo',
      guidelineProfessional: 'Giữ nội dung chuyên nghiệp',
      guidelineSupport: 'Hỗ trợ và giúp đỡ lẫn nhau',
      contact: 'Liên hệ',
    },
    notifications: {
      newSignup: '{name} đã đăng ký qua link của bạn!',
      newPurchase: '{name} đã mua {course}. Bạn nhận {amount}đ hoa hồng!',
      commissionConfirmed: '{amount}đ hoa hồng đã được xác nhận!',
      commissionReversed: '{amount}đ hoa hồng bị hủy do hoàn tiền',
      payoutRequested: '{name} yêu cầu rút {amount}đ',
      payoutCompleted: '{amount}đ đã được chuyển vào tài khoản của bạn!',
      payoutRejected: 'Yêu cầu rút tiền bị từ chối: {reason}',
      membershipApproved: 'Chào mừng! Yêu cầu tham gia của bạn đã được duyệt.',
      membershipDeclined: 'Yêu cầu tham gia của bạn bị từ chối.',
      newMemberRequest: '{name} yêu cầu tham gia cộng đồng',
      welcomeMessage: 'Chào mừng bạn đến với 10X Logistics!',
    },
    notificationSettings: {
      title: 'Cài đặt thông báo',
      emailSection: 'Thông báo email',
      emailDigest: 'Tổng hợp email',
      emailNotifications: 'Thông báo email',
      adminAnnouncements: 'Thông báo từ quản trị viên',
      eventReminders: 'Nhắc nhở sự kiện',
      inAppSection: 'Thông báo trong ứng dụng',
      likes: 'Lượt thích',
      comments: 'Bình luận',
      mentions: 'Nhắc đến bạn',
      followers: 'Người theo dõi mới',
      followingPosts: 'Bài viết từ người bạn theo dõi',
      pushSection: 'Thông báo đẩy',
      pushEnabled: 'Bật thông báo đẩy',
      off: 'Tắt',
      instant: 'Ngay lập tức',
      daily: 'Hàng ngày',
      weekly: 'Hàng tuần',
      settingsSaved: 'Đã lưu cài đặt',
    },
    messenger: {
      title: 'Tin nhắn',
      searchPlaceholder: 'Tìm kiếm cuộc trò chuyện...',
      newMessage: 'Tin nhắn mới',
      typeMessage: 'Nhập tin nhắn...',
      send: 'Gửi',
      noConversations: 'Chưa có cuộc trò chuyện nào',
      selectConversation: 'Chọn một cuộc trò chuyện để bắt đầu',
      messageDeleted: 'Tin nhắn đã bị xóa',
      you: 'Bạn',
      online: 'Đang hoạt động',
      offline: 'Ngoại tuyến',
      sending: 'Đang gửi...',
      sent: 'Đã gửi',
      delivered: 'Đã nhận',
      read: 'Đã xem',
      attachFile: 'Đính kèm file',
      attachImage: 'Đính kèm ảnh',
      yesterday: 'Hôm qua',
      today: 'Hôm nay',
      newConversation: 'Tạo cuộc trò chuyện mới',
      selectUser: 'Tìm kiếm người dùng...',
    },
    status: {
      pending: 'Đang chờ',
      approved: 'Đã duyệt',
      declined: 'Từ chối',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      rejected: 'Từ chối',
      confirmed: 'Đã xác nhận',
      paid: 'Đã thanh toán',
      reversed: 'Đã hủy',
      published: 'Đã xuất bản',
      draft: 'Bản nháp',
      active: 'Đang hoạt động',
      inactive: 'Không hoạt động',
      online: 'Online',
      offline: 'Offline',
    },
    errors: {
      required: 'Trường này là bắt buộc',
      invalidFormat: 'Định dạng không hợp lệ',
      minLength: 'Tối thiểu {min} ký tự',
      maxLength: 'Tối đa {max} ký tự',
      networkError: 'Lỗi kết nối mạng',
      serverError: 'Lỗi máy chủ',
      unauthorized: 'Bạn cần đăng nhập để thực hiện hành động này',
      forbidden: 'Bạn không có quyền thực hiện hành động này',
      notFound: 'Không tìm thấy',
      somethingWentWrong: 'Đã có lỗi xảy ra',
      tryAgain: 'Vui lòng thử lại',
      sessionExpired: 'Phiên đăng nhập đã hết hạn',
    },
  },
  en: {
    nav: {
      community: 'Community',
      classroom: 'Classroom',
      calendar: 'Calendar',
      members: 'Members',
      leaderboard: 'Leaderboard',
      admin: 'Admin',
      about: 'About',
      search: 'Search...',
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile',
      affiliate: 'Affiliate',
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      orContinueWith: 'Or continue with',
      loginSuccess: 'Login successful!',
      signupSuccess: 'Sign up successful!',
      logoutSuccess: 'Logout successful!',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 6 characters',
      passwordMismatch: 'Passwords do not match',
      invalidEmail: 'Invalid email address',
      userExists: 'Account already exists',
      invalidCredentials: 'Invalid email or password',
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      confirm: 'Confirm',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      level: 'Level',
      points: 'Points',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      enable: 'Enable',
      disable: 'Disable',
      enabled: 'Enabled',
      disabled: 'Disabled',
      settings: 'Settings',
      actions: 'Actions',
      details: 'Details',
      preview: 'Preview',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      characters: 'characters',
    },
    welcome: {
      title: 'Welcome to 10X Logistics',
      subtitle: 'Learning and Community Platform for Logistics Industry',
      getStarted: 'Get Started',
    },
    classroom: {
      title: 'Classroom',
      createCourse: 'Create Course',
      editCourse: 'Edit Course',
      deleteCourse: 'Delete Course',
      courseName: 'Course Name',
      courseDescription: 'Course Description',
      courseType: 'Course Type',
      freeType: 'Free',
      paidType: 'Paid',
      coverImage: 'Cover Image',
      recommendedRatio: 'Recommended ratio: 16:9',
      addSection: 'Add Section',
      editSection: 'Edit Section',
      deleteSection: 'Delete Section',
      sectionName: 'Section Name',
      addLesson: 'Add Lesson',
      editLesson: 'Edit Lesson',
      deleteLesson: 'Delete Lesson',
      lessonName: 'Lesson Name',
      accessPublic: 'Public',
      accessPublicDesc: 'Everyone can access this content.',
      accessMember: 'Member',
      accessMemberDesc: 'User needs to join the community to access this content.',
      accessLevel: 'Level',
      accessLevelDesc: 'User needs to reach a minimum level to access.',
      introduction: 'Introduction',
      introductionPlaceholder: 'Describe and introduce your course',
      ctaConfig: 'CTA Button Config',
      buttonName: 'Button Name',
      desktop: 'Desktop',
      mobile: 'Mobile',
      lessonCount: 'Lessons',
      duration: 'Duration',
      published: 'Published',
      draft: 'Draft',
      publish: 'Publish',
      unpublish: 'Unpublish',
      reorder: 'Reorder',
      move: 'Move',
      uploadCover: 'Upload Cover',
      deleteIntroduction: 'Delete Introduction',
      deleteIntroductionConfirm: 'Are you sure you want to delete this content? It cannot be recovered.',
      editContent: 'Edit Content',
      clearContent: 'Clear Content',
      price: 'Price',
    },
    membership: {
      joinTitle: 'Join 10X Logistics',
      joinSubtitle: 'Please answer the following questions for Admin review.',
      questionOf: 'Question',
      textAnswer: 'Text Answer',
      multipleChoice: 'Multiple Choice',
      emailType: 'Email',
      submitRequest: 'Submit Request',
      agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
      pendingApproval: 'Pending Approval',
      pendingMessage: 'Your membership request is being reviewed. Please wait for Admin approval.',
      membershipRequests: 'Membership Requests',
      questionSettings: 'Membership Question Settings',
      enableQuestions: 'Enable Membership Questions',
      autoApprove: 'Auto-approve',
      autoApproveDesc: 'When enabled, members will be auto-approved after answering',
      addQuestion: 'Add Question',
      editQuestion: 'Edit Question',
      deleteQuestion: 'Delete Question',
      questionText: 'Question Text',
      questionTextEn: 'English Text',
      questionType: 'Question Type',
      questionOptions: 'Options',
      isRequired: 'Required',
      approve: 'Approve',
      decline: 'Decline',
      viewAnswers: 'View Answers',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
    },
    affiliate: {
      dashboardTitle: 'Affiliate Dashboard',
      totalEarnings: 'Total Earnings',
      pendingAmount: 'Pending',
      availableAmount: 'Available',
      totalWithdrawn: 'Withdrawn',
      clicks: 'Clicks',
      signups: 'Signups',
      purchases: 'Purchases',
      conversionRate: 'Conversion Rate',
      yourLink: 'Your Referral Link',
      copyLink: 'Copy Link',
      linkCopied: 'Link copied!',
      shareToFacebook: 'Share to Facebook',
      shareToZalo: 'Share to Zalo',
      withdrawTitle: 'Withdraw Commission',
      withdrawAll: 'Withdraw All',
      minimumAmount: 'Minimum Amount',
      bankName: 'Bank',
      accountNumber: 'Account Number',
      accountName: 'Account Name',
      branchName: 'Branch',
      confirmWithdraw: 'Confirm Withdrawal',
      settingsTitle: 'Affiliate Settings',
      enableAffiliate: 'Enable Affiliate System',
      defaultCommission: 'Default Commission',
      cookieDuration: 'Cookie Duration',
      pendingPeriod: 'Pending Period',
      pendingPeriodDesc: 'Commission will be held to prevent refund fraud',
      minPayoutAmount: 'Minimum Payout Amount',
      transactionHistory: 'Transaction History',
      courseSettings: 'Course-specific Settings',
      commissionRate: 'Commission Rate',
      payoutRequests: 'Payout Requests',
      topAffiliates: 'Top Affiliates',
      totalRevenue: 'Total Revenue',
      totalCommission: 'Total Commission',
      referrals: 'Referrals',
      payoutNote: 'Payout requests will be processed within 3-5 business days',
      earnCommission: 'Earn Commission',
      shareAndEarn: 'Refer friends & Earn commission!',
    },
    admin: {
      title: 'Admin',
      membershipSettings: 'Membership Settings',
      affiliateSettings: 'Affiliate Settings',
      memberManagement: 'Member Management',
      contentModeration: 'Content Moderation',
      communitySettings: 'Community Settings',
      analytics: 'Analytics',
      inviteMember: 'Invite Member',
      removeMember: 'Remove Member',
      banMember: 'Ban Member',
      promoteToModerator: 'Promote to Moderator',
      demoteToMember: 'Demote to Member',
      questionsList: 'Questions List',
      noQuestions: 'No questions yet',
      maxQuestionsReached: 'Maximum questions reached',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved',
    },
    community: {
      title: 'Community',
      subtitle: 'Discussion forum for the community',
      comingSoon: 'Discussion forum coming soon. You will be able to post, comment, and connect with the community.',
      createPost: 'Create Post',
      writePost: 'Write Post',
      postPlaceholder: "What's on your mind?",
      like: 'Like',
      comment: 'Comment',
      reply: 'Reply',
      share: 'Share',
      pin: 'Pin',
      unpin: 'Unpin',
      deletePost: 'Delete Post',
      editPost: 'Edit Post',
      channels: 'Channels',
      announcements: 'Announcements',
      qna: 'Q&A',
      shareExperience: 'Share Experience',
      introductions: 'Introductions',
      sortNewest: 'Newest',
      sortBestWeek: 'Best This Week',
      sortBestMonth: 'Best This Month',
      sortBestAll: 'Best All Time',
    },
    calendar: {
      title: 'Calendar',
      subtitle: 'Track upcoming events and webinars',
      createEvent: 'Create Event',
      editEvent: 'Edit Event',
      deleteEvent: 'Delete Event',
      eventTitle: 'Event Title',
      eventDescription: 'Event Description',
      eventDate: 'Date',
      eventTime: 'Time',
      eventLink: 'Event Link',
      rsvp: 'RSVP',
      attending: 'Attending',
      notAttending: 'Not Attending',
      maybe: 'Maybe',
      upcomingEvents: 'Upcoming Events',
      noEvents: 'No events',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
    },
    members: {
      title: 'Members',
      memberCount: 'members',
      searchPlaceholder: 'Search members...',
      filterOnline: 'Online',
      filterLevel: 'Level',
      filterJoinDate: 'Join Date',
      viewProfile: 'View Profile',
      follow: 'Follow',
      unfollow: 'Unfollow',
      message: 'Message',
      followers: 'Followers',
      following: 'Following',
      recentPosts: 'Recent Posts',
      activityChart: 'Activity Chart',
      joinedOn: 'Joined on',
      online: 'Online',
      offline: 'Offline',
    },
    leaderboard: {
      title: 'Leaderboard',
      subtitle: 'Most active members',
      last7Days: '7 days',
      last30Days: '30 days',
      allTime: 'All time',
      rank: 'Rank',
      member: 'Member',
      data7Days: '7 days data',
      data30Days: '30 days data',
      dataAllTime: 'All time points',
    },
    about: {
      title: '10X Logistics',
      subtitle: 'Learning and networking community for Logistics industry',
      community: 'Community',
      communityDesc: 'Connect with thousands of industry experts',
      learning: 'Learning',
      learningDesc: 'Quality courses from top experts',
      growth: 'Growth',
      growthDesc: 'Enhance skills and advance your career',
      guidelines: 'Community Guidelines',
      guidelineRespect: 'Respect all members',
      guidelineShare: 'Share valuable knowledge',
      guidelineNoSpam: 'No spam or advertising',
      guidelineProfessional: 'Keep content professional',
      guidelineSupport: 'Support and help each other',
      contact: 'Contact',
    },
    notifications: {
      newSignup: '{name} signed up via your link!',
      newPurchase: '{name} purchased {course}. You earn {amount}!',
      commissionConfirmed: '{amount} commission confirmed!',
      commissionReversed: '{amount} commission reversed due to refund',
      payoutRequested: '{name} requested payout of {amount}',
      payoutCompleted: '{amount} has been transferred to your account!',
      payoutRejected: 'Payout request rejected: {reason}',
      membershipApproved: 'Welcome! Your membership request has been approved.',
      membershipDeclined: 'Your membership request has been declined.',
      newMemberRequest: '{name} requested to join the community',
      welcomeMessage: 'Welcome to 10X Logistics!',
    },
    notificationSettings: {
      title: 'Notification Settings',
      emailSection: 'Email Notifications',
      emailDigest: 'Email Digest',
      emailNotifications: 'Email Notifications',
      adminAnnouncements: 'Admin Announcements',
      eventReminders: 'Event Reminders',
      inAppSection: 'In-App Notifications',
      likes: 'Likes',
      comments: 'Comments',
      mentions: 'Mentions',
      followers: 'New Followers',
      followingPosts: 'Posts from Following',
      pushSection: 'Push Notifications',
      pushEnabled: 'Enable Push Notifications',
      off: 'Off',
      instant: 'Instant',
      daily: 'Daily',
      weekly: 'Weekly',
      settingsSaved: 'Settings saved',
    },
    messenger: {
      title: 'Messages',
      searchPlaceholder: 'Search conversations...',
      newMessage: 'New message',
      typeMessage: 'Type a message...',
      send: 'Send',
      noConversations: 'No conversations yet',
      selectConversation: 'Select a conversation to start',
      messageDeleted: 'Message was deleted',
      you: 'You',
      online: 'Online',
      offline: 'Offline',
      sending: 'Sending...',
      sent: 'Sent',
      delivered: 'Delivered',
      read: 'Read',
      attachFile: 'Attach file',
      attachImage: 'Attach image',
      yesterday: 'Yesterday',
      today: 'Today',
      newConversation: 'New conversation',
      selectUser: 'Search for users...',
    },
    status: {
      pending: 'Pending',
      approved: 'Approved',
      declined: 'Declined',
      processing: 'Processing',
      completed: 'Completed',
      rejected: 'Rejected',
      confirmed: 'Confirmed',
      paid: 'Paid',
      reversed: 'Reversed',
      published: 'Published',
      draft: 'Draft',
      active: 'Active',
      inactive: 'Inactive',
      online: 'Online',
      offline: 'Offline',
    },
    errors: {
      required: 'This field is required',
      invalidFormat: 'Invalid format',
      minLength: 'Minimum {min} characters',
      maxLength: 'Maximum {max} characters',
      networkError: 'Network error',
      serverError: 'Server error',
      unauthorized: 'You need to log in to perform this action',
      forbidden: 'You do not have permission to perform this action',
      notFound: 'Not found',
      somethingWentWrong: 'Something went wrong',
      tryAgain: 'Please try again',
      sessionExpired: 'Session expired',
    },
  },
};

export type Language = keyof typeof translations;
