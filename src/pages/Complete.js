import React from 'react';
import { useLocation } from 'react-router-dom';

function Complete() {
  const location = useLocation();
  const { questions, answers, correctAnswer, scores, explanations, maxScores, place } = location.state || {};

  // 총점 계산
  const totalScore = Object.entries(scores || {})
    .filter(([key]) => key !== 'Q8') // Q8 키를 제외
    .reduce((sum, [, score]) => sum + score, 0);

  const getStatusInfo = (score) => {
    if (score > 21) return { text: '정상', className: 'el_mark__safety' };
    if (score > 15) return { text: '초기', className: 'el_mark__warning' };
    if (score > 10) return { text: '중기', className: 'el_mark__middle' };
    return { text: '고도', className: 'el_mark__hazard' };
  };

  const statusInfo = getStatusInfo(totalScore);
  
  return (
    <div className="ly_all hp_f2Back">
      <div className="ly_wrap">
        <div className="hp_fBack hp_padding20">
          <div className="hp_alignC">
            <div className={`ly_center el_mark ${statusInfo.className}`}>{statusInfo.text}</div>
            <div className="el_correctNum">{totalScore} 점</div>
            <div className="el_txt">
            </div>
          </div>
          <a className="el_btn el_btnL el_btn__blue hp_mt70" href="/">처음으로</a>
        </div>
        <div className="hp_padding20">
          <p className="hp_fs16 hp_fw700">총 30점 만점</p>
          <ul className="bl_listRing bl_guide hp_mt10">
            <li>21점 이상 : 정상</li>
            <li>16 ~ 20점 : 초기치매</li>
            <li>15 ~ 11점 : 중기치매</li>
            <li>10점 미만 : 고도치매</li>
          </ul>
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