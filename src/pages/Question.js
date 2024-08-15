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
      if (q2Data) {
        setMonth(q2Data.month);
        setWeekday(q2Data.weekday);
      }

      setAnswer([
        { key: 'Q1', value: result.selected_words.join(", ") },
        { key: 'Q2', value: `${q2Data.month}, ${q2Data.weekday}` },
        { key: 'Q4', value: result.selected_sentence }
      ]);
      console.log(answer)
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

      // Fetch random image if the question key is Q3
      if (data[index].key === 'Q3') {
        const imageResponse = await fetch('http://localhost:8000/random-image');
        if (!imageResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const imageBlob = await imageResponse.blob();
        setImageUrl(URL.createObjectURL(imageBlob));
      } else {
        setImageUrl('');
      }
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
    setImageUrl('');
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

      {imageUrl && (
        <div>
          <h3>Random Image:</h3>
          <img src={imageUrl} alt="Random" style={{ maxWidth: '100%', maxHeight: '500px' }} />
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
