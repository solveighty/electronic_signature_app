import "./App.css";
import Login from "./renderer/src/components/Login";
import Register from "./renderer/src/components/Register";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./renderer/src/components/Dashboard";
import { AuthProvider } from "./renderer/src/context/AuthContext";
import PrivateRoute from "./renderer/src/components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/main" element={
            <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
