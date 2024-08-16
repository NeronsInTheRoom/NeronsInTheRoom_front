import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Recorder from 'recorder-js';

function Question() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [month, setMonth] = useState('');
  const [weekday, setWeekday] = useState('');
  const [answer, setAnswer] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const audioContextRef = useRef(null);

  // Fetch the initial data from the backend
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/questions');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result.questions);
      setSelectedWords(result.selected_words);
      setText(result.questions[0].value); // Display the initial value
      setFilename(`${result.questions[0].key}.wav`);

      const q2Data = result.questions.find(q => q.key === 'Q2');
      const q3Data = result.questions.find(q => q.key === 'Q3');
      if (q2Data) {
        setMonth(q2Data.month);
        setWeekday(q2Data.weekday);
      }

      // Set the image URL if there is a selected image
      if (q3Data && q3Data.image_filename) {
        setImageUrl(`http://localhost:8000/image/${q3Data.image_filename}`);
      } else {
        setImageUrl('');
      }

      setAnswer([
        { key: 'Q1', value: result.selected_words.join(", ") },
        { key: 'Q2', value: `${q2Data.month}, ${q2Data.weekday}` },
        { key: 'Q3', value: q3Data ? result.image_name || '이미지 없음' : '이미지 없음' },
        { key: 'Q4', value: result.selected_sentence }
      ]);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      fetchAudio(currentIndex);
    }
  }, [currentIndex, data]);

  // Fetch audio file based on index
  const fetchAudio = async (index) => {
    const { key, audio_text } = data[index];
    const textToSpeak = (key === 'Q4' || key === 'Q1') && audio_text
      ? audio_text
      : data[index].value;

    const newFilename = `${key}.wav`;
    setFilename(newFilename);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/ttsmodule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: textToSpeak,
          filename: newFilename,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const audioFileUrl = `http://localhost:8000/audio/${newFilename}`;
      setAudioUrl(audioFileUrl);
      setText(data[index].value);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the "Next" button click
  const handleNext = () => {
    setAudioUrl('');
    setText('');
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % data.length;
      fetchAudio(newIndex);
      return newIndex;
    });
  };

  // Handle the "Complete" button click
  const handleComplete = () => {
    const averageScore = totalScore / 4; // 4번의 질문 평균 계산
    navigate('/complete', { state: averageScore });
    setTotalScore(0); // 점수 초기화
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
        sendAudioToServer(blob, currentIndex + 1);
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  };

  // Send audio file and answer to the server
  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    const questionKey = data[currentIndex].key;  // 현재 질문의 key 값

    const getValueForKey = (key) => {
      const foundItem = answer.find(item => item.key === key);
      return foundItem ? foundItem.value : null;
    };
    const value = getValueForKey(questionKey);

    formData.append("file", audioBlob, `${questionKey}.wav`);
    formData.append("answer", value);

    try {
      const response = await fetch(`http://localhost:8000/${questionKey}`, {
        method: "POST",
        body: formData,
        mode: 'cors',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const score = data.score; 
        setTotalScore(totalScore + score); 
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

  // Function to convert text with line breaks to HTML
  const formatText = (text) => {
    // Replace newline characters with <br />
    return text.replace(/\n/g, '<br />');
  };

  return (
    <div className="ly_all hp_padding20 hp_pt80">
      <div className="ly_wrap">
        <div className="el_question" dangerouslySetInnerHTML={{ __html: formatText(text) }}></div>

        {text === '사진 속 \n물체의 이름은 \n무엇인가요?' && imageUrl && (
          <img src={imageUrl} alt="Selected" style={{ width: '300px', height: 'auto' }} />
        )}

        {data.length > 0 ? (
          currentIndex < data.length - 1 ? (
            isLoading ? ('Loading...') :
              (<button onClick={handleNext} disabled={isLoading} className="el_btn el_btnL el_btn__blue hp_mt100 hp_wd100">다음</button>)
          ) : (
            isLoading ? ('Loading...') : (
              <button onClick={handleComplete} disabled={isLoading} className="el_btn el_btnL el_btn__blue hp_mt100 hp_wd100">완료</button>)
          )
        ) : (
          <p>Loading data...</p> // 데이터 로딩 중 표시할 메시지
        )}

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
        <ul>
          {answer.map((item) => (
            <li key={item.key}>{`${item.key}: ${item.value}`}</li>
          ))}
        </ul>
        <div>
          <button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? "녹음 중지" : "녹음 시작"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Question;
