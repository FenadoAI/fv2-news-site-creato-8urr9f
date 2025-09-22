import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewsPage from "./components/NewsPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NewsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
