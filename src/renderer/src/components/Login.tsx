import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      localStorage.setItem('isAuthenticated', 'true')
      navigate('/main')
    }
  }

  return (
  <div className="login-container">
    <div className="login-box">
      <h2 className="login-title">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          id="password"
          name="password"
          type="password"
          required
          className="input"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Iniciar Sesión
        </button>
      </form>
      <button
        onClick={() => navigate('/register')}
        className="text-link"
      >
        ¿No tienes cuenta? Regístrate
      </button>
    </div>
  </div>
)
}

export default Login 