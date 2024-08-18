import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Question() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioSrc, setAudioSrc] = useState('');
  const [randomWords, setRandomWords] = useState(''); // 무작위 단어를 문자열로 저장
  const [wordAudioSrcs, setWordAudioSrcs] = useState({}); // 단어별 오디오 URL을 저장
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // 현재 단어 오디오 인덱스
  const [randomImageWord, setRandomImageWord] = useState(''); // 무작위 이미지 단어 저장
  const [imageSrc, setImageSrc] = useState(''); // 이미지 URL을 저장
  const [randomSentence, setRandomSentence] = useState(''); // 무작위 문장 저장
  const [sentenceAudioSrcs, setSentenceAudioSrcs] = useState([]); // 문장 오디오 URL 배열
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0); // 현재 문장 오디오 인덱스
  const audioRef = useRef(null);  // 오디오 요소에 대한 참조
  const navigate = useNavigate();  // 페이지 전환을 위한 useNavigate 훅

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('http://localhost:8000/questions');
        const data = await response.json();
        setQuestions(data);

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
            
            // 이미지 파일 요청
            const imageResponse = await fetch(`http://localhost:8000/image/${imageKey}`);
            if (imageResponse.ok) {
              const imageURL = URL.createObjectURL(await imageResponse.blob());
              setImageSrc(imageURL);
            } else {
              console.error('이미지 파일을 가져오는 중 오류 발생:', imageResponse.statusText);
            }
          } else {
            console.error('랜덤 이미지 단어를 가져오는 중 오류 발생:', response.statusText);
          }
        } catch (error) {
          console.error('랜덤 이미지 단어를 가져오는 중 오류 발생:', error);
        }
      }

      fetchRandomImageWord();
    } else {
      setRandomImageWord(''); // Q3이 아닌 경우 무작위 이미지 단어를 비웁니다.
      setImageSrc(''); // 이미지 URL을 비웁니다.
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex].key === 'Q4') {
      async function fetchRandomSentence() {
        try {
          const response = await fetch('http://localhost:8000/random-sentence');
          if (response.ok) {
            const data = await response.json();
            setRandomSentence(data.value); // API 응답의 문장을 상태에 저장

            // 문장에 해당하는 오디오 파일 요청
            const audioResponse = await fetch(`http://localhost:8000/audio/sentence/${data.key}`);
            if (audioResponse.ok) {
              const audioURL = URL.createObjectURL(await audioResponse.blob());
              setSentenceAudioSrcs([audioURL]); // 단일 문장 오디오 URL을 배열에 저장
              setCurrentSentenceIndex(0);
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
      setRandomSentence(''); // Q4가 아닌 경우 문장을 비웁니다.
      setSentenceAudioSrcs([]); // 문장 오디오 URL 배열을 비웁니다.
      setCurrentSentenceIndex(0);
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
      setCurrentIndex(newIndex);
      localStorage.setItem('currentIndex', newIndex);
      fetchAudio(questions[newIndex].key);
    } else {
      localStorage.removeItem('currentIndex');
      navigate('/complete');
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
            {currentIndex < questions.length && questions[currentIndex].key === 'Q1' && (
              <div className="random-words">
                <h3>랜덤 단어: {randomWords}</h3>
              </div>
            )}
            {currentIndex < questions.length && questions[currentIndex].key === 'Q3' && (
              <div className="random-image-word">
                <h3>랜덤 이미지: {randomImageWord}</h3>
                {imageSrc && <img src={imageSrc} alt={randomImageWord} />}
              </div>
            )}
            {currentIndex < questions.length && questions[currentIndex].key === 'Q4' && (
              <div className="random-sentence">
                <h3>랜덤 문장: {randomSentence}</h3>
              </div>
            )}
            <button onClick={handleNextQuestion}>
              {currentIndex < questions.length - 1 ? '다음 질문' : '완료'}
            </button>
          </div>
        ) : (
          <p>질문을 불러오는 중입니다...</p>
        )}
      </div>
    </div>
  );
}

export default Question;
