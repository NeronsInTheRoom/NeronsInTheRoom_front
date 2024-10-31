import React, { useState, useRef } from 'react';

// props로 questionNumber와 onScoreUpdate를 받음
function Recording({ questionNumber, onScoreUpdate, onAnswerUpdate }) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const createMonoWavBlob = (audioData, sampleRate = 48000) => {
        const buffer = new ArrayBuffer(44 + audioData.length * 2);
        const view = new DataView(buffer);
        
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + audioData.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, audioData.length * 2, true);

        const length = audioData.length;
        let index = 44;
        for (let i = 0; i < length; i++) {
            view.setInt16(index, audioData[i] * 0x7FFF, true);
            index += 2;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    };

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true,
                    }
                });

                const audioContext = new AudioContext({ sampleRate: 48000 });
                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(4096, 1, 1);

                audioChunksRef.current = [];

                processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    audioChunksRef.current.push(new Float32Array(inputData));
                };

                source.connect(processor);
                processor.connect(audioContext.destination);

                mediaRecorderRef.current = {
                    stop: () => {
                        processor.disconnect();
                        source.disconnect();
                        stream.getTracks().forEach(track => track.stop());

                        const mergedData = new Float32Array(
                            audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
                        );
                        let offset = 0;
                        audioChunksRef.current.forEach(chunk => {
                            mergedData.set(chunk, offset);
                            offset += chunk.length;
                        });

                        const wavBlob = createMonoWavBlob(mergedData, 48000);
                        sendAudioToServer(wavBlob);
                    }
                };

                setIsRecording(true);

            } catch (error) {
                console.error('마이크 접근 오류:', error);
            }
        }
    };

    const sendAudioToServer = async (audioBlob) => {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');

            const response = await fetch(`http://localhost:8000/${questionNumber}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // score와 answer 모두 부모 컴포넌트로 전달
            onScoreUpdate(questionNumber, data.score);
            onAnswerUpdate(questionNumber, data.answer);
            console.log('Score:', data.score);
            console.log('Answer:', data.answer);

        } catch (error) {
            console.error('서버 전송 오류:', error);
        }
    };

    return (
        <button
            onClick={toggleRecording}
            className={`el_btn el_btnL ${
                isRecording ? 'el_btn__black' : 'el_btn__black'
            } hp_wd100`}
        >
            {isRecording ? '녹음 중지' : '녹음 시작'}
        </button>
    );
}

export default Recording;