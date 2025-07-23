import "./App.css";
import Login from "./renderer/src/pages/auth/Login";
import Register from "./renderer/src/pages/auth/Register";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./renderer/src/pages/home/Dashboard";
import { AuthProvider } from "./renderer/src/context/AuthContext";
import PrivateRoute from "./renderer/src/components/PrivateRoute/PrivateRoute";
import { ToastContainer } from "react-toastify";
import { DarkModeProvider } from "./renderer/src/context/DarkMode";
import VerifyOTP from "./renderer/src/components/VerifyOTP/VerifyOTP";
import RecoverPassword from "./renderer/src/components/RecoverPassword/RecoverPassword";

function App() {
  return (
    <>
      <DarkModeProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/verify" element={<VerifyOTP />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/main"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </DarkModeProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ top: "40px" }}
      />
    </>
  );
}

export default App;
