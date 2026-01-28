// client/src/audio/AudioRecorder.jsx
import { useRef, useState } from "react";
import { socket } from "../socket/socket";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const sourceRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // 🔥 Buffer for small AudioWorklet frames
  const pcmBufferRef = useRef([]);

  const TARGET_SAMPLES = 4096; // ≈4096 bytes (ideal for Deepgram)

  const startRecording = async () => {
    setError(null);

    try {
      // 1️⃣ Browser capability check
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser does not support audio recording");
      }

      // 2️⃣ Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 3️⃣ WebSocket must already be open
      if (socket.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected");
      }

      // 4️⃣ Create AudioContext
      const audioContext = new AudioContext({ sampleRate: 16000 });

      // 5️⃣ Load AudioWorklet
      await audioContext.audioWorklet.addModule("/pcm-processor.js");

      // 6️⃣ Create nodes
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");

      // 7️⃣ Receive PCM frames from worklet
      workletNode.port.onmessage = (event) => {
        if (socket.readyState !== WebSocket.OPEN) return;

        const pcmChunk = new Int16Array(event.data);
        pcmBufferRef.current.push(pcmChunk);

        // Count total samples in buffer
        const totalSamples = pcmBufferRef.current.reduce(
          (sum, chunk) => sum + chunk.length,
          0,
        );

        // 🔥 Send only when buffer is large enough
        if (totalSamples >= TARGET_SAMPLES) {
          const merged = new Int16Array(totalSamples);
          let offset = 0;

          for (const chunk of pcmBufferRef.current) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }

          socket.send(merged.buffer);
          pcmBufferRef.current = [];
        }
      };

      // 8️⃣ Connect audio graph (don't connect to destination - that causes mic feedback!)
      source.connect(workletNode);
      // workletNode does NOT connect to destination - we only send audio to server

      // 9️⃣ Save refs
      audioContextRef.current = audioContext;
      workletNodeRef.current = workletNode;
      sourceRef.current = source;

      setRecording(true);
    } catch (err) {
      console.error("Audio start error:", err);
      setError(err.message || "Failed to start recording");
      cleanup();
    }
  };

  const stopRecording = () => {
    cleanup();
    setRecording(false);
  };

  const cleanup = () => {
    try {
      workletNodeRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioContextRef.current?.close();

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.warn("Cleanup error:", err);
    } finally {
      audioContextRef.current = null;
      workletNodeRef.current = null;
      sourceRef.current = null;
      mediaStreamRef.current = null;
      pcmBufferRef.current = [];
    }
  };

  return (
    <div>
      {!recording ? (
        <button onClick={startRecording}>🎤 Start Talking</button>
      ) : (
        <button onClick={stopRecording}>🛑 Stop</button>
      )}

      {error && <p style={{ color: "red", marginTop: "10px" }}>⚠️ {error}</p>}
    </div>
  );
}
