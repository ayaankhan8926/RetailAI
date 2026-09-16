import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post('https://retailai-backend-0onv.onrender.com/admin/login', {
        email: email,
        password: password
      })
      localStorage.setItem('admin', JSON.stringify(response.data))
      onLoginSuccess(response.data)
      navigate('/')
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Login failed. Please try again.'
      setError(msg)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <div style={{
        flex: '1',
        background: 'linear-gradient(155deg, #211A10 0%, #4A3620 50%, #C1702E 140%)',
        padding: '60px',
        color: '#FFF8EC',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px', width: '360px', height: '360px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,248,236,0.08), transparent 70%)'
        }} />

        <div style={{ fontSize: '13px', letterSpacing: '2px', color: '#E8D9BE', textTransform: 'uppercase', marginBottom: '18px' }}>
          RetailAI Platform
        </div>
        <h1 style={{ color: '#FFF8EC', fontSize: '48px', marginBottom: '20px', lineHeight: '1.15', maxWidth: '500px' }}>
          Run your store.<br />Know <span style={{ color: '#E8B77E', fontStyle: 'italic' }}>everything</span>.
        </h1>
        <p style={{ color: '#E8D9BE', fontSize: '16px', lineHeight: '1.7', maxWidth: '420px' }}>
          AI-powered demand forecasts, live inventory, and smart billing, all built for Jashn Collection.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '35px', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,248,236,0.1)', border: '1px solid rgba(255,248,236,0.25)', color: '#FFF8EC', padding: '7px 16px', borderRadius: '20px', fontSize: '13px' }}>
            &#9679; AI Demand Forecast
          </span>
          <span style={{ background: 'rgba(255,248,236,0.1)', border: '1px solid rgba(255,248,236,0.25)', color: '#FFF8EC', padding: '7px 16px', borderRadius: '20px', fontSize: '13px' }}>
            &#9679; Live Billing
          </span>
          <span style={{ background: 'rgba(255,248,236,0.1)', border: '1px solid rgba(255,248,236,0.25)', color: '#FFF8EC', padding: '7px 16px', borderRadius: '20px', fontSize: '13px' }}>
            &#9679; Multi-Shop Ready
          </span>
        </div>

        <div style={{
          marginTop: '45px', background: 'rgba(255,248,236,0.08)', border: '1px solid rgba(255,248,236,0.2)',
          borderRadius: '16px', padding: '20px 24px', maxWidth: '320px'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#E8B77E', fontFamily: "'Playfair Display', serif" }}>21+</div>
          <div style={{ fontSize: '13px', color: '#E8D9BE' }}>Products tracked with real-time AI insight</div>
        </div>
      </div>

      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3ECDF', padding: '40px' }}>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ fontSize: '34px' }}>&#128081;</div>
          <h2 style={{ margin: '14px 0 0', color: '#211A10', fontSize: '28px' }}>Admin Login</h2>
          <p style={{ color: '#8A7A5F', fontSize: '13.5px', marginTop: '6px', marginBottom: '30px' }}>
            Sign in to manage Jashn Collection
          </p>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Email</label><br />
            <input
              type="email"
              value={email}
              onChange={function (e) { setEmail(e.target.value) }}
              required
              placeholder="admin@jashncollection.com"
              style={{
                width: '100%', padding: '14px', marginTop: '6px',
                borderRadius: '10px', border: '1px solid #DCCEAE',
                background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px'
              }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Password</label><br />
            <input
              type="password"
              value={password}
              onChange={function (e) { setPassword(e.target.value) }}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '14px', marginTop: '6px',
                borderRadius: '10px', border: '1px solid #DCCEAE',
                background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px'
              }}
            />
          </div>

          {error && <p style={{ color: '#93493A', fontSize: '13px', background: '#F2D6CE', padding: '10px 14px', borderRadius: '9px' }}>{error}</p>}

          <button type="submit" style={{
            width: '100%', padding: '16px', marginTop: '22px',
            background: '#C1702E', color: '#FFF8EC', border: 'none',
            borderRadius: '11px', fontSize: '16px', fontWeight: '700'
          }}>
            Sign In &rarr;
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13.5px', color: '#8A7A5F' }}>
            Not an admin? <a href="/employee-login" style={{ color: '#C1702E', fontWeight: '700' }}>Employee Login</a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13.5px', color: '#8A7A5F' }}>
            New shop owner? <a href="/signup" style={{ color: '#C1702E', fontWeight: '700' }}>Create Your Shop</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
