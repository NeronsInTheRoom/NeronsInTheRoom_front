import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layouts from "./layouts/Layouts";
import Main from "./pages/Main"
import Question from "./pages/Question";
import Complete from "./pages/Complete";
import StartAudio from "./pages/StartAudio";
import AudioPlayer from "./pages/AudioPlayer";

function App() {
  return (
    <>
      <BrowserRouter >
        <Routes >
          {/* <Route path="/" element={<Layouts />}>
            <Route index element={<Main />}/>
          </Route> */}
          <Route path="/" element={<Main />}/>
          <Route path="/question" element={<Question />} />
          <Route path="/complete" element={<Complete />} />
          <Route path="/audioplayer" element={<AudioPlayer />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
