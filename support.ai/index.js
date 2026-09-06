import { log, chats } from "./chats.js";
const button = document.getElementById("enable-button");
button.addEventListener("click", () => {
    // @ts-ignore
    window.supportAI.enableAutoReply();
});
log(chats);
