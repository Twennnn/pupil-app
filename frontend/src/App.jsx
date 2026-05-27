import * as test from "react-router-dom"
console.log(test)
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"

import Home from "./pages/Home"
import Analyzer from "./pages/Analyzer"
import Stats from "./pages/Stats"

function App() {
  return (
    <BrowserRouter>
      <div style={{
        backgroundColor: "#2b2b2b",
        minHeight: "100vh"
      }}>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyzer />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App