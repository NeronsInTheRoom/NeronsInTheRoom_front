import React from 'react';
import { useLocation } from 'react-router-dom';

function Complete() {
  const location = useLocation();
  const { questions, answers, correctAnswer, scores, explanations, maxScores, place, type } = location.state || {};

  // 총점 계산
  const totalScore = Object.entries(scores || {})
    .filter(([key]) => !key.startsWith('Q7-') && key !== 'Q8')
    .reduce((sum, [, score]) => sum + score, 0);
  
  // 총 만점 계산
  const totalMaxScore = maxScores?.reduce((sum, item) => {
    if (type === 'simple') {
      // simple 타입일 때는 특정 문제들만 합산
      const simpleKeys = ['Q4', 'Q5', 'Q5-1', 'Q6', 'Q6-1', 'Q7'];
      return simpleKeys.includes(item.key) ? sum + parseInt(item.value) : sum;
    } else {
      // full 타입일 때는 모든 문제 합산
      return sum + parseInt(item.value);
    }
  }, 0);

  const getStatusInfo = (score, type) => {
    if (type === 'simple') {
      if (score > 7) return { text: '정상', className: 'el_mark__safety' };
      if (score > 5) return { text: '초기', className: 'el_mark__warning' };
      if (score > 3) return { text: '중기', className: 'el_mark__middle' };
      return { text: '고도', className: 'el_mark__hazard' };
    } else {
      if (score > 20) return { text: '정상', className: 'el_mark__safety' };
      if (score > 15) return { text: '초기', className: 'el_mark__warning' };
      if (score > 10) return { text: '중기', className: 'el_mark__middle' };
      return { text: '고도', className: 'el_mark__hazard' };
    }
  };

  const statusInfo = getStatusInfo(totalScore, type);
  
  return (
    <div className="ly_all hp_f2Back">
      <div className="ly_wrap">
        <div className="hp_fBack hp_padding20">
          <div className="hp_alignC">
            {type === 'simple' && (
              <div style={{paddingTop: "30px"}}>
                <p style={{fontSize: "15px", color: "red"}}>*해당 테스트는 미리보기용 테스트입니다*</p>
                <p style={{fontSize: "15px", color: "red"}}>*정확한 테스트를 원하시면 정밀 자가진단을 이용 부탁드립니다*</p>
              </div>
            )}
            <div className={`ly_center el_mark ${statusInfo.className}`}>{statusInfo.text}</div>
            <div className="el_correctNum">
              {type === 'simple' ? `${totalScore} 점` : `${totalMaxScore} 점`}
            </div>
            <div className="el_txt">
            </div>
          </div>
          <a className="el_btn el_btnL el_btn__blue hp_mt70" href="/">처음으로</a>
        </div>
        <div className="hp_padding20">
        {type === 'simple' ? (
            <>
              <p className="hp_fs16 hp_fw700">총 12점 만점</p>
              <ul className="bl_listRing bl_guide hp_mt10">
                <li>8점 이상 : 정상</li>
                <li>6 ~ 7점 : 초기치매</li>
                <li>4 ~ 5점 : 중기치매</li>
                <li>3점 이하 : 고도치매</li>
              </ul>
            </>
          ) : (
            <>
              <p className="hp_fs16 hp_fw700">총 30점 만점</p>
              <ul className="bl_listRing bl_guide hp_mt10">
                <li>21점 이상 : 정상</li>
                <li>16 ~ 20점 : 초기치매</li>
                <li>11 ~ 15점 : 중기치매</li>
                <li>10점 이하 : 고도치매</li>
              </ul>
            </>
          )}
        </div>
        <div className="hp_padding20">
          <table className="bl_resultTB">
            <colgroup>
              <col style={{ width:"15%"}} />
              <col style={{ width:"*"}} />
              <col style={{ width:"15%"}} />
              <col style={{ width:"15%"}} />
            </colgroup>
            <tbody>
              {questions?.map((question) => {
                // Q7-1, Q7-2, Q7-3, Q8-1은 건너뛰기
                if (['Q7-1', 'Q7-2', 'Q7-3', 'Q8-1'].includes(question.key)) return null;

                // Q8일 때 Q8-1의 사용자 답변과 점수를 사용
                const isQ8 = question.key === 'Q8';
                const scoreKey = isQ8 ? 'Q8-1' : question.key;
                const userAnswerKey = isQ8 ? 'Q8-1' : question.key;

                const answer = correctAnswer?.find(ans => ans.key === question.key); // Q8의 정답 유지
                const userAnswer = answers[userAnswerKey.replace('Q', 'A')]; // Q8일 때 Q8-1의 사용자 답변
                const score = scores[scoreKey]; // Q8일 때 Q8-1의 점수
                const explanation = explanations?.find(exp => exp.key === question.key);

                return (
                  <React.Fragment key={question.key}>
                    <tr className='bl_resultTB__line hp_fBack'>
                      <th>질문</th>
                      <td colSpan={3}>
                      {question.key === 'Q3-1'
                        ? `${question.value} ${place && !['집', '병원'].includes(place) ? `${place}인가요?` : ''}`
                        : question.value}
                        
                        {isQ8 && (
                          <>
                            <br />
                            {questions.find(q => q.key === 'Q8-1')?.value}
                          </>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>정답</th>
                      <td colSpan={3}>{question.key === 'Q3' && !answer?.value ? place : answer?.value}</td>
                    </tr>
                    <tr className='hp_fBack'>
                      <th>답변</th>
                      <td>{userAnswer || ''}</td>
                      <th>점수</th>
                      <td className='hp_alignC'>
                        <b className='hp_purpleblue'>{score || 0}</b> / {maxScores?.find(max => max.key === question.key)?.value || 3}
                      </td>
                    </tr>
                    <tr>
                      <th>평가</th>
                      <td colSpan={3}>{explanation?.value}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Complete;