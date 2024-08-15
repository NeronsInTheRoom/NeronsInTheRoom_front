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
        result.selected_words.join(", "),
        `${q2Data.month} ${q2Data.weekday}`,
        result.selected_sentence
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
    // Determine which text to use for audio generation
    const textToSpeak = (key === 'Q4' || key === 'Q1') && audio_text
      ? audio_text
      : data[index].value;

    // Set filename and loading state
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
      // Always use the value for text display
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
      fetchAudio(newIndex); // Fetch new audio and update text
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
        <p>{answer.join(", ")}</p>
      </div>
    </div>
  );
}

export default Question;
