import { useState, useRef, useCallback, useEffect } from "react";

export function useVoiceAgent({ moduleType, conversationId, onTranscript }) {
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [isConnected, setIsConnected] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  // Initialize Audio Context
  const initAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      mediaStreamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = convertFloat32ToInt16(inputData);
        socketRef.current.send(pcmData);
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination); // Required for script processor to fire
      processorRef.current = processor;
      setStatus("Listening");

    } catch (err) {
      console.error("Audio init error:", err);
      setStatus("Error: No Mic Access");
    }
  };

  const convertFloat32ToInt16 = (buffer) => {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, Math.max(-1, buffer[l])) * 0x7fff;
    }
    return buf.buffer;
  };

  const startVoiceAgent = () => {
    if (isRunning) return;

    setStatus("Connecting...");
    const url = `ws://localhost:5000/ws/voice?moduleType=${moduleType}` + (conversationId ? `&conversationId=${conversationId}` : '');
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WS Connected");
      setIsConnected(true);
      setIsRunning(true);
      initAudio();
    };

    ws.onmessage = async (event) => {
      const data = event.data;

      if (data instanceof Blob) {
        const arrayBuffer = await data.arrayBuffer();
        audioQueueRef.current.push(arrayBuffer);
        playNextChunk();
      } else {
        try {
          const msg = JSON.parse(data);
          
          if (msg.type === "transcript") {
            if (msg.role === "user") {
              if (msg.isFinal) {
                setInterimTranscript("");
                onTranscriptRef.current(msg.text, "user");
              } else {
                setInterimTranscript(msg.text);
              }
            } else if (msg.role === "assistant") {
              onTranscriptRef.current(msg.text, "bot");
            }
          }
        } catch (e) {}
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsRunning(false);
      setStatus("Disconnected");
    };

    ws.onerror = () => {
      setStatus("Connection Error");
      setIsRunning(false);
    };
  };

  const stopVoiceAgent = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsConnected(false);
    setIsRunning(false);
    setStatus("Ready");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      stopVoiceAgent();
    };
  }, [stopVoiceAgent]);

  const playNextChunk = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    setStatus("Speaking...");

    const chunk = audioQueueRef.current.shift();

    try {
      const audioBuffer = await audioContextRef.current.decodeAudioData(chunk);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        isPlayingRef.current = false;
        setStatus("Listening");
        playNextChunk();
      };
      source.start(0);
    } catch (e) {
      console.error("Error playing chunk", e);
      isPlayingRef.current = false;
      playNextChunk();
    }
  };

  return { isRemoteVoiceRunning: isRunning, voiceStatus: status, isVoiceConnected: isConnected, startVoiceAgent, stopVoiceAgent, interimTranscript };
}
