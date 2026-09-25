/**
 * Authentication Input Validation & Password Security Utilities
 */

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: string;
  color: string;
  feedback: string[];
}

export function calculatePasswordStrength(
  password: string,
  lang: "vi" | "en" = "vi"
): PasswordStrengthResult {
  const isVi = lang === "vi";
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: isVi ? "Chưa nhập" : "Not entered",
      color: "var(--text-muted)",
      feedback: [isVi ? "Vui lòng nhập mật khẩu" : "Please enter a password"],
    };
  }

  // Length checks
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push(isVi ? "Tối thiểu 8 ký tự" : "At least 8 characters");
  }

  // Lowercase & Uppercase check
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  if (hasLower && hasUpper) {
    score += 1;
  } else {
    feedback.push(
      isVi
        ? "Cần có cả chữ hoa (A-Z) và chữ thường (a-z)"
        : "Requires uppercase (A-Z) and lowercase (a-z)"
    );
  }

  // Digit check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push(
      isVi ? "Cần ít nhất 1 chữ số (0-9)" : "Requires at least 1 number (0-9)"
    );
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push(
      isVi
        ? "Cần ít nhất 1 ký tự đặc biệt (!@#$%...)"
        : "Requires at least 1 special character (!@#$%...)"
    );
  }

  // Map scores
  const scoreConfigVi = [
    { label: "Rất yếu", color: "#ef4444" },
    { label: "Yếu", color: "#f97316" },
    { label: "Trung bình", color: "#eab308" },
    { label: "Khá mạnh", color: "#84cc16" },
    { label: "Rất an toàn", color: "#22c55e" },
  ];

  const scoreConfigEn = [
    { label: "Very Weak", color: "#ef4444" },
    { label: "Weak", color: "#f97316" },
    { label: "Medium", color: "#eab308" },
    { label: "Strong", color: "#84cc16" },
    { label: "Very Secure", color: "#22c55e" },
  ];

  const scoreConfig = isVi ? scoreConfigVi : scoreConfigEn;
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

export function validateRegisterInput(
  data: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: boolean;
  },
  lang: "vi" | "en" = "vi"
): RegisterValidationResult {
  const isVi = lang === "vi";
  const errors: Record<string, string> = {};

  // Username
  const username = data.username?.trim() || "";
  if (!username) {
    errors.username = isVi
      ? "Tên đăng nhập không được để trống"
      : "Username cannot be empty";
  } else if (username.length < 3 || username.length > 20) {
    errors.username = isVi
      ? "Tên đăng nhập phải từ 3 đến 20 ký tự"
      : "Username must be between 3 and 20 characters";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = isVi
      ? "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới (_)"
      : "Username can only contain letters, numbers, and underscores (_)";
  }

  // Email
  const email = data.email?.trim().toLowerCase() || "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = isVi ? "Email không được để trống" : "Email cannot be empty";
  } else if (!emailRegex.test(email) || email.length > 255) {
    errors.email = isVi ? "Địa chỉ email không hợp lệ" : "Invalid email address";
  }

  // Password
  const password = data.password || "";
  if (!password) {
    errors.password = isVi ? "Mật khẩu không được để trống" : "Password cannot be empty";
  } else if (password.length < 8) {
    errors.password = isVi
      ? "Mật khẩu phải có tối thiểu 8 ký tự"
      : "Password must have at least 8 characters";
  } else {
    const strength = calculatePasswordStrength(password, lang);
    if (strength.score < 2) {
      errors.password = isVi
        ? "Mật khẩu quá yếu. Cần kết hợp chữ hoa, chữ thường và chữ số."
        : "Password is too weak. Combine uppercase, lowercase, and numbers.";
    }
  }

  // Confirm Password
  if (data.confirmPassword !== undefined && data.confirmPassword !== password) {
    errors.confirmPassword = isVi
      ? "Mật khẩu xác nhận không khớp"
      : "Passwords do not match";
  }

  // Terms
  if (data.acceptTerms === false) {
    errors.terms = isVi
      ? "Bạn cần đồng ý với Điều khoản dịch vụ & Chính sách bảo mật"
      : "You must accept the Terms of Service & Privacy Policy";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginInput(
  data: {
    identifier?: string;
    password?: string;
  },
  lang: "vi" | "en" = "vi"
): { isValid: boolean; errors: Record<string, string> } {
  const isVi = lang === "vi";
  const errors: Record<string, string> = {};

  const identifier = data.identifier?.trim() || "";
  if (!identifier) {
    errors.identifier = isVi
      ? "Vui lòng nhập Email hoặc Tên đăng nhập"
      : "Please enter your Email or Username";
  }

  const password = data.password || "";
  if (!password) {
    errors.password = isVi ? "Vui lòng nhập mật khẩu" : "Please enter your password";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
