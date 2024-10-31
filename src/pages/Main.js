import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Main() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [place, setPlace] = useState('');

  const handleSimpleTest = () => {
    navigate('/question', { state: { type: 'simple' } });
  };

  const handleFullTest = () => {
    setShowPopup(true);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setBirthDate('');
    setPlace('');
  };

  const handleConfirm = () => {
    if (!birthDate.trim() || !place.trim()) {
      alert('생년월일과 현재장소를 모두 입력해주세요.');
      return;
    }
    navigate('/question', { 
      state: { 
        type: 'full',
        birthDate,
        place 
      } 
    });
  };

  return (
    <div className="ly_all ly_center">
      <div className="ly_logoWrap">
        <h1 className="el_logo">
          <div className="el_logo2">치매 자가진단 테스트</div>
          너의<br/><b className="hp_darkblue">치매</b>가 보여
        </h1>
        <button className="el_btn el_btnL el_btn__blue hp_mt70" onClick={handleSimpleTest}>1분 자가진단</button>
        <button className="el_btn el_btnL el_btn__blue hp_mt15" onClick={handleFullTest}>정밀 자가진단</button>
      </div>
      <div className='ly_popupWrap' style={{ display: showPopup ? 'flex' : 'none' }}>
        <div className='bl_popup'>
          <label>생년월일 <input 
            type='text' 
            value={birthDate}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
              setBirthDate(onlyNumbers);
            }}
            placeholder='예: 20240101 (숫자 8자리만 입력)'
            maxLength={8}
          /></label>
          <label className='hp_mt30'>현재장소 <input 
            type='text'
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder='예: 요양원, 보건소, 집, 카페'
          /></label>
          <div className='bl_popup__btnZip hp_mt50'>
            <button className="el_btn el_btnL el_btn__777" onClick={handleCancel}>취소</button>
            <button className="el_btn el_btnL el_btn__blue hp_ml10" onClick={handleConfirm}>확인</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main;