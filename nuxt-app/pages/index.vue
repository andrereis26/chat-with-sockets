
<template>
  <!-- User name input -->
  <div class="w-80 mx-auto my-auto py-4 sm:px-4">
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
  <Chat v-if="username" :chatUsername="username" />
  <Chat v-else chatUsername="" />
</template>
<script setup>
/*I was doing the whole thing of getting and setting the username with the 
ref thing but if I use it, while I write on the input, it will always rhow me warnings
in the console. Idk why that happens but it's related with the v-model */
let username = ref("");
onMounted(() => {
  // check if user has a username already
  if (localStorage.getItem("username")) {
    document.getElementById("myUsername").value =
      localStorage.getItem("username");
    username.value = localStorage.getItem("username");
  }
});

// stores the usernma on localstorage
function changeUsername() {
  localStorage.setItem("username", document.getElementById("myUsername").value);
  username.value = document.getElementById("myUsername").value;
}
</script>