import "./App.css";
import Login from "./renderer/src/components/Login";
import Register from "./renderer/src/components/Register";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./renderer/src/components/Dashboard";
import { AuthProvider } from "./renderer/src/context/AuthContext";
import PrivateRoute from "./renderer/src/components/PrivateRoute";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
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
