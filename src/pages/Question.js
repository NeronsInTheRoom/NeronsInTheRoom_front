import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Question() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  // 데이터 배열 정의
  const data = [
    { "key": "Q1", "value": "오늘의 날씨는 어떤가요?" },
    { "key": "Q2", "value": "어제 저녁에 무엇을 먹었나요?" },
    // { "key": "Q3", "value": "가장 좋아하는 취미는 무엇인가요?" },
    // { "key": "Q4", "value": "여행을 가고 싶은 곳은 어디인가요?" },
    // { "key": "Q5", "value": "마지막으로 읽은 책은 무엇인가요?" }
  ];

  const fetchAudio = async (index) => {
    const { key, value } = data[index];
    setText(value);
    const newFilename = `${key}.wav`;
    setFilename(newFilename);
    setIsLoading(true); // 요청 시작 시 로딩 상태로 설정

    try {
      // 음성 생성 요청을 서버로 보내기
      const response = await fetch('http://localhost:8000/ttsmodule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: value,
          filename: newFilename
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 파일 경로 설정 (요청 완료 후 URL 업데이트)
      const audioFileUrl = `http://localhost:8000/audio/${newFilename}`;
      setAudioUrl(audioFileUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false); // 요청이 끝나면 로딩 상태 해제
    }
  };

  useEffect(() => {
    // 컴포넌트가 마운트되거나 currentIndex가 변경될 때 오디오 요청
    fetchAudio(currentIndex);
  }, [currentIndex]);

  const handleNext = () => {
    // 다음 항목으로 이동 (끝까지 갔으면 처음으로 돌아감)
    setAudioUrl(''); // 이전 오디오 파일을 제거
    setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
  };

  const handleComplete = () => {
    navigate('/complete'); // /complete 페이지로 이동
  };

  return (
    <div>
      <div>
        <h3>Current Text:</h3>
        <p>{text}</p>
      </div>
      {isLoading && <p>Generating audio...</p>}

      {audioUrl && !isLoading && (
        <div>
          <h3>Generated Audio:</h3>
          <audio key={audioUrl} controls autoPlay>
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {currentIndex < data.length - 1 ? (
        <button onClick={handleNext} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Next'}
        </button>
      ) : (
        <button onClick={handleComplete} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Complete'}
        </button>
      )}
    </div>
  );
}

export default Question;
