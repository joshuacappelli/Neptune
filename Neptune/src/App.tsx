import "./App.css";
import StartPage from "./pages/StartPage";
import SettingConfig from "./pages/SettingConfig";
import { Home } from "./pages/Home";
import Login from "./pages/Login";
import { Route, Routes, BrowserRouter } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/setting" element={<SettingConfig />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
