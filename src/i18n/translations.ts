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
}

interface WelcomeTranslations {
  title: string;
  subtitle: string;
  getStarted: string;
}

export interface TranslationKeys {
  nav: NavTranslations;
  auth: AuthTranslations;
  common: CommonTranslations;
  welcome: WelcomeTranslations;
}

export const translations: Record<'vi' | 'en', TranslationKeys> = {
  vi: {
    // Navigation
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
    },
    // Auth
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
    // Common
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
    },
    // Welcome
    welcome: {
      title: 'Chào mừng đến với 10X Logistics',
      subtitle: 'Nền tảng học tập và cộng đồng cho ngành Logistics',
      getStarted: 'Bắt đầu ngay',
    },
  },
  en: {
    // Navigation
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
    },
    // Auth
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
    // Common
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
    },
    // Welcome
    welcome: {
      title: 'Welcome to 10X Logistics',
      subtitle: 'Learning and Community Platform for Logistics Industry',
      getStarted: 'Get Started',
    },
  },
};

export type Language = keyof typeof translations;
