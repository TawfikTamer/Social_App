const baseURL = "http://localhost:3000";
const token = localStorage.getItem("token");

let globalProfile = {};
let onlineUsers;
const headers = {
  "Content-Type": "application/json; charset=UTF-8",
  accesstoken: token,
};
const clientIo = io(baseURL, { auth: { accesstoken: token } });

clientIo.on("server_error", (err) => {
  console.log("custom_error:", err.message);
});

clientIo.on("connected", ({ user }) => {
  globalProfile = user;
});

clientIo.on("disconnected_user", (data) => {
  console.log({ data });
});

clientIo.on("online", (data) => {
  onlineUsers = data;
});

// Typing indicator
clientIo.on("isTyping", ({ senderId }) => {
  const typingDiv = document.getElementById("typingIndicator");
  if (senderId !== globalProfile._id) {
    typingDiv.style.display = "block";
  }
  clearTimeout(typingDiv.timeout);
  typingDiv.timeout = setTimeout(() => {
    typingDiv.style.display = "none";
  }, 1000);
});

//images links
let avatar = "./avatar/Avatar-No-Background.png";
let meImage = "./avatar/Avatar-No-Background.png";
let friendImage = "./avatar/Avatar-No-Background.png";

// collect messageInfo
function sendMessage(sendTo, type) {
  const textValue = $("#messageBody").val();
  if (!textValue.trim()) return;

  if (type == "ovo") {
    clientIo.emit("send-private-message", {
      text: textValue,
      targetUserId: sendTo,
    });
  } else if (type == "ovm") {
    clientIo.emit("send-group-message", {
      text: textValue,
      targetGroupId: sendTo,
    });
  }
  $("#messageBody").val("");
}

//sendCompleted
clientIo.on("message-sent", (data) => {
  const { text, senderId } = data;
  if (senderId.toString() == globalProfile._id) renderMyMessage(text);
  else renderFriendMessage(text);
});

// message render functions
function renderMyMessage(text) {
  const div = document.createElement("div");
  div.className = "me text-end p-2";
  div.dir = "rtl";
  div.innerHTML = `<img class="chatImage" src="${meImage}" alt="">
                   <span class="mx-2">${text}</span>`;
  document.getElementById("messageList").appendChild(div);
}

function renderFriendMessage(text) {
  const div = document.createElement("div");
  div.className = "myFriend p-2";
  div.dir = "ltr";
  div.innerHTML = `<img class="chatImage" src="${friendImage}" alt="">
                   <span class="mx-2">${text}</span>`;
  document.getElementById("messageList").appendChild(div);
}

function SayHi() {
  const div = document.createElement("div");
  div.className = "noResult text-center p-2";
  div.innerHTML = `<span class="mx-2">Say Hi to start the conversation.</span>`;
  document.getElementById("messageList").appendChild(div);
}

// FRIENDS AND GROUPS
function getUserData() {
  axios
    .get(`${baseURL}/api/user/profile/list-friends?status=accepted`, {
      headers,
    })
    .then((response) => {
      const { data } = response.data?.data;
      document.getElementById("profileImage").src = avatar;
      document.getElementById("userName").innerText = globalProfile.userName;
      showUsersData(data);
      showGroupList(data.groups);
    })
    .catch(console.log);
}

// SHOW FRIENDS LIST
function showUsersData(users = []) {
  let cartonna = "";
  users.list.forEach((u) => {
    let friend =
      globalProfile._id === u.senderId._id.toString()
        ? u.receiverId
        : u.senderId;
    const userState = onlineUsers.includes(friend._id) ? "online" : "";
    cartonna += `
      <div onclick="displayChatUser('${friend._id}')" class="chatUser my-2">
        <img class="chatImage" src="${avatar}" alt="">
        <span class="ps-2">${friend.userName}</span>
        <span style="color:${
          userState === "online" ? "green" : ""
        }">${userState}</span>
      </div>`;
  });
  document.getElementById("chatUsers").innerHTML = cartonna;
}

// CHAT HISTORY
function showData(sendTo, chat) {
  document
    .getElementById("sendMessage")
    .setAttribute("onclick", `sendMessage('${sendTo}', 'ovo')`);
  document.getElementById("messageList").innerHTML = "";
  if (chat?.length) {
    $(".noResult").hide();
    chat.forEach((msg) => {
      if (msg.senderId.toString() === globalProfile._id.toString())
        renderMyMessage(msg.text);
      else renderFriendMessage(msg.text);
    });
  } else SayHi();
  $(`#c_${sendTo}`).hide();
}

// DISPLAY CHAT USER
function displayChatUser(userId) {
  // Typing input
  const messageInput = document.getElementById("messageBody");
  messageInput.addEventListener("input", () => {
    clientIo.emit("typing", userId);
  });

  // Chat history
  clientIo.emit("get-chat-history", userId);
  clientIo.on("chat-history", (chat) => {
    showData(userId, chat.length ? chat : 0);
  });
}

// SHOW GROUPS
function showGroupList(groups = []) {
  let cartonna = "";
  groups.forEach((g) => {
    cartonna += `
      <div onclick="displayGroupChat('${g._id}')" class="chatUser my-2">
        <img class="chatImage" src="${avatar}" alt="">
        <span class="ps-2">${g.name}</span>
      </div>`;
  });
  document.getElementById("chatGroups").innerHTML = cartonna;
}

// GROUP CHAT
function showGroupData(sendTo, chat) {
  document
    .getElementById("sendMessage")
    .setAttribute("onclick", `sendMessage('${sendTo}', 'ovm')`);
  document.getElementById("messageList").innerHTML = "";
  if (chat?.length) {
    $(".noResult").hide();
    chat.forEach((msg) => {
      if (msg.senderId.toString() === globalProfile._id.toString())
        renderMyMessage(msg.text);
      else renderFriendMessage(msg.text);
    });
  } else SayHi();
  $(`#g_${sendTo}`).hide();
}

function displayGroupChat(groupId) {
  clientIo.emit("get-group-chat", groupId);
  clientIo.on("group-chat-history", (chat) => {
    showGroupData(groupId, chat.length ? chat : 0);
  });
}

getUserData();
