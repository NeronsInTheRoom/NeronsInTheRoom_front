import React, { useState, useRef, useEffect } from 'react';

// const questions = [
//     "질문 1: 오늘의 날씨는 어떤가요?",
//     "질문 2: 어제 저녁에 무엇을 먹었나요?",
//     "질문 3: 가장 좋아하는 취미는 무엇인가요?",
//     "질문 4: 여행을 가고 싶은 곳은 어디인가요?",
//     "질문 5: 마지막으로 읽은 책은 무엇인가요?",
//     "질문 6: 오늘 기분이 어떤가요?",
//     "질문 7: 최근에 본 영화 중 가장 기억에 남는 것은 무엇인가요?",
//     "질문 8: 현재 가장 큰 목표는 무엇인가요?",
//     "질문 9: 가장 좋아하는 계절은 언제인가요? 그 이유는 무엇인가요?",
//     "질문 10: 오늘 하루 중 가장 즐거운 순간은 무엇이었나요?",
// ];

const StartAudio = () => {
    const [audioUrl, setAudioUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef(null);

    // // 질문을 랜덤으로 선택하는 함수
    // const getRandomQuestion = () => {
    //     const randomIndex = Math.floor(Math.random() * questions.length);
    //     return questions[randomIndex];
    // };

    // 음성 변환 요청 함수
    const synthesizeText = async () => {
        setIsLoading(true);
        try {
            const text = "다음 음성을 듣고 기억 후 시간안에 문제를 맞춰주세요.";
            const response = await fetch('http://localhost:8000/synthesize/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text, speed: 1.0 })
            });

            const data = await response.json();
            if (response.ok) {
                // 서버에서 반환된 음성 파일 경로를 사용하여 오디오 URL을 업데이트
                setAudioUrl(`http://localhost:8000${data.output_path}`);
            } else {
                console.error("TTS synthesis failed:", data.detail);
            }
        } catch (error) {
            console.error("Error fetching TTS API:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 오디오 URL이 업데이트되면 자동 재생 시도
    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.load();  // 오디오 파일 로드
            audioRef.current.play()   // 오디오 재생
                .catch(error => console.error("Error playing audio:", error));
        }
    }, [audioUrl]);

    return (
        <div className="App">
            <header className="App-header">
                <button onClick={synthesizeText} disabled={isLoading}>
                    시작하기
                </button>
                {audioUrl && (
                    <div>
                        <audio ref={audioRef} src={audioUrl} />
                    </div>
                )}
            </header>
        </div>
    );
}

export default StartAudio;