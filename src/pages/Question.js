import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  // Fetch the initial data from the backend
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/questions');
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
      console.log(answer);
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
    navigate('/complete');
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

      {text === '사진 속 물체의 이름은 무엇인가요?' && imageUrl && (
        <div>
          <h3>Image:</h3>
          <img src={imageUrl} alt="Selected" style={{ width: '300px', height: 'auto' }} />
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

      <div>
        <h3>Answer:</h3>
        <ul>
          {answer.map((item) => (
            <li key={item.key}>{`${item.key}: ${item.value}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Question;
