import React, { useState, useRef } from 'react';

function Test() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcribedText, setTranscribedText] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const createMonoWavBlob = (audioData, sampleRate = 48000) => {
        const buffer = new ArrayBuffer(44 + audioData.length * 2);
        const view = new DataView(buffer);
        
        // WAV 헤더 작성
        writeString(view, 0, 'RIFF');                     // RIFF 식별자
        view.setUint32(4, 36 + audioData.length * 2, true); // 파일 크기
        writeString(view, 8, 'WAVE');                     // WAVE 식별자
        writeString(view, 12, 'fmt ');                    // fmt 청크
        view.setUint32(16, 16, true);                    // fmt 청크 크기
        view.setUint16(20, 1, true);                     // 오디오 포맷 (1 = PCM)
        view.setUint16(22, 1, true);                     // 채널 수 (1 = mono)
        view.setUint32(24, sampleRate, true);            // 샘플링 레이트
        view.setUint32(28, sampleRate * 2, true);        // 바이트 레이트
        view.setUint16(32, 2, true);                     // 블록 얼라인
        view.setUint16(34, 16, true);                    // 비트 퍼 샘플
        writeString(view, 36, 'data');                   // data 청크
        view.setUint32(40, audioData.length * 2, true);  // data 청크 크기

        // 오디오 데이터 작성
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

                        // 모든 오디오 데이터를 하나의 배열로 합치기
                        const mergedData = new Float32Array(
                            audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
                        );
                        let offset = 0;
                        audioChunksRef.current.forEach(chunk => {
                            mergedData.set(chunk, offset);
                            offset += chunk.length;
                        });

                        // WAV 파일 생성
                        const wavBlob = createMonoWavBlob(mergedData, 48000);
                        const audioUrl = URL.createObjectURL(wavBlob);
                        setAudioUrl(audioUrl);

                        // 서버로 전송
                        sendAudioToServer(wavBlob);
                    }
                };

                setIsRecording(true);
                setAudioUrl(null);
                setTranscribedText('');

            } catch (error) {
                console.error('마이크 접근 오류:', error);
            }
        }
    };

    const sendAudioToServer = async (audioBlob) => {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');

            console.log('Sending audio file:', {
                'File size': audioBlob.size + ' bytes',
                'File type': audioBlob.type
            });

            const response = await fetch('http://localhost:8000/Q5', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Server response:', data);
            setTranscribedText(data.text);
        } catch (error) {
            console.error('서버 전송 오류:', error);
            setTranscribedText('음성 변환 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="flex flex-col items-center p-6 space-y-6">
            <button
                onClick={toggleRecording}
                className={`
                    px-6 py-3 rounded-full text-white font-bold text-lg
                    transition-all duration-300 transform hover:scale-105
                    ${isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }
                `}
            >
                {isRecording ? '녹음 중지' : '녹음 시작'}
            </button>

            {isRecording && (
                <div className="text-red-500 font-bold animate-pulse">
                    녹음 중...
                </div>
            )}

            {audioUrl && (
                <div className="w-full max-w-md">
                    <audio 
                        src={audioUrl} 
                        controls 
                        className="w-full mt-4"
                    />
                </div>
            )}

            {transcribedText && (
                <div className="w-full max-w-md bg-gray-100 rounded-lg p-4 shadow-md">
                    <h3 className="font-bold text-lg mb-2">변환된 텍스트:</h3>
                    <p className="text-gray-700">{transcribedText}</p>
                </div>
            )}
        </div>
    );
}

export default Test;