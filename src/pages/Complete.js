import React from "react";

function Complete({total_score}) {
  total_score = 90;

  let statusClass = "";
  let statusText = "";
  let description = "";

  if (total_score >= 80) {
    statusClass = "el_mark__safety";
    statusText = "안전";
    description = "건강한 뇌를 가지셨군요! \n지금의 상태를 잘 유지하세요.";
  } else if (total_score < 30) {
    statusClass = "el_mark__hazard";
    statusText = "위험";
    description = "직접 병원에 방문하여 \n검진을 받아보시길 권장드립니다.";
  } else {
    statusClass = "el_mark__warning";
    statusText = "주의";
    description = "안전한 상태는 아니므로 \n일상에서도 평소 상태를 잘 관찰해주세요.";
  }

  return (
    <div className="ly_all hp_f2Back">
      <div className="ly_wrap">
        <div className="hp_fBack hp_padding20">
          <div className="hp_alignC">
            <div className={`ly_center el_mark ${statusClass}`}>{statusText}</div>
            <div className="el_correctNum">{total_score}점</div>
            <div className="el_txt">
              {description.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
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
