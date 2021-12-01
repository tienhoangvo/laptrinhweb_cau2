const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { MongoClient } = require("mongodb");

const url =
  "mongodb+srv://tienhoangvo:eOHY4d0ssMirvjpb@cluster0.q5z6s.mongodb.net";
const client = new MongoClient(url);

// Tên cơ sở dữ liệu
const dbName = "laptrinhweb_cau2_ngocgiao";

// Kết nối đến server cơ sở dữ liệu MongoDB trên MongoDB Atlas
client.connect((err) => {
  console.log("Kết nối cơ sở dữ liệu thành công!");
});

const db = client.db(dbName);
const userCollection = db.collection("users");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("list users", async () => {
    // Liệt kê tất cả các users
    const users = await (
      await userCollection.find({}).toArray()
    ).map((u) => ({ _id: u._id.toString(), fullname: u.fullname }));

    io.to(socket.id).emit("list users", users);
  });

  socket.on("add user", async (fullname) => {
    // Tạo user mới với fullname của nó
    const data = await userCollection.insertOne({
      fullname,
    });

    const userId = data.insertedId.toString();

    const user = { _id: userId, fullname };

    // Truyền sự kiện đến tất cả trình duyệt truy cập trang
    io.emit("add user", user);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`listening on: ${port}`);
});
