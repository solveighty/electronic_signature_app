import "./App.css";
import Login from "./renderer/src/components/Login";
import Register from "./renderer/src/components/Register";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./renderer/src/components/Dashboard";
import AuthLayout from "./renderer/src/components/AuthLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/main" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
