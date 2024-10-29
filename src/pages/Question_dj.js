function Question() {
  return (
    <div className="ly_all hp_padding20 hp_pt80">
      <div className="ly_wrap">
        <div>
          <div className="question-text">
          </div>
          <audio controls src="">
            Your browser does not support the audio element.
          </audio>
          <div className="random-words">
            <h3>랜덤 단어:</h3>
          </div>
          <div className="random-image-word">
            <h3>랜덤 이미지:</h3>
          </div>
          <div className="random-sentence">
            <h3>랜덤 문장:</h3>
          </div>
          <button onClick="">
            <div>다음 질문 : 완료</div>
          </button>
        </div>
        <p>질문을 불러오는 중입니다...</p>
      </div>
    </div>
  );
}

export default Question;
