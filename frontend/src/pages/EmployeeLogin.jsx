import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function EmployeeLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post('https://retailai-backend-0onv.onrender.com/employee/login', {
        email: email,
        password: password
      })
      localStorage.setItem('employee', JSON.stringify(response.data))
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
        background: 'linear-gradient(155deg, #211A10 0%, #4A3620 50%, #4A6741 140%)',
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
          Bill fast.<br />Serve <span style={{ color: '#B7CE9E', fontStyle: 'italic' }}>every customer</span>.
        </h1>
        <p style={{ color: '#E8D9BE', fontSize: '16px', lineHeight: '1.7', maxWidth: '420px' }}>
          Products, customer lookup, and billing, all in one place for the shop floor.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '35px', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,248,236,0.1)', border: '1px solid rgba(255,248,236,0.25)', color: '#FFF8EC', padding: '7px 16px', borderRadius: '20px', fontSize: '13px' }}>
            &#9679; Fast Billing
          </span>
          <span style={{ background: 'rgba(255,248,236,0.1)', border: '1px solid rgba(255,248,236,0.25)', color: '#FFF8EC', padding: '7px 16px', borderRadius: '20px', fontSize: '13px' }}>
            &#9679; Product Lookup
          </span>
        </div>
      </div>

      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3ECDF', padding: '40px' }}>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ fontSize: '34px' }}>&#128100;</div>
          <h2 style={{ margin: '14px 0 0', color: '#211A10', fontSize: '28px' }}>Employee Login</h2>
          <p style={{ color: '#8A7A5F', fontSize: '13.5px', marginTop: '6px', marginBottom: '30px' }}>
            Sign in to start billing
          </p>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Email</label><br />
            <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} required
              placeholder="you@jashn.com"
              style={{ width: '100%', padding: '14px', marginTop: '6px', borderRadius: '10px', border: '1px solid #DCCEAE', background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px' }} />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Password</label><br />
            <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} required
              placeholder="••••••••"
              style={{ width: '100%', padding: '14px', marginTop: '6px', borderRadius: '10px', border: '1px solid #DCCEAE', background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px' }} />
          </div>

          {error && <p style={{ color: '#93493A', fontSize: '13px', background: '#F2D6CE', padding: '10px 14px', borderRadius: '9px' }}>{error}</p>}

          <button type="submit" style={{
            width: '100%', padding: '16px', marginTop: '22px', background: '#4A6741',
            color: '#FFF8EC', border: 'none', borderRadius: '11px', fontSize: '16px', fontWeight: '700'
          }}>
            Sign In &rarr;
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13.5px', color: '#8A7A5F' }}>
            Are you the owner? <a href="/admin-login" style={{ color: '#4A6741', fontWeight: '700' }}>Admin Login</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeLogin
