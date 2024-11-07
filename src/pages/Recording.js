import React, { useState, useRef } from 'react';

// props로 questionNumber와 onScoreUpdate를 받음
function Recording({ 
    questionNumber,
    correctAnswer,
    onScoreUpdate,
    onAnswerUpdate,
    birthDate,
    place,
    imageName,
    onAsyncCorrectAnswer,
    onStartRecording,  // 녹음 시작 시 호출될 함수
    onIsTrue
}) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // WAV 파일 생성을 위한 유틸리티 함수
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

    // 녹음 시작 및 중지 함수
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

                // 녹음이 시작될 때 부모 컴포넌트의 타이머 해제 함수 호출
                onStartRecording && onStartRecording();  
                
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
            formData.append('correctAnswer', correctAnswer);
    
            // 조건에 따라 추가 데이터를 formData에 추가
            if (questionNumber === 'Q1' && birthDate) {
                formData.append('birth_date', birthDate);
            } else if ((questionNumber === 'Q3' || questionNumber === 'Q3-1') && place) {
                formData.append('place', place);
            }
            if (questionNumber === 'Q8' && imageName) {
                formData.append('image_name', imageName);
            }
    
            const response = await fetch(`http://localhost:8000/${questionNumber}`, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            
            // score가 배열인 경우와 단일 값인 경우를 모두 처리
            const score = Array.isArray(data.score) 
                ? data.score.map(s => parseInt(s, 10))  
                : parseInt(data.score, 10);             
            
            onScoreUpdate(questionNumber, score);
            onAnswerUpdate(questionNumber, data.answer);
            const specificQuestions = ['Q1', 'Q2', 'Q3', 'Q3-1'];
            if (specificQuestions.includes(questionNumber)) {
                onAsyncCorrectAnswer(questionNumber, data.correctAnswer);
            }
            // Q8 이미지 정답 y/n 반환
            if (questionNumber === 'Q8') {
                // console.log(`Q8 정답 여부: ${data.isTrue}`);
                // console.log(`데이터 내용: ${JSON.stringify(data)}`);
                onIsTrue(data.isTrue)
            }

        } catch (error) {
            console.error('서버 전송 오류:', error);
        }
    };

    return (
        <button
            onClick={toggleRecording}
            className={`el_btn el_btnL ${isRecording ? 'el_btn__black' : 'el_btn__black'} hp_wd100`}
        >
            {isRecording ? '녹음 완료' : '녹음 시작'}
        </button>
    );
}

export default Recording;