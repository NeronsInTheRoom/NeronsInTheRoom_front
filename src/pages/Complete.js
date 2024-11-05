import React from 'react';
import { useLocation } from 'react-router-dom';

function Complete() {
  const location = useLocation();
  const { questions, answers, correctAnswer, scores, explanations } = location.state || {};

  // 총점 계산
  const totalScore = Object.values(scores || {}).reduce((sum, score) => sum + score, 0);

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

                const answer = correctAnswer?.find(ans => ans.key === question.key);
                const userAnswer = answers[question.key?.replace('Q', 'A')];
                const score = scores[question.key];
                const maxScore = question.key === 'Q7' ? 3 : 
                                question.key === 'Q8' ? 5 : 
                                question.key === 'Q9' ? 3 : 1;
                const explanation = explanations?.find(exp => exp.key === question.key);
                
                return (
                  <React.Fragment key={question.key}>
                    <tr className='bl_resultTB__line hp_fBack'>
                      <th>질문</th>
                      <td colSpan={3}>
                        {question.value}
                        {question.key === 'Q8' && (
                          <>
                            <br />
                            {questions.find(q => q.key === 'Q8-1')?.value}
                          </>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>정답</th>
                      <td colSpan={3}>{answer?.value}</td>
                    </tr>
                    <tr className='hp_fBack'>
                      <th>답변</th>
                      <td>{userAnswer || ''}</td>
                      <th>점수</th>
                      <td className='hp_alignC'>
                        <b className='hp_purpleblue'>{score || 0}</b> / {maxScore}
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