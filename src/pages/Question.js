import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Question() {
  const questions = [
    "질문 1: 오늘의 날씨는 어떤가요?",
    "질문 2: 어제 저녁에 무엇을 먹었나요?",
    "질문 3: 가장 좋아하는 취미는 무엇인가요?",
    "질문 4: 여행을 가고 싶은 곳은 어디인가요?",
    "질문 5: 마지막으로 읽은 책은 무엇인가요?",
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigate = useNavigate();

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      navigate("/complete"); // 완료 페이지로 이동
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>테스트 페이지</h1>
        <p>{questions[currentQuestionIndex]}</p>
        <button onClick={handleNextQuestion}>
          {currentQuestionIndex < questions.length - 1 ? "다음" : "완료"}
        </button>
      </header>
    </div>
  );
}

export default Question;
