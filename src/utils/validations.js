const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(form) {
  const errors = {};
  // display_name
  if (!form.username?.trim()) {
    errors.username = "Vui lòng nhập họ tên";
  } else if (form.username.trim().length < 3) {
    errors.username = "Tên quá ngắn, vui lòng nhập đầy đủ họ tên";
  }
  // email

  if (!form.email?.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "Email không hợp lệ";
  }

  // password
  if (!form.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (form.password.length < 6) {
    errors.password = "Mật khẩu cần ít nhất 6 ký tự";
  }
  // confirmPassword
  if (!form.confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return errors;
}

export function validateLogin({ username, password }) {
  const errors = {};
  if (!username?.trim()) {
    errors.email = "Vui lòng nhập username";
  } 
  if (!password?.trim()) {
    errors.password = "Vui lòng nhập mật khẩu";
  }
  return errors;
}
