const client = io("http://localhost:3000/", {
  auth: {
    authorization: "User",
  },
});

client.on("connect", () => {
  console.log("connection established successfully");
});
client.emit("sayHi", (res) => {
  console.log(res);
});
