const AUTH_KEY = "finder-auth";

const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "123456";

export function checkCredentials(username: string, password: string) {
  return username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function isLoggedIn(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function setLoggedIn(value: boolean) {
  try {
    if (value) sessionStorage.setItem(AUTH_KEY, "1");
    else sessionStorage.removeItem(AUTH_KEY);
  } catch {
    // Storage blocked; login only lasts until reload.
  }
}
