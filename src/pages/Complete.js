function Complete() {
  return (
    <div className="ly_all hp_f2Back">
      <div className="ly_wrap">
        <div className="hp_fBack hp_padding20">
          <div className="hp_alignC">
            <div className={`ly_center el_mark`}></div>
            <div className="el_correctNum">점</div>
            <div className="el_txt">
            </div>
          </div>
          <a className="el_btn el_btnL el_btn__blue hp_mt70" href="/">처음으로</a>
        </div>
        <div className="hp_padding20">
          <p className=""></p>
          <ul className="bl_listRing bl_guide">
            <li>80점 이상 : 안전</li>
            <li>30점 ~ 80점 : 주의</li>
            <li>30점 미만 : 위험</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Complete;
