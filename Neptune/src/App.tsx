import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import StartPage from "./pages/StartPage";
import SettingConfig from "./pages/SettingConfig";
import { Home } from "./pages/Home";
import { Route, Routes, BrowserRouter } from 'react-router-dom';

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/setting" element={<SettingConfig />} />
        <Route path="/home" element={<Home />} />
        
      </Routes>
    </BrowserRouter>
  );
    
}

export default App;
