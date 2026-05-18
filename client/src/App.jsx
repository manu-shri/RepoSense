import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Benchmark from "./pages/Benchmark.jsx";
import CodeHealth from "./pages/CodeHealth.jsx";
import ContributorAnalysis from "./pages/ContributorAnalysis.jsx";
import Layout from "./components/Layout.jsx";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/benchmark" element={<Benchmark />} />
        <Route path="/code-health" element={<CodeHealth />} />
        <Route path="/contributor-analysis" element={<ContributorAnalysis />} />
      </Route>
      {/* Fallback to Home for any dashboard links */}
      <Route path="/dashboard/:owner/:repo" element={<Navigate to="/home" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
