import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export function createDeepgramStream(onTranscript) {
  const dgConnection = deepgram.listen.live({
    model: "nova-2",
    language: "en-IN",
    smart_format: true,
    encoding: "linear16",
    sample_rate: 16000,
    channels: 1,
    interim_results: true,
    endpointing: 300,
  });

  dgConnection.on(LiveTranscriptionEvents.Open, () => {
    console.log("🟢 Deepgram connection opened");
  });

  dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel?.alternatives?.[0]?.transcript || "";

    if (transcript) {
      onTranscript({
        text: transcript,
        isFinal: data.is_final,
      });
    }
  });

  dgConnection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error("❌ Deepgram error:", err);
  });

  dgConnection.on(LiveTranscriptionEvents.Close, () => {
    console.log("🔴 Deepgram connection closed");
  });

  return dgConnection;
}

export async function streamTTS({ text, onAudioChunk, onEnd }) {
  try {
    console.log("🎤 Generating Deepgram TTS audio...");

    const response = await fetch(
      "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram TTS error: ${response.status} - ${errorText}`);
    }

    // Get the complete audio buffer
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log(`✅ Received complete audio: ${uint8Array.length} bytes`);

    // Send the whole file as one "chunk"
    onAudioChunk(uint8Array);

    // Signal end
    onEnd?.();
  } catch (error) {
    console.error("❌ Deepgram TTS error:", error);
  }
}
