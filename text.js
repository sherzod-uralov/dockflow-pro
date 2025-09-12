const url = "http://192.168.0.106:5052/api/v1/auth/login";

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "nordicdoc", password: "admin123" }),
})
  .then((res) => res.text())
  .then(console.log)
  .catch(console.error);
