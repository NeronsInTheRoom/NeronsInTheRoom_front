import React, { useState, useEffect } from 'react';

function Complete() {
  // 앞페이지에서 전달받아야됨
  // 샘플
  const questions = [
    {"key": "Q1", "value": "나이가 어떻게 되십니까?"},
    {"key": "Q2", "value": "오늘은 몇 년, 몇 월, 몇 일, 무슨 요일인가요?"},
    {"key": "Q3", "value": "지금 있는 곳은 무엇을 하는 곳입니까?"},
    {"key": "Q3-1", "value": "집인가요? 병원인가요? 시설인가요?"},
    {"key": "Q4", "value": "지금 말하는 3가지 단어를 잘 듣고 그대로 따라해주세요. 잠시 후 다시 물어볼 예정이니 잘 기억해 주세요."},
    {"key": "Q5", "value": "100에서 7을 빼면 얼마입니까?"},
    {"key": "Q6", "value": "지금 말하는 숫자들을 잘 기억하여 순서를 거꾸로 말해주세요. 예를 들어 '7, 8, 9'라고 했을 경우, '9, 8, 7'이라고 대답하시면 됩니다."},
    {"key": "Q6-1", "value": "이번엔 다른 숫자를 말씀드릴테니 한번 더 거꾸로 말해주세요."},
    {"key": "Q7", "value": "몇 분 전, 잘 기억하라고 했던 3가지 단어를 말해주세요."},
    {"key": "Q7-1", "value": "타고 다닐 수 있는 것"},
    {"key": "Q7-2", "value": "동물 또는 짐승"},
    {"key": "Q7-3", "value": "과일"},
    {"key": "Q8", "value": "지금 보이는 사진 속 물체의 이름을 말해주세요."},
    {"key": "Q8-1", "value": "방금 봤던 물체의 이름들을 다시 말해주세요."},
    {"key": "Q9", "value": "생각나는 채소 이름을 가능한 많이 말해주세요."},
  ]
  const answers = [
    {"key": "Q1", "value": "28살"},
    {"key": "Q2", "value": "2024년, 10월, 31일, 수요일"},
    {"key": "Q3", "value": "모르겠음"},
    {"key": "Q3-1", "value": "집"},
    {"key": "Q4", "value": "기차, 호랑이, 사과"},
    {"key": "Q5", "value": "93"},
    {"key": "Q5-1", "value": "86"},
    {"key": "Q6", "value": "2, 8, 6"},
    {"key": "Q6-1", "value": "9, 2, 5, 3"},
    {"key": "Q7", "value": "기차, 호랑이, 사과"},
    {"key": "Q8", "value": "시계, 열쇠, 도장, 연필, 동전"},
    {"key": "Q9", "value": "배추, 무, 상추, 시금치, 깻잎, 대파, 부추, 열무, 고추, 오이, 호박, 콩나물, 마늘 등"},
  ]

  const [explanations, setExplanations] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [explanationsResponse, scoresResponse] = await Promise.all([
          fetch('http://localhost:8000/get_explanations'),
          fetch('http://localhost:8000/get_scores')
        ]);
        
        const explanationsData = await explanationsResponse.json();
        const scoresData = await scoresResponse.json();
        
        setExplanations(explanationsData);
        setScores(scoresData);
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
      }
    };
    fetchData();
  }, []);

  // 점수
  const totalScore = 10;
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
              {questions.map((question) => {
                // Q7-1, Q7-2, Q7-3, Q8-1은 건너뛰기
                if (['Q7-1', 'Q7-2', 'Q7-3', 'Q8-1'].includes(question.key)) return null;

                const explanation = explanations?.find(exp => exp.key === question.key);
                const answer = answers.find(ans => ans.key === question.key);
                const score = scores.find(s => s.key === question.key);
                
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
                      <td></td>
                      <th>점수</th>
                      <td className='hp_alignC'><b className='hp_purpleblue'>0</b> / {score?.value}</td>
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
