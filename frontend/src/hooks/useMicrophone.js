import { useRef, useEffect } from 'react';

export default function useMicrophone() {
  const analyserRef = useRef(null);

  useEffect(() => {
    let audioContext;
    let stream;

    const setupMic = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    setupMic();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  return analyserRef;
}