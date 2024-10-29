function Question() {
  return (
    <div className="ly_all hp_padding20 hp_pt80">
      <div className="ly_wrap">
        <div className="el_question"></div>
        <img src="" alt="Selected" style={{ width: '300px', height: 'auto' }} />
        <button onClick="" disabled="" className="el_btn el_btnL el_btn__blue hp_mt100 hp_wd100">다음</button>
        <button onClick="" disabled="" className="el_btn el_btnL el_btn__blue hp_mt100 hp_wd100">완료</button>
        <p>Loading data...</p> // 데이터 로딩 중 표시할 메시지

        <div>
          <h3>Generated Audio:</h3>
          <audio key="" controls autoPlay>
            <source src="" type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
        <ul>
          <li>{`점수: `}</li>
        </ul>
        <div>
          <button onClick="">
            "녹음 중지" : "녹음 시작"
          </button>
        </div>
      </div>
    </div>
  );
}

export default Question;
