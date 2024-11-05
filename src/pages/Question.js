import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Recording from './Recording';

function Question() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({});
    const [maxScores, setMaxScores] = useState([])  
    const [answers, setAnswers] = useState({});
    const [explanations, setExplanations] = useState([]);
    const [Q4Attempts, setQ4Attempts] = useState(0);  
    const [Q4AllScores, setQ4AllScores] = useState([]); 
    const [failedIndices, setFailedIndices] = useState([]); 
    const [Q7AllScores, setQ7AllScores] = useState([]);
    const [audioFiles, setAudioFiles] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [attemptedQuestions, setAttemptedQuestions] = useState([]);
    const location = useLocation();
    const { birthDate, place} = location.state || {};
    const [imageSrc, setImageSrc] = useState(null);
    const [imageCounter, setImageCounter] = useState(0);
    const imageNames = ['clock', 'key', 'stamp', 'pencil', 'coin'];
    const maxImages = imageNames.length;
    
    console.log("birthDate",birthDate)
    console.log("place",place)
    console.log("failedIndices", failedIndices)

    const currentQuestionKey = questions[currentIndex]?.key;
    const currentCorrectAnswer = correctAnswer.find(answer => answer.key === currentQuestionKey)?.value || '';

    // 동적 정답 함수
    const asyncCorrectAnswer = (questionKey, answer) => {
        setCorrectAnswer(prevCorrectAnswer => {
            const updatedAnswers = prevCorrectAnswer.map(item =>
                item.key === questionKey ? { ...item, value: answer } : item
            );
            
            // 만약 해당 questionKey가 존재하지 않으면 새 항목 추가
            if (!updatedAnswers.find(item => item.key === questionKey)) {
                updatedAnswers.push({ key: questionKey, value: answer });
            }

            return updatedAnswers;
        });
    };

    // 오디오 재생 함수
    const playAudio = async (audioUrl) => {
        return new Promise((resolve, reject) => {
            try {
                const audio = new Audio(audioUrl);
                audio.onended = resolve;
                audio.onerror = reject;
                audio.play().catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    };

    // 오디오 시퀀스 재생 함수
    const playAudioSequence = async (questionKey) => {
        if (isPlaying) return;
        
        setIsPlaying(true);
        console.log('Playing audio for:', questionKey);

        try {
            // 기본 질문 오디오 찾기
            const mainAudioFile = audioFiles.find(file => file.filename === `${questionKey}.wav`);
            
            if (mainAudioFile) {
                console.log('Playing main audio:', mainAudioFile.url);
                await playAudio(mainAudioFile.url);
            }

            // 특수 케이스 처리
            if (['Q4'].includes(questionKey)) {
                const additionalAudioFile = audioFiles.find(file => file.filename === 'D4.wav');
                if (additionalAudioFile) {
                    console.log('Playing D4 audio');
                    await playAudio(additionalAudioFile.url);
                }
            } else if (questionKey === 'Q6') {
                const additionalAudioFile = audioFiles.find(file => file.filename === 'D6.wav');
                if (additionalAudioFile) {
                    console.log('Playing D6 audio');
                    await playAudio(additionalAudioFile.url);
                }
            } else if (questionKey === 'Q6-1') {
                const additionalAudioFile = audioFiles.find(file => file.filename === 'D6-1.wav');
                if (additionalAudioFile) {
                    console.log('Playing D6-1 audio');
                    await playAudio(additionalAudioFile.url);
                }
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        } finally {
            setIsPlaying(false);
        }
    };

    // 현재 질문이 변경될 때마다 오디오 재생 및 attemptedQuestions 업데이트
    useEffect(() => {
        if (!questions[currentIndex]) return;
        
        const currentKey = questions[currentIndex].key;
        playAudioSequence(currentKey);

        // 현재 문제를 attemptedQuestions에 추가
        if (!attemptedQuestions.some(q => q.key === questions[currentIndex].key)) {
            setAttemptedQuestions(prev => [...prev, questions[currentIndex]]);
        }
    }, [currentIndex, audioFiles]);

    // 데이터 페칭
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('http://localhost:8000/start');
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                const data = await response.json();
                console.log('Fetched data:', data);  // 데이터 로깅
                setQuestions(data.questions);
                setCorrectAnswer(data.correctAnswer);
                setAudioFiles(data.audio_files);
                setExplanations(data.explanations);
                setMaxScores(data.maxScores)
            
                // answers 초기화
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

    useEffect(() => {
        if (questions[currentIndex]?.key === 'Q8' && imageCounter < maxImages) {
            fetchImage(imageNames[imageCounter]);
        } else {
            setImageSrc(null)
        }
    }, [questions, currentIndex, imageCounter]);

    const fetchImage = async (itemName) => {
        try {
            const res = await fetch(`http://localhost:8000/image/${itemName}`);
            // console.log(`이미지 경로 확인: ${res.url}`)
            if (!res.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setImageSrc(url);
        } catch (error) {
            console.error('Error fetching image:', error)
        }
    };

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

        if (currentIndex === questions.length - 1) {
            // 실제 진행된 문제들만 필터링
            const relevantAnswers = {};
            const relevantScores = {};
            const relevantCorrectAnswers = [];
            const relevantExplanations = [];
            const relevantMaxScores = [];

            attemptedQuestions.forEach((question) => {
                const answerKey = question.key.replace('Q', 'A');
                if (answers[answerKey] !== undefined) {
                    relevantAnswers[answerKey] = answers[answerKey];
                }
                if (scores[question.key] !== undefined) {
                    relevantScores[question.key] = scores[question.key];
                }
                const correctAns = correctAnswer.find(a => a.key === question.key);
                if (correctAns) {
                    relevantCorrectAnswers.push(correctAns);
                }
                const explanation = explanations.find(e => e.key === question.key);
                if (explanation) {
                    relevantExplanations.push(explanation);
                }
                const maxScore = maxScores.find(m => m.key === question.key);
                if (maxScore) {
                    relevantMaxScores.push(maxScore);
                }
            });

            navigate('/complete', {
                state: {
                    questions: attemptedQuestions,           // 제출된문제
                    answers: relevantAnswers,               // 사용자답변
                    correctAnswer: relevantCorrectAnswers,   // 정답
                    scores: relevantScores,                 // 사용자점수
                    explanations: relevantExplanations,     // 문제풀이
                    maxScores: relevantMaxScores,            // 문제별 총점
                }
            });
            return;
        }
    
        if (currentIndex < questions.length - 1) {
            // Q3 처리: 만약 Q3의 점수가 0점이라면 Q3-1로 이동, 아니면 건너뜀
            if (currentQuestion?.key === 'Q3' && currentScore === 0) {
                const nextIndex = questions.findIndex(q => q.key === 'Q3-1');
                if (nextIndex !== -1) {
                    setCurrentIndex(nextIndex);  // Q3-1로 이동
                }
                return;
            } else if (currentQuestion?.key === 'Q3' && currentScore === 2) {
                // 2점이면 Q3-1을 건너뜀
                const nextIndex = questions.findIndex(q => q.key === 'Q4');
                if (nextIndex !== -1) {
                    setCurrentIndex(nextIndex);  // 다음 질문으로 이동
                }
                return;
            }
            
            // Q5 처리
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
                return;
            }
            
            // Q6 처리
            if (currentQuestion?.key === 'Q6' && currentScore === 0) {
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
                return;
            }
            
            // handleNext 함수 내의 Q7 관련 부분 수정
            if (currentQuestion?.key === 'Q7') {
                const lastQ7Scores = Q7AllScores[Q7AllScores.length - 1];
                if (lastQ7Scores) {
                    // 모든 점수가 1이면 바로 Q8로
                    if (lastQ7Scores.every(score => score === 1)) {
                        // 각 1점당 2점으로 계산하고, failedIndices에 있는 인덱스는 0점 처리
                        let finalScore = lastQ7Scores.reduce((sum, score, index) => {
                            // failedIndices에 있는 인덱스는 0점 처리
                            if (failedIndices.includes(index)) {
                                return sum;
                            }
                            // 1점인 경우 2점으로 계산
                            return sum + (score === 1 ? 2 : 0);
                        }, 0);
                        
                        // 최대 3점으로 제한
                        finalScore = Math.min(finalScore, 3);
                        
                        setScores(prev => ({
                            ...prev,
                            'Q7': finalScore
                        }));
                        const q8Index = questions.findIndex(q => q.key === 'Q8');
                        setCurrentIndex(q8Index !== -1 ? q8Index : currentIndex + 1);
                        return;
                    }
            
                    // 틀린 문제들의 인덱스를 찾아서 하위 문제로 이동만 함 (failedIndices는 건드리지 않음)
                    const zeroScoreIndexes = lastQ7Scores.map((score, idx) => 
                        score === 0 ? idx : -1
                    ).filter(idx => idx !== -1);
            
                    if (zeroScoreIndexes.length > 0) {
                        const nextQuestionKey = `Q7-${zeroScoreIndexes[0] + 1}`;
                        const nextQuestionIndex = questions.findIndex(q => q.key === nextQuestionKey);
                        if (nextQuestionIndex !== -1) {
                            setCurrentIndex(nextQuestionIndex);
                        }
                    }
                }
                return;
            }

            // Q7 하위 문제들 처리
            if (currentQuestion?.key.startsWith('Q7-')) {
                const currentNum = parseInt(currentQuestion.key.split('-')[1]);
                const lastQ7Scores = Q7AllScores[Q7AllScores.length - 1];
                
                if (lastQ7Scores) {
                    // 다음 틀린 문제의 하위 문제로 이동
                    const nextFailedIndex = failedIndices.find(index => index + 1 > currentNum);
                    if (nextFailedIndex !== undefined) {
                        const nextQuestionKey = `Q7-${nextFailedIndex + 1}`;
                        const nextQuestionIndex = questions.findIndex(q => q.key === nextQuestionKey);
                        if (nextQuestionIndex !== -1) {
                            setCurrentIndex(nextQuestionIndex);
                            return;
                        }
                    }
                    
                    // 모든 하위 문제가 끝났을 때 최종 점수 계산
                    let totalScore = 0;
                    
                    // Q7 점수 계산 (1점당 2점으로 계산)
                    lastQ7Scores.forEach((score, index) => {
                        // failedIndices에 있는 인덱스는 0점 처리
                        if (!failedIndices.includes(index)) {
                            totalScore += (score === 1 ? 2 : 0);
                        }
                    });
                    
                    // 하위 문제들의 점수 합산
                    Object.entries(scores).forEach(([key, score]) => {
                        // Q7 하위문제인 경우에만 처리
                        if (key.startsWith('Q7-')) {
                            const subQuestionNum = parseInt(key.split('-')[1]); // 하위문제 번호
                            const correspondingIndex = subQuestionNum - 1; // 해당 인덱스
                            
                            // failedIndices에 해당 인덱스가 없는 경우에만 점수 합산
                            if (!failedIndices.includes(correspondingIndex)) {
                                totalScore += score;
                            }
                        }
                    });
                    
                    // 최대 3점으로 제한
                    totalScore = Math.min(totalScore, 3);
                    
                    // 최종 점수를 Q7에만 저장
                    setScores(prev => ({
                        ...prev,
                        'Q7': totalScore
                    }));
                    
                    // Q8로 이동
                    const q8Index = questions.findIndex(q => q.key === 'Q8');
                    setCurrentIndex(q8Index !== -1 ? q8Index : currentIndex + 1);
                }
                return;
            }

            // Q8 처리
            if (currentQuestion?.key === 'Q8') {
                if (imageCounter < maxImages - 1) {
                    setImageCounter(prevCounter => prevCounter + 1);
                } else {
                    setImageCounter(0);
                    const q8_1Index = questions.findIndex(q => q.key === 'Q8-1');
                    setCurrentIndex(q8_1Index !== -1 ? q8_1Index : currentIndex + 1);
                }
                return;
            }
    
            // 기본 처리: 다음 문제로 이동
            setCurrentIndex(prevIndex => prevIndex + 1);
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
        
        // handleScoreUpdate 함수의 Q7 관련 부분 수정
        else if (questionNumber === 'Q7') {
            const scores = Array.isArray(score) ? score : [score];
            setQ7AllScores(prev => [...prev, scores]);
            
            // 초기 점수는 저장하지 않음 (Q8로 넘어갈 때 최종 계산)
        }
        else if (questionNumber.startsWith('Q7-')) {
            // 하위 문제 점수 저장
            const singleScore = Array.isArray(score) ? score[0] : score;
            const currentNum = parseInt(questionNumber.split('-')[1]);
            const correspondingIndex = currentNum - 1; // Q7-1은 인덱스 0, Q7-2는 인덱스 1...
        
            // failedIndices에 해당 인덱스가 있으면 무조건 0점으로 저장
            if (failedIndices.includes(correspondingIndex)) {
                setScores(prev => ({
                    ...prev,
                    [questionNumber]: 0
                }));
            } else {
                setScores(prev => ({
                    ...prev,
                    [questionNumber]: singleScore
                }));
            }
        }
        else { 
            setScores(prev => ({
                ...prev,
                [questionNumber]: score
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

    // 현재 문제의 점수가 실제로 설정되었는지 확인
    // hasCurrentScore 로직 수정
    const hasCurrentScore = (currentQuestionKey) => {

        if (currentQuestionKey === 'Q4') {
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
        // Q7 처리 추가
        else if (currentQuestionKey === 'Q7') {
            return Q7AllScores.length > 0; // Q7 점수가 기록되어 있으면 true
        }
        // Q7 하위 문제 처리 추가
        else if (currentQuestionKey.startsWith('Q7-')) {
            return currentQuestionKey in scores;
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
                            {imageSrc && <img src={imageSrc} alt="Question Image" />}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Recording 
                            questionNumber={currentQuestionKey}
                            correctAnswer={currentCorrectAnswer}
                            onScoreUpdate={handleScoreUpdate}
                            onAnswerUpdate={handleAnswerUpdate}
                            birthDate={birthDate}
                            place={place}
                            imageName={imageNames[imageCounter]}
                            onAsyncCorrectAnswer={asyncCorrectAnswer}
                        />
                        
                        {hasCurrentScore(currentQuestionKey) && !isPlaying && (
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