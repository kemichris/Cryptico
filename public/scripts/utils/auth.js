const Auth = {
  getToken: () => localStorage.getItem("token"),
  getUser: () => JSON.parse(localStorage.getItem("user"))
};