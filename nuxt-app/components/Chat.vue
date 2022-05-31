  <template>
  <div class="max-w-7xl mx-auto my-auto py-4 sm:px-4 lg:px-4">
    <!-- Replace with your content -->
    <div class="px-4 py-4 sm:px-0">
      <div
        id="chat"
        class="
          overflow-y-auto
          h-96
          border-4 border-dashed border-gray-200
          rounded-lg
          flex flex-col
        "
        ref="messageDisplay"
      >
        <br />
        <!-- Messages -->
        <div class="pl-2 dark:text-white">
          <p v-for="(message, i) in messages" :key="'msg-' + i">
            <b>{{ message.user }}:</b> {{ message.message }}
          </p>
        </div>
      </div>
    </div>
    <!-- /End replace -->
    <p v-for="(user, i) in usersTyping" :key="'user-' + i">
      <b>{{ user }}:</b> is typing
    </p>
    <textarea
      @keyup.enter="sendMessage"
      @focusin="sendUserIsTyping"
      @focusout="sendUserStoppedTyping"
      class="
        resize-none
        rounded-md
        w-full
        h-32
        max-h-96
        text-sm text-gray-900
        bg-gray-50
        rounded-lg
        border border-gray-300
        focus:ring-blue-500 focus:border-blue-500
        dark:bg-gray-700
        dark:border-gray-600
        dark:placeholder-gray-400
        dark:text-white
        dark:focus:ring-blue-500
        dark:focus:border-blue-500
      "
      id="message"
      v-model="myMessage"
      placeholder="Your message..."
    ></textarea>
  </div>
</template> 

<!-- script -->
<script setup>
import { io } from "socket.io-client";

const props = defineProps(["chatUsername"]);

var socket = io("http://localhost:7000/");
const userId = ref("");
const userName = ref(props.chatUsername);
const myMessage = ref("");
const messages = ref([]);
const usersTyping = ref([]);
const messageDisplay = ref(null);

// used on generateName()
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

onMounted(() => {
  // scroll chat
  scrollChat();

  // checks if the username is empty
  if (props.chatUsername == "") {
    userName.value = generateName();
    localStorage.setItem("username", userName.value);
  } else {
    userName.value = props.chatUsername;
  }
});

// send message to the socket server
function sendMessage() {
  if (myMessage.value) {
    socket.emit(
      "chat message",
      JSON.stringify({
        user: userName.value,
        message: myMessage.value,
      })
    );
    myMessage.value = "";
  }
}

// send to the socket server the info that the user is typing
function sendUserIsTyping() {
  socket.emit("user is typing", userId.value);
}

// send to the socket server the info that the user stopped typing
function sendUserStoppedTyping() {
  socket.emit("user stopped typing", userId.value);
}

// scrolls the chat to the last msg
function scrollChat() {
  var container = document.getElementById("chat");
  container.scrollTop = container.scrollHeight + 999999999999999999999; // check this!!
}

// handle the messages from the socket server
socket.on("chat message", function (msg) {
  messages.value.push(msg);
  scrollChat();
});

// handle to when the server updates the list of users that are typing
socket.on("users typing", function (msg) {
  // cheks if its not related to the current user
  if (msg != props.chatUsername) {
    usersTyping.value = msg;
  }
});

// handle the id that the server gens for the user
socket.on("user id", function (msg) {
  userId.value = msg;
  console.log(userId.value);
});

// gen random name of 6 chars
function generateName() {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  console.log(result);
  return result;
}
</script>