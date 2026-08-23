const http = require("http");

const data = JSON.stringify({
  full_name: "Test User",
  email: "test@example.com",
  phone: "0700000000",
  password: "TestPassword123"
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/register",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data)
  }
};

const request = http.request(options, (response) => {
  let body = "";

  response.on("data", (chunk) => {
    body += chunk;
  });

  response.on("end", () => {
    console.log(body);
  });
});

request.on("error", (error) => {
  console.error(error);
});

request.write(data);
request.end();