import React, { useState, useEffect } from 'react';
import Recording from './Recording';

function Question() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});  // 빈 객체로 초기화
  const [answers, setAnswers] = useState({});

  useEffect(() => {
      const fetchQuestions = async () => {
          try {
              const response = await fetch('http://localhost:8000/start');
              if (!response.ok) {
                  throw new Error('Failed to fetch questions');
              }
              const data = await response.json();
              setQuestions(data.questions);
              
              // answers 초기화 (모든 답변을 null로 초기화)
              const initialAnswers = {};
              data.questions.forEach(question => {
                  const answerKey = question.key.replace('Q', 'A');
                  initialAnswers[answerKey] = null;
              });
              setAnswers(initialAnswers);

              setLoading(false);
          } catch (error) {
              console.error('Error fetching questions:', error);
              setLoading(false);
          }
      };

      fetchQuestions();
  }, []);

  // score나 answer가 업데이트될 때마다 로그 출력
  useEffect(() => {
      if (Object.keys(scores).length > 0) {
          const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
          console.log('현재 점수:', scores);
          console.log('현재 답변:', answers);
          console.log(`총점: ${totalScore}점`);
      }
  }, [scores, answers]);

  const handleNext = () => {
      const currentQuestion = questions[currentIndex];
      const currentScore = scores[currentQuestion?.key];

      if (currentIndex < questions.length - 1 && currentQuestion?.key === 'Q5-1' && currentScore === 0) {
          const nextIndex = questions.findIndex(q => q.key === 'Q6-1');
          if (nextIndex !== -1) {
              setScores(prev => ({
                  ...prev,
                  'Q5-2': 0
              }));
              setAnswers(prev => ({
                  ...prev,
                  'A5-2': null
              }));
              setCurrentIndex(nextIndex);
          }
      } else if (currentIndex < questions.length - 1) {
          setCurrentIndex(prevIndex => prevIndex + 1);
      }
  };

  const handleScoreUpdate = (questionNumber, score) => {
      setScores(prev => ({
          ...prev,
          [questionNumber]: score
      }));
  };

  const handleAnswerUpdate = (questionNumber, answer) => {
      const answerKey = questionNumber.replace('Q', 'A');
      setAnswers(prev => ({
          ...prev,
          [answerKey]: answer
      }));
  };

  const getCurrentQuestion = () => {
      if (questions.length === 0) return '';
      return questions[currentIndex]?.value || '';
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
  // 현재 문제의 점수가 실제로 설정되었는지 확인
  const hasCurrentScore = currentQuestionKey in scores;

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
                          onAnswerUpdate={handleAnswerUpdate}
                      />
                      
                      {hasCurrentScore && (
                          <button 
                              onClick={handleNext}
                              className={`el_btn el_btnL ${
                                  currentIndex === questions.length - 1 
                                      ? 'el_btn__blue' 
                                      : 'el_btn__black'
                              } hp_mt10 hp_wd100`}
                          >
                              {currentIndex === questions.length - 1 ? '완료' : '다음'}
                          </button>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );
}

export default Question;