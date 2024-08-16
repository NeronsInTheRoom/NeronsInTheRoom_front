import React from "react";
import { useLocation } from 'react-router-dom';

function Complete() {
  const location = useLocation();
  const averageScore = location.state

  console.log(averageScore)
  return (
    <div className="ly_all hp_f2Back hp_pt80">
      <div className="ly_wrap">
        <div className="hp_fBack hp_padding20">
          <div className="hp_alignC">
            <div className="ly_center el_mark el_mark__safety">안전</div>
            {/* <div className="ly_center el_mark el_mark__warning">주의</div>
            <div className="ly_center el_mark el_mark__hazard">위험</div> */}
            <div className="hp_777 el_correctNum">총 3개 중 <b className="hp_darkblue">0</b>개 정답</div>
          </div>
          <a className="el_btn el_btnL el_btn__blue hp_mt100" href="/">처음으로</a>
        </div>
        <div className="hp_padding20">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
      </div>
    </div>
  );
}

export default Complete;
