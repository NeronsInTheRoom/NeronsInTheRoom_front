# MemoryExplorer

## 프로젝트 소개
검사지 없이 일상적인 질의 응답을 통해 치매를 자가 진단하는 서비스

>고령화시대, 노인 인구 증가 추세를 따라 커지는 치매 걱정<br/>
>검사지가 필요없는 대화형 ai 서비스를 통해<br/>
>금전, 시간, 공간적 제한 없이 간단하게 치매 테스트를 진행할 수 있습니다.<br/>


## 멤버 구성
+ 이다정(https://github.com/LXXDJ)<br/>
+ 성우현(https://github.com/sunguh0904)<br/>
+ 구예성(https://github.com/KUYESUNG)<br/>
+ 권순상(https://github.com/sunskwon)<br/>


## 프로젝트 기능
1. 치매 자가 진단<br/>
a. 사용자는 디바이스의 음성 입력 장치(마이크 등)와 음성 출력 장치(스피커 등)으로 자가 진단을 진행한다.<br/>
b. 자가 진단은 크게 3단계로 진행된다.<br/>

        i) 시작 화면에서 '시작'버튼을 눌러 자가 진단을 시작할 수 있다.<br/>
        ii) 진단 과정에서는 음성 출력 장치와 화면을 통해 수행해야 할 과제가 제시된다.<br/>
        iii) 진단 과정 첫 페이지에서는 임의의 단어 3개가 음성 출력 장치를 통해 제시된다.<br/>
        iv) 수행해야 할 과제는 a) 날짜 인식, b) 물체 인식, c) 따라 말하기, 그리고 d) 단어 기억 순서로 주어진다.<br/>
        v) 각 과제마다 음성 입력 장치를 통해 답안을 입력 받는다.<br/>
    c. 주어진 모든 과제를 끝마치면 100점 만점의 점수로 치매 가능성을 표시해준다.<br/>


## 시작가이드
1. Back-end<br/>
a. MeloTTS를 최우선 설치<br/>
b. fastapi, pytorch (GPU), transformers, fuzzywuzzy, soundfile 설치<br/>

2. Front-end<br/>
a. Record.js 추가<br/>


## 사용 기술
1. Design<br/>
a. Figma<br/>
b. Miro<br/>

2. Back-end<br/>
a. fastapi (python)<br/>

3. Front-end<br/>
a. React (JavaScript)<br/>

4. Tools<br/>
a. Github<br/>
b. Notion<br/>
c. Visual Studio Code<br/>
