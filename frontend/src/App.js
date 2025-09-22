import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewsPage from "./components/NewsPage";
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="news-ui-theme">
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<NewsPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
