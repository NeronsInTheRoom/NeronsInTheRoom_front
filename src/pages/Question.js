import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Recording from './Recording';

function Question() {
    const [questions, setQuestions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({});  
    const [answers, setAnswers] = useState({});
    const [Q4Attempts, setQ4Attempts] = useState(0);  
    const [Q4AllScores, setQ4AllScores] = useState([]); 
    const [failedIndices, setFailedIndices] = useState([]); 
    const [Q7AllScores, setQ7AllScores] = useState([]);
    const location = useLocation();
    const { birthDate, place} = location.state || {};
    console.log("birthDate",birthDate)
    console.log("place",place)
    console.log("failedIndices", failedIndices)

    
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('http://localhost:8000/start');
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                const data = await response.json();
                setQuestions(data.questions);
                setCorrectAnswer(data.answers);
            
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
    
        if (currentIndex < questions.length - 1) {
            if (currentQuestion?.key === 'Q5' && currentScore === 0) {
                const nextIndex = questions.findIndex(q => q.key === 'Q6');
                if (nextIndex !== -1) {
                    setScores(prev => ({
                        ...prev,
                        'Q5-1': 0
                    }));
                    setAnswers(prev => ({
                        ...prev,
                        'A5-1': null
                    }));
                    setCurrentIndex(nextIndex);
                }
            }
            else if (currentQuestion?.key === 'Q6' && currentScore === 0) {
                const nextIndex = questions.findIndex(q => q.key === 'Q7');
                if (nextIndex !== -1) {
                    setScores(prev => ({
                        ...prev,
                        'Q6-1': 0
                    }));
                    setAnswers(prev => ({
                        ...prev,
                        'A6-1': null
                    }));
                    setCurrentIndex(nextIndex);
                }
            }
            else if (currentQuestion?.key === 'Q7') {
                const lastQ7Scores = Q7AllScores[Q7AllScores.length - 1];
                if (lastQ7Scores) {
                    // 모든 점수가 1이면 바로 Q8로
                    if (lastQ7Scores.every(score => score === 1)) {
                        const q8Index = questions.findIndex(q => q.key === 'Q8');
                        setCurrentIndex(q8Index !== -1 ? q8Index : currentIndex + 1);
                        return;
                    }
    
                    // 첫 번째 0점인 문제만 진행하고 나머지는 건너뛰기
                    const firstZeroIndex = lastQ7Scores.findIndex(score => score === 0);
                    if (firstZeroIndex !== -1) {
                        const nextQuestionKey = `Q7-${firstZeroIndex + 1}`;
                        const nextQuestionIndex = questions.findIndex(q => q.key === nextQuestionKey);
                        if (nextQuestionIndex !== -1) {
                            setCurrentIndex(nextQuestionIndex);
                        } else {
                            const q8Index = questions.findIndex(q => q.key === 'Q8');
                            setCurrentIndex(q8Index !== -1 ? q8Index : currentIndex + 1);
                        }
                    } else {
                        const q8Index = questions.findIndex(q => q.key === 'Q8');
                        setCurrentIndex(q8Index !== -1 ? q8Index : currentIndex + 1);
                    }
                } else {
                    setCurrentIndex(currentIndex + 1);
                }
            }
            else if (currentQuestion?.key.startsWith('Q7-')) {
                // Q7-n 문제가 끝나면 바로 Q8로
                const q8Index = questions.findIndex(q => q.key === 'Q8');
                if (q8Index !== -1) {
                    setCurrentIndex(q8Index);
                }
            }
            else {
                setCurrentIndex(prevIndex => prevIndex + 1);
            }
        }
    };

    const handleScoreUpdate = (questionNumber, score) => {
        if (questionNumber === 'Q4') {
        // Q4인 경우의 특별 처리
            const scores = Array.isArray(score) ? score : [score];
        
        // 첫 번째 시도인 경우, 점수 합계를 저장
        if (Q4Attempts === 0) {
            const totalScore = scores.reduce((sum, s) => sum + s, 0);
            setScores(prev => ({
            ...prev,
            [questionNumber]: totalScore
            }));
        }

        // 모든 시도의 점수 저장
        setQ4AllScores(prev => [...prev, scores]);

        // 실패한 인덱스 추적
        const currentFails = scores.map((s, idx) => s === 0 ? idx : -1).filter(idx => idx !== -1);
        if (Q4Attempts === 0) {
            setFailedIndices(currentFails);
        } else {
            // 이전에도 실패했고 이번에도 실패한 인덱스만 유지
            setFailedIndices(prev => prev.filter(idx => currentFails.includes(idx)));
        }

        // 시도 횟수 증가
        setQ4Attempts(prev => prev + 1);
        } 
        else if (questionNumber === 'Q7') {
            const scores = Array.isArray(score) ? score : [score];
            setQ7AllScores(prev => [...prev, scores]);
        
            // 1. 점수 계산 및 건너뛰기 처리 (failedIndices 상관없이)
            let totalScore = 0;
            scores.forEach((s, index) => {
                if (s === 1) {
                    totalScore += 2;  // 1인 경우 2점으로 계산
                    setScores(prev => ({
                        ...prev,
                        [`Q7-${index + 1}`]: 0  // 건너뛸 문제는 0점 처리
                    }));
                }
            });
        
            // 2. 최대 3점으로 제한
            totalScore = Math.min(totalScore, 3);
        
            // 3. 마지막에 failedIndices 체크하여 최종 점수만 수정
            if (failedIndices.some(index => scores[index] === 1)) {
                totalScore = 0;  // 점수만 0점 처리
            }
            
            setScores(prev => ({
                ...prev,
                'Q7': totalScore
            }));
        }
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
    const currentCorrectAnswer = correctAnswer.find(answer => answer.key === currentQuestionKey)?.value || '';

    // 현재 문제의 점수가 실제로 설정되었는지 확인
    // hasCurrentScore 로직 수정
    const hasCurrentScore = (currentQuestionKey) => {
        if (currentQuestionKey === 'Q4') {
        // Q4의 경우
        if (Q4Attempts === 0) return false; // 첫 시도 전

        const lastAttemptScores = Q4AllScores[Q4AllScores.length - 1];
        const hasZero = lastAttemptScores.some(score => score === 0);

        if (Q4Attempts < 3) {
            // 3번째 시도 전에는 모든 점수가 1이어야 활성화
            return !hasZero;
        } else {
            // 3번째 시도에서는 무조건 활성화
            return true;
        }
        }

        // 다른 문제들은 기존 로직 사용
        return currentQuestionKey in scores;
    };

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
                            correctAnswer={currentCorrectAnswer}
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