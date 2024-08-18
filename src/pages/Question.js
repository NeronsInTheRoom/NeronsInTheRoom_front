import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Recorder from 'recorder-js';

function Question() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioSrc, setAudioSrc] = useState('');
  const [randomWords, setRandomWords] = useState('');
  const [wordAudioSrcs, setWordAudioSrcs] = useState({});
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [randomImageWord, setRandomImageWord] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [randomSentence, setRandomSentence] = useState('');
  const [sentenceAudioSrcs, setSentenceAudioSrcs] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [answer, setAnswer] = useState({ Q1: '', Q2: '', Q3: '', Q4: '' }); // Q2 추가
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const audioContextRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('http://localhost:8000/questions');
        const data = await response.json();
        setQuestions(data);
        setData(data);  // Ensure `data` is set

        const savedIndex = localStorage.getItem('currentIndex');
        if (data.length > 0) {
          localStorage.removeItem('currentIndex');
          setCurrentIndex(0);
          fetchAudio(data[0].key);
        }
      } catch (error) {
        console.error('질문 데이터를 가져오는 중 오류 발생:', error);
      }
    }

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('오디오 재생 오류:', error);
      });
    }
  }, [audioSrc]);

  useEffect(() => {
    const handleEnded = () => {
      if (questions[currentIndex].key === 'Q1') {
        if (currentWordIndex < Object.keys(wordAudioSrcs).length) {
          const nextKey = Object.keys(wordAudioSrcs)[currentWordIndex];
          const nextAudioURL = wordAudioSrcs[nextKey];
          setAudioSrc(nextAudioURL);
          setCurrentWordIndex(prevIndex => prevIndex + 1);
        }
      } else if (questions[currentIndex].key === 'Q4') {
        if (currentSentenceIndex < sentenceAudioSrcs.length) {
          const nextAudioURL = sentenceAudioSrcs[currentSentenceIndex];
          setAudioSrc(nextAudioURL);
          setCurrentSentenceIndex(prevIndex => prevIndex + 1);
        }
      }
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('ended', handleEnded);
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentWordIndex, wordAudioSrcs, currentSentenceIndex, sentenceAudioSrcs, questions, currentIndex]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex].key === 'Q1') {
      async function fetchRandomWords() {
        try {
          const response = await fetch('http://localhost:8000/random-words');
          if (response.ok) {
            const data = await response.json();
            const wordsArray = Object.entries(data);
            const translations = wordsArray.map(([key, translation]) => translation).join(', ');
            setRandomWords(translations);

            const audioUrls = {};
            for (const [key] of wordsArray) {
              const audioResponse = await fetch(`http://localhost:8000/audio/word/${key}`);
              if (audioResponse.ok) {
                const audioURL = URL.createObjectURL(await audioResponse.blob());
                audioUrls[key] = audioURL;
              } else {
                console.error(`단어 ${key}의 오디오 파일을 가져오는 중 오류 발생:`, audioResponse.statusText);
              }
            }
            setWordAudioSrcs(audioUrls);
            setCurrentWordIndex(0);

            // Q1의 value를 저장
            setAnswer(prevAnswer => ({ ...prevAnswer, Q1: translations }));
          } else {
            console.error('랜덤 단어를 가져오는 중 오류 발생:', response.statusText);
          }
        } catch (error) {
          console.error('랜덤 단어를 가져오는 중 오류 발생:', error);
        }
      }

      fetchRandomWords();
    } else {
      setRandomWords('');
      setWordAudioSrcs({});
      setCurrentWordIndex(0);
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex].key === 'Q3') {
      async function fetchRandomImageWord() {
        try {
          const response = await fetch('http://localhost:8000/random-image-word');
          if (response.ok) {
            const data = await response.json();
            const imageKey = Object.keys(data)[0];
            setRandomImageWord(data[imageKey]);

            const imageResponse = await fetch(`http://localhost:8000/image/${imageKey}`);
            if (imageResponse.ok) {
              const imageURL = URL.createObjectURL(await imageResponse.blob());
              setImageSrc(imageURL);
            } else {
              console.error('이미지 파일을 가져오는 중 오류 발생:', imageResponse.statusText);
            }

            // Q3의 value를 저장
            setAnswer(prevAnswer => ({ ...prevAnswer, Q3: data[imageKey] }));
          } else {
            console.error('랜덤 이미지 단어를 가져오는 중 오류 발생:', response.statusText);
          }
        } catch (error) {
          console.error('랜덤 이미지 단어를 가져오는 중 오류 발생:', error);
        }
      }

      fetchRandomImageWord();
    } else {
      setRandomImageWord('');
      setImageSrc('');
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex].key === 'Q4') {
      async function fetchRandomSentence() {
        try {
          const response = await fetch('http://localhost:8000/random-sentence');
          if (response.ok) {
            const data = await response.json();
            setRandomSentence(data.value);

            const audioResponse = await fetch(`http://localhost:8000/audio/sentence/${data.key}`);
            if (audioResponse.ok) {
              const audioURL = URL.createObjectURL(await audioResponse.blob());
              setSentenceAudioSrcs([audioURL]);
              setCurrentSentenceIndex(0);

              // Q4의 value를 저장
              setAnswer(prevAnswer => ({ ...prevAnswer, Q4: data.value }));
            } else {
              console.error('문장 오디오 파일을 가져오는 중 오류 발생:', audioResponse.statusText);
            }
          } else {
            console.error('랜덤 문장을 가져오는 중 오류 발생:', response.statusText);
          }
        } catch (error) {
          console.error('랜덤 문장을 가져오는 중 오류 발생:', error);
        }
      }

      fetchRandomSentence();
    } else {
      setRandomSentence('');
      setSentenceAudioSrcs([]);
      setCurrentSentenceIndex(0);
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex].key === 'Q2') {
      // 오늘 날짜 기준으로 달과 요일 계산
      const today = new Date();
      const month = today.toLocaleString('default', { month: 'long' }); // 월 이름
      const day = today.toLocaleDateString('ko-KR', { weekday: 'long' }); // 요일 이름
      const dateValue = `${month}, ${day}`;

      // Q2의 value를 저장
      setAnswer(prevAnswer => ({ ...prevAnswer, Q2: dateValue }));
    }
  }, [currentIndex, questions]);

  const fetchAudio = async (key) => {
    try {
      const audioResponse = await fetch(`http://localhost:8000/audio/${key}`);
      if (audioResponse.ok) {
        const audioURL = URL.createObjectURL(await audioResponse.blob());
        setAudioSrc(audioURL);
      } else {
        console.error('오디오 파일을 가져오는 중 오류 발생:', audioResponse.statusText);
      }
    } catch (error) {
      console.error('오디오 파일을 가져오는 중 오류 발생:', error);
    }
  };

  const handleNextQuestion = () => {
    const newIndex = currentIndex + 1;
    if (newIndex < questions.length) {
      setAudioUrl('');
      setCurrentIndex(newIndex);
      localStorage.setItem('currentIndex', newIndex);
      fetchAudio(questions[newIndex].key);
    } else {
      localStorage.removeItem('currentIndex');
      const total_score = totalScore / 4; // 4번의 질문 평균 계산
      navigate('/complete', { state: total_score });
      setTotalScore(0); // 점수 초기화
    }
  };

  // Start recording
  const startRecording = async () => {
    setIsRecording(true);
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = audioContextRef.current;
    const rec = new Recorder(audioContext);

    rec.init(stream).then(() => {
      setRecorder(rec);
      rec.start();
    }).catch((error) => {
      console.error("Error initializing recorder:", error);
      setIsRecording(false);
    });
  };

  // Stop recording and send to server
  const stopRecording = async () => {
    if (recorder) {
      setIsRecording(false);
      try {
        const { blob } = await recorder.stop();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        await sendAudioToServer(blob);  // Ensure async handling
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  };

  // Send audio file and answer to the server
  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    const question = questions[currentIndex];  // Use `questions` array instead of `data`
    
    if (!question) {
      console.error('Current question is undefined');
      return;
    }

    const value = answer[question.key] || '';  // Fetch value based on question key

    formData.append("file", audioBlob, `${question.key}.wav`);
    formData.append("answer", value);

    try {
      const response = await fetch(`http://localhost:8000/${question.key}`, {
        method: "POST",
        body: formData,
        mode: 'cors',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const score = data.score; 
        const numericScore = parseFloat(score) || 0;
        setTotalScore(totalScore + numericScore); 
        console.log("File uploaded successfully");
        console.log("Server response:", data);
      } else {
        console.error("Failed to upload file");
        const errorData = await response.json();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="ly_all hp_padding20 hp_pt80">
      <div className="ly_wrap">
        {questions.length > 0 ? (
          <div>
            <div className="question-text">
              {questions[currentIndex].value}
            </div>
            {audioSrc && (
              <audio ref={audioRef} controls src={audioSrc}>
                Your browser does not support the audio element.
              </audio>
            )}
            {/* {currentIndex < questions.length && questions[currentIndex].key === 'Q1' && (
              <div className="random-words">
                <h3>랜덤 단어: {randomWords}</h3>
              </div>
            )} */}
            {currentIndex < questions.length && questions[currentIndex].key === 'Q3' && (
              <div className="random-image-word">
                {/* <h3>랜덤 이미지: {randomImageWord}</h3> */}
                {imageSrc && <img src={imageSrc} alt={randomImageWord} />}
              </div>
            )}
            {/* {currentIndex < questions.length && questions[currentIndex].key === 'Q4' && (
              <div className="random-sentence">
                <h3>랜덤 문장: {randomSentence}</h3>
              </div>
            )} */}
            <button onClick={handleNextQuestion}>
              {currentIndex < questions.length - 1 ? '다음 질문' : '완료'}
            </button>
            {currentIndex === questions.length - 1 && (
              <div className="answer-summary">
                <p><strong>Q1:</strong> {answer.Q1}</p>
                <p><strong>Q2:</strong> {answer.Q2}</p>
                <p><strong>Q3:</strong> {answer.Q3}</p>
                <p><strong>Q4:</strong> {answer.Q4}</p>
              </div>
            )}
            <div>
              <button onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "녹음 중지" : "녹음 시작"}
              </button>
            </div>
            <div>{`점수: ${totalScore}`}</div>
          </div>
        ) : (
          <p>질문을 불러오는 중입니다...</p>
        )}
      </div>
    </div>
  );
}

export default Question;
