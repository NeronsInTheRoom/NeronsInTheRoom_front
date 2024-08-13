import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layouts from "./layouts/Layouts";
import Main from "./pages/Main"

function App() {
  return (
    <>
      <BrowserRouter >
        <Routes >
          <Route path="/" element={<Layouts />}>
            <Route path="main" element={<Main />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
