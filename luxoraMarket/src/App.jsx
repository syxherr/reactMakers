import { Routes, Route, Navigate } from "react-router-dom";
import Luxora from "./Luxora";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/luxora" replace />} />
      <Route path="/luxora" element={<Luxora />} />
    </Routes>
  );
}

export default App;