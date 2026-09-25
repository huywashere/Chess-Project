/**
 * Authentication Input Validation & Password Security Utilities
 */

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: string;
  color: string;
  feedback: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: "Chưa nhập",
      color: "var(--text-muted)",
      feedback: ["Vui lòng nhập mật khẩu"],
    };
  }

  // Length checks
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Tối thiểu 8 ký tự");
  }

  // Lowercase & Uppercase check
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  if (hasLower && hasUpper) {
    score += 1;
  } else {
    feedback.push("Cần có cả chữ hoa (A-Z) và chữ thường (a-z)");
  }

  // Digit check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Cần ít nhất 1 chữ số (0-9)");
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Cần ít nhất 1 ký tự đặc biệt (!@#$%...)");
  }

  // Map scores
  const scoreConfig = [
    { label: "Rất yếu", color: "#ef4444" },
    { label: "Yếu", color: "#f97316" },
    { label: "Trung bình", color: "#eab308" },
    { label: "Khá mạnh", color: "#84cc16" },
    { label: "Rất an toàn", color: "#22c55e" },
  ];

  const current = scoreConfig[score] || scoreConfig[0];

  return {
    score,
    label: current.label,
    color: current.color,
    feedback,
  };
}

export interface RegisterValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateRegisterInput(data: {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
}): RegisterValidationResult {
  const errors: Record<string, string> = {};

  // Username
  const username = data.username?.trim() || "";
  if (!username) {
    errors.username = "Tên đăng nhập không được để trống";
  } else if (username.length < 3 || username.length > 20) {
    errors.username = "Tên đăng nhập phải từ 3 đến 20 ký tự";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới (_)";
  }

  // Email
  const email = data.email?.trim().toLowerCase() || "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = "Email không được để trống";
  } else if (!emailRegex.test(email) || email.length > 255) {
    errors.email = "Địa chỉ email không hợp lệ";
  }

  // Password
  const password = data.password || "";
  if (!password) {
    errors.password = "Mật khẩu không được để trống";
  } else if (password.length < 8) {
    errors.password = "Mật khẩu phải có tối thiểu 8 ký tự";
  } else {
    const strength = calculatePasswordStrength(password);
    if (strength.score < 2) {
      errors.password = "Mật khẩu quá yếu. Cần kết hợp chữ hoa, chữ thường và chữ số.";
    }
  }

  // Confirm Password
  if (data.confirmPassword !== undefined && data.confirmPassword !== password) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  // Terms
  if (data.acceptTerms === false) {
    errors.terms = "Bạn cần đồng ý với Điều khoản dịch vụ & Chính sách bảo mật";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginInput(data: {
  identifier?: string;
  password?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const identifier = data.identifier?.trim() || "";
  if (!identifier) {
    errors.identifier = "Vui lòng nhập Email hoặc Tên đăng nhập";
  }

  const password = data.password || "";
  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
