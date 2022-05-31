  <template>
  <div>
    <!-- User name input -->
    <div class="w-80 mx-auto my-auto py-4 sm:px-4" key="usernameDiv">
      <label
        for="first_name"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >Username</label
      >
      <div class="relative w-full">
        <input
          type="text"
          id="myUsername"
          class="
            block
            p-2.5
            w-full
            h-12
            z-20
            text-sm text-gray-900
            bg-gray-50
            rounded
            focus:ring-blue-500 focus:border-blue-500
            dark:bg-gray-700
            dark:border-gray-600
            dark:placeholder-gray-400
            dark:text-white
            dark:focus:border-blue-500
          "
          v-model="userName"
          placeholder="leave it blank for random name"
          @keyup.enter="changeUsername"
        />
        <button
          type="submit"
          class="
            absolute
            top-0
            right-0
            p-2.5
            text-sm
            font-medium
            text-white
            bg-blue-700
            rounded-r-lg
            border border-blue-700
            hover:bg-blue-800
            focus:ring-4 focus:outline-none focus:ring-blue-300
            dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800
          "
          @click="changeUsername"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 30 30"
            width="30px"
            height="26px"
          >
            <g id="surface382597">
              <path
                style="
                  stroke: none;
                  fill-rule: nonzero;
                  fill: rgb(100%, 100%, 100%);
                  fill-opacity: 1;
                "
                d="M 15 3 C 12.03125 3 9.304688 4.082031 7.207031 5.875 C 6.921875 6.101562 6.78125 6.46875 6.84375 6.828125 C 6.90625 7.1875 7.160156 7.484375 7.507812 7.605469 C 7.855469 7.722656 8.238281 7.640625 8.503906 7.394531 C 10.253906 5.898438 12.515625 5 15 5 C 20.195312 5 24.449219 8.9375 24.949219 14 L 22 14 L 26 20 L 30 14 L 26.949219 14 C 26.4375 7.851562 21.277344 3 15 3 Z M 4 10 L 0 16 L 3.050781 16 C 3.5625 22.148438 8.722656 27 15 27 C 17.96875 27 20.695312 25.917969 22.792969 24.125 C 23.078125 23.898438 23.21875 23.53125 23.15625 23.171875 C 23.09375 22.8125 22.839844 22.515625 22.492188 22.394531 C 22.144531 22.277344 21.761719 22.359375 21.496094 22.605469 C 19.746094 24.101562 17.484375 25 15 25 C 9.804688 25 5.550781 21.0625 5.046875 16 L 8 16 Z M 4 10 "
              />
            </g>
          </svg>
        </button>
      </div>
    </div>
    <!-- Chat -->
    <div class="max-w-7xl mx-auto my-auto py-4 sm:px-4 lg:px-4" key="chatDiv">
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
  </div>
</template> 

<!-- script -->
<script setup>
import { io } from "socket.io-client";
var socket = io("http://localhost:7000/", { autoConnect: false });

/////////////// chat things ///////////////
const userId = ref("");
const userName = ref("");
const myMessage = ref("");
const messages = ref([]);
const usersTyping = ref([]);
const messageDisplay = ref(null);

// used on generateName()
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

onMounted(() => {
  console.log("ttttttttt");
  // scroll chat
  scrollChat();

  // manually connect to server
  socket.connect();

  // send to socket server that is ready ro receive data
  socket.emit("ready to receive", userName.value);
});

onUnmounted(() => {
  // dc from server
  socket.disconnect();
});

// send message to the socket server
function sendMessage() {
  if (myMessage.value.length > 1) {
    // checks if the username is empty
    if (userName.value == "") {
      userName.value = generateName();
      localStorage.setItem("username", userName.value);
    }

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
  if (msg != userName.value) {
    usersTyping.value = msg;
  }
});

// handle the id that the server gens for the user
socket.on("user id", function (msg) {
  userId.value = msg;
});

socket.on("connect", () => {
  console.log("hello");
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

/////////////// username input things ///////////////
/*I was doing the whole thing of getting and setting the username with the 
ref thing but if I use it, while I write on the input, it will always rhow me warnings
in the console. Idk why that happens but it's related with the v-model */
onMounted(() => {
  // check if user has a username already
  if (localStorage.getItem("username")) {
    userName.value = localStorage.getItem("username");
  }
});

// stores the usernma on localstorage
function changeUsername() {
  localStorage.setItem("username", userName.value);
}
</script>