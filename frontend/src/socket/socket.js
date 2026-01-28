// client/src/socket/socket.js
import { playAudio, initAudioPlayer } from "../audio/AudioPlayer.js";

export const socket = new WebSocket("ws://localhost:5000/ws/voice");

socket.binaryType = "arraybuffer";

socket.onopen = () => {
  console.log("🟢 WebSocket connected");
  initAudioPlayer(); // prepare speaker
};

socket.onmessage = async (event) => {
  if (typeof event.data === "string") {
    const msg = JSON.parse(event.data);
    console.log("📨 Received text message:", msg);

    if (msg.type === "tts_end") {
      console.log("🔚 TTS finished");
    }
  } else {
    console.log("📨 Received audio file, size:", event.data.byteLength);
    await playAudio(event.data);
  }
};

socket.onerror = (err) => {
  console.error("❌ WebSocket error", err);
};

socket.onclose = () => {
  console.log("🔴 WebSocket disconnected");
};
