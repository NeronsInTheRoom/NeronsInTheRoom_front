import React, { useState, useEffect } from 'react';
import Recording from './Recording';

function Question() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({});

    useEffect(() => {
      if (Object.keys(scores).length > 0) {
          const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
          console.log('현재 점수:', scores);  // 각 문제별 점수 현황
          console.log(`총점: ${totalScore}점`);  // 현재까지의 총점
      }
  }, [scores]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('http://localhost:8000/start');
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                const data = await response.json();
                setQuestions(data.questions);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching questions:', error);
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleNext = () => {
        const currentQuestion = questions[currentIndex];
        const currentScore = scores[currentQuestion?.key];

        if (currentIndex < questions.length - 1 && currentQuestion?.key === 'Q5-1' && currentScore === 0) {
            // Q5-1이 틀린 경우, Q5-2 자동으로 0점 처리하고 Q6-1로 이동
            const nextIndex = questions.findIndex(q => q.key === 'Q6-1');
            if (nextIndex !== -1) {
                setScores(prev => ({
                    ...prev,
                    'Q5-2': 0  // Q5-2 자동으로 0점 처리
                }));
                setCurrentIndex(nextIndex);
            }
        } else if (currentIndex < questions.length - 1 && currentScore !== undefined) {
            // 일반적인 경우 다음 문제로 이동
            setCurrentIndex(prevIndex => prevIndex + 1);
        }
    };

    const getCurrentQuestion = () => {
        if (questions.length === 0) return '';
        return questions[currentIndex]?.value || '';
    };

    const handleScoreUpdate = (questionNumber, score) => {
      setScores(prev => {
          const newScores = {
              ...prev,
              [questionNumber]: score
          };
          return newScores;
      });
  };

    if (loading) {
        return (
            <div className="ly_all">
                <div className="ly_wrap">
                    <p>질문을 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }

    const currentQuestionKey = questions[currentIndex]?.key;
    const hasCurrentScore = scores[currentQuestionKey] !== undefined;

    return (
        <div className="ly_all">
            <div className="ly_wrap">
                <div className="ly_fSpace ly_fdColumn hp_padding20 hp_pt80 hp_ht100">
                    <div>
                        <div className="el_question">
                            {getCurrentQuestion()}
                        </div>
                        <div className="random-image-word hp_mt30">
                            <img src="" alt="" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Recording 
                            questionNumber={currentQuestionKey}
                            onScoreUpdate={handleScoreUpdate}
                        />
                        
                        <button 
                        onClick={handleNext}
                        className={`el_btn el_btnL ${
                            hasCurrentScore 
                                ? (currentIndex === questions.length - 1 
                                    ? 'el_btn__blue' 
                                    : 'el_btn__black')  // 검은색에서 disable 스타일로 변경
                                : 'el_btn__disable'
                        } hp_mt10 hp_wd100`}
                        disabled={!hasCurrentScore}
                          >
                        {currentIndex === questions.length - 1 ? '완료' : '다음'}
                      </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Question;