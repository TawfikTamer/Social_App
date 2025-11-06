import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../Utils";
import { ChatInit } from "../Modules/controllers.index";

let io: Server;
const whitelist = process.env.WHITELIST?.split(",");
const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin || whitelist?.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export const connectedSocket = new Map<string, string[]>(); // userId : [soketId , soketId2 , ... ]

function socketAuth(socket: Socket, next: Function) {
  const { accesstoken } = socket.handshake.auth;
  const [, token] = accesstoken.split(" ");
  const decodedData = verifyToken(token, process.env.JWT_ACCESS_KEY as string);

  socket.data = {
    userID: decodedData._id,
    email: decodedData.email,
    userName: decodedData.userName,
  };

  const userTabs = connectedSocket.get(socket.data.userID);
  if (!userTabs) connectedSocket.set(socket.data.userID, [socket.id]);
  else userTabs.push(socket.id);

  socket.emit("connected", {
    user: {
      _id: socket.data.userID,
      email: socket.data.email,
      userName: socket.data.userName,
    },
  });
  next();
}

const soketDisconnected = (socket: Socket) => {
  socket.on("disconnect", () => {
    let userTabs = connectedSocket.get(socket.data.userID);

    if (userTabs && userTabs.length) {
      userTabs = userTabs.filter((tab) => {
        return tab != socket.id;
      });
      if (!userTabs.length) connectedSocket.delete(socket.data.userID);
      else connectedSocket.set(socket.data.userID, userTabs);
    }
  });
};

export const ioInitializer = (server: HttpServer) => {
  io = new Server(server, { cors: corsOptions });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    soketDisconnected(socket);
    socket.emit("online", Array.from(connectedSocket.keys()));

    ChatInit(socket);
  });
};

export const getIo = () => {
  try {
    if (!io) throw new Error("socket.io didn't initialzied correctlly");
    return io;
  } catch (error) {
    console.log(error);
  }
};
