export function floatTo16BitPCM(float32Array) {
    const pm16 = new Int16Array(float32Array.length);
    
    for(let i = 0; i < float32Array.length; i++) {
        pm16[i] = Math.max(-1, Math.min(1, float32Array[i]) * 0x7FFF);
    }

    return pm16.buffer;
}