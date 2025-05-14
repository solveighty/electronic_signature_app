import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulación de registro exitoso
    if (formData.password === formData.confirmPassword) {
      // Aquí iría la lógica real de registro
      localStorage.setItem('isAuthenticated', 'true')
      window.location.reload()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
  <div className="login-container">
    <div className="login-box">
      <h2 className="login-title">Crear una cuenta</h2>
      <form onSubmit={handleSubmit}>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="input"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          id="password"
          name="password"
          type="password"
          required
          className="input"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="input"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          Registrarse
        </button>
      </form>
      <button
        onClick={() => navigate('/login')}
        className="text-link"
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </div>
  </div>
)
}

export default Register 