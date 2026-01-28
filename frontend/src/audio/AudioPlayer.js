// client/src/audio/audioPlayer.js

let currentAudio = null;

export function initAudioPlayer() {
  console.log("🔊 AudioPlayer initialized (Non-streaming mode)");
}

// Now receives the full MP3 file as a single chunk
export async function playAudio(audioData) {
  try {
    console.log(
      "🎵 Playing full audio response...",
      audioData.byteLength,
      "bytes",
    );

    // Create a Blob from the MP3 data
    const blob = new Blob([audioData], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    // Stop previous audio if playing
    if (currentAudio) {
      currentAudio.pause();
      URL.revokeObjectURL(currentAudio.src);
    }

    // Play using standard HTML5 Audio
    currentAudio = new Audio(url);

    currentAudio.onended = () => {
      console.log("🔚 Audio playback finished");
      URL.revokeObjectURL(url);
    };

    currentAudio.onerror = (e) => {
      console.error("❌ Audio playback error", e);
    };

    await currentAudio.play();
  } catch (error) {
    console.error("❌ Error playing audio:", error);
  }
}
