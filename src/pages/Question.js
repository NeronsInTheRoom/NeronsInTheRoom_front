function Question() {
  return (
    <div className="ly_all">
      <div className="ly_wrap">
        <div className="ly_fSpace ly_fdColumn hp_padding20 hp_pt80 hp_ht100">
          <div className="">
            <div className="el_question"></div>
            <audio controls src="" style={{ display: 'none' }}>Your browser does not support the audio element.</audio>
            <div className="random-image-word hp_mt30"><img src="" alt="" /></div>
          </div>

          <div>
            <div>
              <button onClick="" className="el_btn el_btnL el_btn__black hp_wd100">"녹음 중지" : "녹음 시작"</button>
              <audio controls src="" style={{ display: 'none' }} />
            </div>
            <button onClick=""
              // className={!isReceived ? "el_btn el_btnL el_btn__disable hp_mt10 hp_wd100" : "el_btn el_btnL el_btn__blue hp_mt10 hp_wd100"} 
              disabled=""> '다음' : '완료' </button>
          </div>
        </div>
        <p>질문을 불러오는 중입니다...</p>
      </div>
    </div>
  );
}

export default Question;
