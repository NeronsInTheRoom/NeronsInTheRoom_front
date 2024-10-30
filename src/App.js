import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main"
import Question from "./pages/Question";
import Question_dj from "./pages/Question_dj";
import Complete from "./pages/Complete";
import AudioPlayer from "./pages/AudioPlayer";
import Test from "./pages/test";

function App() {
  return (
    <>
      <BrowserRouter >
        <Routes >
          <Route path="/" element={<Main />}/>
          <Route path="/question" element={<Question />} />
          <Route path="/question_dj" element={<Question_dj />} />
          <Route path="/complete" element={<Complete />} />
          <Route path="/audioplayer" element={<AudioPlayer />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
