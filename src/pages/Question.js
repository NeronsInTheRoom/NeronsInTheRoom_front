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
      const response = await fetch('http://localhost:8000/questions', {
        mode: 'cors',
        credentials: 'include',
      });
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
    navigate('/complete');
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
      </div>
    </div>
  );
}

export default Question;
