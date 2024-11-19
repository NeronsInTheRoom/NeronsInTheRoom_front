import React, { useState, useEffect, useRef } from 'react';
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
    const [firstQ4Answer, setFirstQ4Answer] = useState(null);  
    const [Q4AllScores, setQ4AllScores] = useState([]); 
    const [failedIndices, setFailedIndices] = useState([]); 
    const [Q7AllScores, setQ7AllScores] = useState([]);
    const [audioFiles, setAudioFiles] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [attemptedQuestions, setAttemptedQuestions] = useState([]);
    const location = useLocation();
    const { type, birthDate, place} = location.state || {};
    const [imageSrc, setImageSrc] = useState(null);
    const [imageCounter, setImageCounter] = useState(0);
    const imageNames = ['clock', 'key', 'stamp', 'pencil', 'coin'];
    const maxImages = imageNames.length;
    const [q8IsTrue, setQ8IsTrue] = useState({})
    const [answerVisible, setAnswerVisible] = useState(false); // Q8 답변 UI
    const [countdown, setCountdown] = useState(5); // 카운트다운 초기값 설정
    const [isRecording, setIsRecording] = useState(false); // 블록 표시 여부 관리

    console.log("type : ",type)
    console.log("birthDate",birthDate)
    console.log("place",place)
    console.log("failedIndices", failedIndices)

    useEffect(() => {
        // place 값이 유효한 경우에만 TTS 요청을 보냄
        if (place && !['병원', '집', ''].includes(place.trim())) {
            sendTTSRequest(place);
        }
    }, [place]);

    // Q3 카운트다운 로직
    useEffect(() => {
        let timer;
    
        const currentQuestion = questions[currentIndex];
    
        // Q3이고 음성이 재생 중이지 않을 때만 카운트다운 시작
        if (currentQuestion?.key === 'Q3' && !isPlaying) {
            setCountdown(5); // 카운트 초기화
            setIsRecording(false)
            timer = setInterval(() => {
                setCountdown((prevCount) => {
                    if (prevCount <= 1) {
                        clearInterval(timer); // 카운트가 끝나면 타이머 해제
                        return 0;
                    }
                    return prevCount - 1; // 1씩 감소
                });
            }, 1000);
        }
    
        // 타이머 해제
        return () => clearInterval(timer); // 컴포넌트 언마운트 시 또는 질문 변경 시 타이머 해제
    }, [currentIndex, questions, isPlaying]);

    const sendTTSRequest = async (place) => {
        try {
            const response = await fetch('http://localhost:8000/tts_Q3_2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    text: `${place}인가요?`,
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to send TTS request');
            }
    
            // 오디오 파일 URL을 반환받음
            const audioUrl = URL.createObjectURL(await response.blob());
            console.log('TTS Result:', audioUrl);

            // audioFiles에 추가
            setAudioFiles(prevFiles => [
                ...prevFiles,
                { filename: 'Q3-2.wav', url: audioUrl } // 파일 이름과 URL을 포함한 객체 추가
            ]);
            
            return audioUrl; // 오디오 URL 반환
        } catch (error) {
            console.error('Error sending TTS request:', error);
        }
    };

    // 타임아웃을 관리할 참조
    const questionTimeoutRef = useRef(null);

    const currentQuestionKey = questions[currentIndex]?.key;
    const currentCorrectAnswer = correctAnswer.find(answer => answer.key === currentQuestionKey)?.value || '';

    // 타이머 해제 함수
    const clearQuestionTimeout = () => {
        if (questionTimeoutRef.current) {
            clearTimeout(questionTimeoutRef.current);
            questionTimeoutRef.current = null;
        }
    };

    // 녹음 시작 시 타이머 해제
    const handleStartRecording = () => {
        clearQuestionTimeout();
        setIsRecording(true); // 블록 숨기기
    };
    
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

    // Q8 정답 여부 핸들
    const handleQ8IsTrue = (isTrue) => {
        // console.log(`handleQ8IsTrue 호출됨, 값: ${isTrue}`);
        setQ8IsTrue({isTrue})
    }

    // imageCounter가 업데이트될 때마다 playAudioSequence를 호출하도록 새로운 useEffect 추가
    useEffect(() => {
        // Q8이고 q8IsTrue.isTrue가 'n'일 때만 playAudioSequence 호출
        if (questions[currentIndex]?.key === 'Q8' && q8IsTrue?.isTrue === 'n') {
            playAudioSequence('Q8', true); // 이미지 변경 시 기본 오디오 제외
            console.log(`Q8 핸들러 값 확인: ${JSON.stringify(q8IsTrue)}`);
            setQ8IsTrue({}); // 상태초기화
        }
    
        // Q8일 때 answerVisible을 true로 설정하여 답변 표시
        if (questions[currentIndex]?.key === 'Q8') {
            setAnswerVisible(true); // Q8에 대해서만 답변 표시
            console.log("Q8 answerVisible set to true");
        } else {
            setAnswerVisible(false); // 다른 경우 답변 숨김
            console.log("Q8 answerVisible set to false");
        }
    }, [imageCounter, q8IsTrue]);

    // Q8 이미지가 변경될 때 answerVisible을 확실히 초기화하기 위한 useEffect
    useEffect(() => {
        if (questions[currentIndex]?.key === 'Q8') {
            setAnswerVisible(false); // 이미지가 변경될 때 답변 숨김
            console.log("Q8 answerVisible set to false");
        }
    }, [imageCounter]);

    // Q4AllScores가 업데이트될 때마다 체크하는 useEffect 추가
    useEffect(() => {
        const currentQuestion = questions[currentIndex];
        if (currentQuestion?.key === 'Q4' && Q4AllScores.length > 0) {
            const lastScores = Q4AllScores[Q4AllScores.length - 1];
            const hasZero = lastScores.some(score => score === 0);
            
            // 점수가 완벽하지 않고, 아직 3번째 시도가 아니면 D4-1 재생
            if (hasZero && Q4Attempts < 3) {
                // 첫 시도가 아닐 때만 D4-1 재생
                if (Q4Attempts > 0) {
                    const audioFile = audioFiles.find(file => file.filename === 'D4-1.wav');
                    if (audioFile) {
                        playAudio(audioFile.url);
                    }
                }
            }
        }
    }, [Q4AllScores]);

    // 오디오 시퀀스 재생 함수
    const playAudioSequence = async (questionKey, isImageChange = false) => {
        if (isPlaying) return;
        
        setIsPlaying(true);
        console.log('Playing audio for:', questionKey);

        try {
            // 기본 질문 오디오 찾기 (isImageChange가 false일 때만 재생)
            if (!isImageChange) {
                const mainAudioFile = audioFiles.find(file => file.filename === `${questionKey}.wav`);
                if (mainAudioFile) {
                    console.log('Playing main audio:', mainAudioFile.url);
                    await playAudio(mainAudioFile.url);
                }
            }
            // Q3 음성 재생이 끝난 후 5초 타이머 설정
            if (questionKey === 'Q3') {
                setCountdown(5); // 음성이 끝난 후 카운트 초기화
                questionTimeoutRef.current = setTimeout(() => {
                    const nextIndex = questions.findIndex(q => q.key === 'Q3-1');
                    if (nextIndex !== -1) {
                        setCurrentIndex(nextIndex);
                    }
                }, 5000); // 카운트다운 완료 후 Q3-1로 이동
            }
            // Q3-1일 때 Q3-2.wav도 연이어 재생
            if (questionKey === 'Q3-1') {
                const nextAudioFile = audioFiles.find(file => file.filename === 'Q3-2.wav');
                if (nextAudioFile) {
                    console.log('Playing next audio:', nextAudioFile.url);
                    await playAudio(nextAudioFile.url); // Q3-2.wav 재생
                }
            }
            // 특수 케이스 처리
            if (questionKey === 'Q4') {
                // 첫 시도일 때만 D4.wav 재생
                if (Q4Attempts === 0) {
                    const additionalAudioFile = audioFiles.find(file => file.filename === 'D4.wav');
                    if (additionalAudioFile) {
                        console.log('Playing D4 audio');
                        await playAudio(additionalAudioFile.url);
                    }
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
            } else if (questionKey === "Q8" && q8IsTrue?.isTrue === 'n') {
                // Q8에 대한 이미지별 오디오 재생
                const audioIndex = imageCounter + 2; // 'D8-2.wav'부터 시작하므로 2를 더함
                const additionalAudioFile = audioFiles.find(file => file.filename === `D8-${audioIndex}.wav`);
                
                if (additionalAudioFile) {
                    console.log(`Playing D8-${audioIndex} audio`);
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
                const response = await fetch(`http://localhost:8000/start?type=${type}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                const data = await response.json();
                console.log('Fetched data:', data);  
     
                // Q4와 Q2의 위치만 서로 교환
                const reorderedQuestions = [...data.questions];
                const q2Index = reorderedQuestions.findIndex(q => q.key === 'Q2');
                const q4Index = reorderedQuestions.findIndex(q => q.key === 'Q4');
                
                if (q2Index !== -1 && q4Index !== -1) {
                    const temp = reorderedQuestions[q2Index];
                    reorderedQuestions[q2Index] = reorderedQuestions[q4Index];
                    reorderedQuestions[q4Index] = temp;
                }
    
                // type에 따라 questions 설정
                const finalQuestions = type === "simple" ? reorderedQuestions : data.questions;
                setQuestions(finalQuestions);
    
                setCorrectAnswer(data.correctAnswer);
                setAudioFiles(data.audio_files);
                setExplanations(data.explanations);
                setMaxScores(data.maxScores)
     
                console.log("audioFiles", audioFiles)
            
                // questions 설정 후 answers 초기화
                const initialAnswers = {};
                finalQuestions.forEach(question => {
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
            // Q8 키를 제외한 scores의 합계 계산
            const totalScore = Object.entries(scores)
                .filter(([key]) => key !== 'Q8') // Q8을 제외
                .reduce((sum, [, score]) => sum + score, 0);
    
            console.log('현재 점수:', scores);
            console.log('현재 답변:', answers);
            console.log(`총점 (Q8 제외): ${totalScore}점`);
        }
    }, [scores, answers]);

    // getNavigationState 함수 수정
    const getNavigationState = () => {
        const relevantAnswers = {};
        const relevantScores = {};
        const relevantCorrectAnswers = [];
        const relevantExplanations = [];
        const relevantMaxScores = [];

        const lastQ7Scores = Q7AllScores[Q7AllScores.length - 1];

        attemptedQuestions.forEach((question) => {
            const answerKey = question.key.replace('Q', 'A');
            if (answers[answerKey] !== undefined) {
                relevantAnswers[answerKey] = answers[answerKey];
            }

            // Q7 최종 점수 계산
            if (question.key === 'Q7' && lastQ7Scores) {
                const q7CorrectAnswer = correctAnswer.find(ans => ans.key === 'Q7')?.value || '';
                const correctWords = q7CorrectAnswer.split(/[,\s]+/).map(word => word.trim());
                
                let totalScore = lastQ7Scores.reduce((sum, score, index) => {
                    const currentWord = correctWords[index];
                    
                    if (failedIndices.includes(currentWord)) {
                        // failedIndices에 있는 단어는 하위 문제 점수도 0점
                        return sum + 0;
                    } else if (score === 1) {
                        // failedIndices에 없고 원래 맞춘 답변은 2점
                        return sum + 2;
                    } else {
                        // failedIndices에 없고 틀린 답변은 해당 하위 문제의 점수 사용
                        const subQuestionKey = `Q7-${index + 1}`;
                        return sum + (scores[subQuestionKey] || 0);
                    }
                }, 0);
                
                // 최대 3점으로 제한
                totalScore = Math.min(totalScore, 6);
                relevantScores[question.key] = totalScore;
            } 
            // Q7 하위 문제는 제외
            else if (!question.key.startsWith('Q7-')) {
                if (scores[question.key] !== undefined) {
                    relevantScores[question.key] = scores[question.key];
                }
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

        return {
            questions: attemptedQuestions,
            answers: relevantAnswers,
            correctAnswer: relevantCorrectAnswers,
            scores: relevantScores,
            explanations: relevantExplanations,
            maxScores: relevantMaxScores,
            place,
            type
        };
    };

    const handleNext = () => {
        const currentQuestion = questions[currentIndex];
        const currentScore = scores[currentQuestion?.key];

        if (currentIndex === questions.length - 1) {
            navigate('/complete', {
                state: getNavigationState()
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

            // Q4에서 다음으로 넘어갈 때 첫 시도 답변으로 교체
            if (currentQuestion?.key === 'Q4' && firstQ4Answer) {
                setAnswers(prev => ({
                    ...prev,
                    A4: firstQ4Answer
                }));
            }
            
            // Q5 처리
            if (currentQuestion?.key === 'Q5' && currentScore === 0) {
                if (type === "simple") {
                    const nextIndex = questions.findIndex(q => q.key === 'Q7');
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
                } else if (type === "full") {
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
            
            // Q7 처리
            if (currentQuestion?.key === 'Q7') {
                const lastQ7Scores = Q7AllScores[Q7AllScores.length - 1];
                if (lastQ7Scores) {
                    // Q7의 정답 단어들 가져오기
                    const q7CorrectAnswer = correctAnswer.find(ans => ans.key === 'Q7')?.value || '';
                    const correctWords = q7CorrectAnswer.split(/[,\s]+/).map(word => word.trim());
                    
                    // 모든 점수가 1인 경우 (완벽한 답변)
                    if (lastQ7Scores.every(score => score === 1)) {
                        const finalScore = Math.min(lastQ7Scores.reduce((sum) => sum + 2, 0), 3);
                        setScores(prev => ({
                            ...prev,
                            'Q7': finalScore
                        }));
                        
                        if (type === 'simple') {
                            navigate('/complete', {
                                state: getNavigationState()
                            });
                        } else {
                            const q8Index = questions.findIndex(q => q.key === 'Q8');
                            setCurrentIndex(q8Index !== -1 ? q8Index : currentIndex + 1);
                        }
                        return;
                    }
                    
                    // 틀린 문제가 있는 경우
                    const zeroScoreIndexes = lastQ7Scores.map((score, idx) => 
                        score === 0 ? idx : -1
                    ).filter(idx => idx !== -1);
                    
                    // 첫 번째 틀린 문제로 이동
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
                    const nextFailedIndex = lastQ7Scores.findIndex((score, idx) => 
                        score === 0 && idx + 1 > currentNum
                    );
            
                    if (nextFailedIndex === -1) {
                        if (type === 'simple') {
                            navigate('/complete', {
                                state: getNavigationState()
                            });
                        } else {
                            const q8Index = questions.findIndex(q => q.key === 'Q8');
                            setCurrentIndex(q8Index !== -1 ? q8Index : currentIndex + 1);
                        }
                    } else {
                        const nextQuestionKey = `Q7-${nextFailedIndex + 1}`;
                        const nextQuestionIndex = questions.findIndex(q => q.key === nextQuestionKey);
                        if (nextQuestionIndex !== -1) {
                            setCurrentIndex(nextQuestionIndex);
                        }
                    }
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
            const scores = Array.isArray(score) ? score : [score];
            
            // correctAnswer에서 Q4에 해당하는 정답 찾기
            const q4CorrectAnswer = correctAnswer.find(ans => ans.key === 'Q4')?.value || '';
            const correctWords = q4CorrectAnswer.split(/[,\s]+/).map(word => word.trim());
            
            // 첫 번째 시도인 경우, 점수 합계를 저장
            if (Q4Attempts === 0) {
                const totalScore = scores.reduce((sum, s) => sum + s, 0);
                setScores(prev => ({
                    ...prev,
                    [questionNumber]: totalScore
                }));
                
                // 첫 시도에서 틀린 단어들 저장
                const initialFails = correctWords.filter((word, idx) => scores[idx] === 0);
                setFailedIndices(initialFails);
            } else {
                // 두 번째, 세 번째 시도에서는 이전에 틀린 단어들 중에서
                // 이번에도 틀린 단어들만 유지
                setFailedIndices(prev => prev.filter(word => {
                    const wordIndex = correctWords.indexOf(word);
                    return wordIndex !== -1 && scores[wordIndex] === 0;
                }));
            }
            
            setQ4AllScores(prev => [...prev, scores]);
            setQ4Attempts(prev => prev + 1);
        } 
        // Q7 관련 부분 수정
        else if (questionNumber === 'Q7') {
            const scores = Array.isArray(score) ? score : [score];
            setQ7AllScores(prev => [...prev, scores]);
            // 초기 점수는 저장하지 않음 (Q8로 넘어갈 때 최종 계산)
        }
        else if (questionNumber.startsWith('Q7-')) {
            const scores = Array.isArray(score) ? score : [score];
            const currentNum = parseInt(questionNumber.split('-')[1]);
            
            // Q7의 정답 가져오기
            const q7CorrectAnswer = correctAnswer.find(ans => ans.key === 'Q7')?.value || '';
            const correctWords = q7CorrectAnswer.split(/[,\s]+/).map(word => word.trim());
            
            // 현재 물어보는 단어 (currentNum - 1 인덱스의 단어)
            const currentWord = correctWords[currentNum - 1];
            
            // failedIndices에 현재 단어가 있으면 무조건 0점으로 저장
            if (failedIndices.includes(currentWord)) {
                setScores(prev => ({
                    ...prev,
                    [questionNumber]: 0
                }));
            } else {
                // 현재 단어의 인덱스에 해당하는 점수 사용
                const currentScore = scores[currentNum - 1] || 0;
                setScores(prev => ({
                    ...prev,
                    [questionNumber]: currentScore
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
        // Q4의 첫 시도 답변 저장
        if (questionNumber === 'Q4' && Q4Attempts === 0) {
            setFirstQ4Answer(answer);
        }
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
                        {currentQuestionKey === 'Q3-1' 
                            ? `${getCurrentQuestion()} ${place && !['집', '병원'].includes(place) ? `${place}인가요?` : ''}`
                            : getCurrentQuestion()}
                        </div>
                        {answers[`A${currentQuestionKey.substring(1)}`] && (
                            currentQuestionKey === 'Q8' ? (
                                // Q8일 때는 answerVisible 상태에 따라 답변 표시
                                answerVisible && (
                                    <div className="hp_mt10">
                                        <p className="el_question hp_fs14">
                                            답변: {answers['A8']}
                                        </p>
                                    </div>
                                )
                            ) : (
                                // Q8이 아닐 때는 항상 답변 표시
                                <div className="hp_mt10">
                                    <p className="el_question hp_fs14">
                                        답변: {answers[`A${currentQuestionKey.substring(1)}`]}
                                    </p>
                                </div>
                            )
                        )}
                        {currentQuestionKey === "Q3" && !isRecording && (
                            <div className="el_question">
                                <p>{countdown}초</p>
                            </div>
                        )}
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
                            onStartRecording={handleStartRecording} // 녹음 시작 시 호출
                            onIsTrue={handleQ8IsTrue}
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