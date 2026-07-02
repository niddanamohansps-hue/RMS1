import { api } from "../../../../lib/api";

export const authService = {
  async login(identifier, password) {
    const data = await api.post("/auth/login/", {
      email: identifier.trim(),
      password: password,
    });

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    const profile = await api.get("/auth/me/");
    return profile;
  },

  async signup({ firstName, lastName, email, phone, password, confirmPassword }) {
    const data = await api.post("/auth/register/", {
      email: email.trim(),
      password: password,
      confirm_password: confirmPassword,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
    });

    localStorage.setItem("access_token", data.tokens.access);
    localStorage.setItem("refresh_token", data.tokens.refresh);
    return data;
  }
};
