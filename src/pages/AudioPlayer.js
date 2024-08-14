import React, { useState } from 'react';

const AudioPlayer = () => {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);  // 요청 시작 시 로딩 상태로 설정

    try {
      // TTS 요청을 서버로 보내기
      const response = await fetch('http://localhost:8000/ttsmodule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          filename: filename
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 파일 경로 설정 (요청 완료 후 URL 업데이트)
      const audioFileUrl = `http://localhost:8000/audio/${filename}.wav`;
      setAudioUrl(audioFileUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);  // 요청이 끝나면 로딩 상태 해제
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Text:
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Filename:
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Audio'}
        </button>
      </form>

      {audioUrl && (
        <div>
          <h3>Generated Audio:</h3>
          <audio controls autoPlay>
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
