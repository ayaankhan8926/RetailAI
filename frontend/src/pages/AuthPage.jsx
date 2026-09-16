import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function AuthPage({ onAdminLogin, onEmployeeLogin }) {
  const [mode, setMode] = useState('signin')
  const [role, setRole] = useState('admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')

  const navigate = useNavigate()

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    try {
      const url = role === 'admin' ? 'http://127.0.0.1:5000/admin/login' : 'http://127.0.0.1:5000/employee/login'
      const response = await axios.post(url, { email: email, password: password })
      if (role === 'admin') {
        localStorage.setItem('admin', JSON.stringify(response.data))
        onAdminLogin(response.data)
      } else {
        localStorage.setItem('employee', JSON.stringify(response.data))
        onEmployeeLogin(response.data)
      }
      navigate('/')
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Login failed. Please try again.'
      setError(msg)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post('http://127.0.0.1:5000/shop/signup', {
        shop_name: shopName,
        owner_name: ownerName,
        owner_email: email,
        phone: phone,
        password: password
      })
      const adminData = { name: ownerName, shop_id: response.data.shop_id }
      localStorage.setItem('admin', JSON.stringify(adminData))
      onAdminLogin(adminData)
      navigate('/')
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Signup failed. Please try again.'
      setError(msg)
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px', marginTop: '6px',
    borderRadius: '10px', border: '1px solid #DCCEAE',
    background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px'
  }
  const labelStyle = { fontSize: '13px', color: '#6B5636', fontWeight: '600' }

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', background: '#F3ECDF' }}>
      <div style={{
        flex: '1', background: 'linear-gradient(155deg, #2B1216 0%, #4A1E24 50%, #7A2331 140%)',
        padding: '60px', color: '#FFF8EC', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,248,236,0.08), transparent 70%)' }} />
        <div style={{ fontSize: '13px', letterSpacing: '2px', color: '#E8C88A', textTransform: 'uppercase', marginBottom: '18px' }}>RetailAI Platform</div>
        <h1 style={{ color: '#FFF8EC', fontSize: '46px', marginBottom: '20px', lineHeight: '1.15', maxWidth: '480px' }}>
          Run your store.<br />Know <span style={{ color: '#E8B77E', fontStyle: 'italic' }}>everything</span>.
        </h1>
        <p style={{ color: '#E8D9C8', fontSize: '16px', lineHeight: '1.7', maxWidth: '420px' }}>
          AI-powered demand forecasts, live inventory, and smart billing for Jashn Collection.
        </p>
      </div>

      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ display: 'flex', background: '#EFE3C7', borderRadius: '12px', padding: '5px', marginBottom: '30px' }}>
            <button
              onClick={function () { setMode('signin'); setError('') }}
              style={{
                flex: '1', padding: '11px', borderRadius: '9px', border: 'none', fontWeight: '700', fontSize: '14px',
                background: mode === 'signin' ? '#FFFCF5' : 'transparent',
                color: mode === 'signin' ? '#7A2331' : '#8A7A5F',
                boxShadow: mode === 'signin' ? '0 2px 8px rgba(43,18,22,0.1)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={function () { setMode('signup'); setError('') }}
              style={{
                flex: '1', padding: '11px', borderRadius: '9px', border: 'none', fontWeight: '700', fontSize: '14px',
                background: mode === 'signup' ? '#FFFCF5' : 'transparent',
                color: mode === 'signup' ? '#7A2331' : '#8A7A5F',
                boxShadow: mode === 'signup' ? '0 2px 8px rgba(43,18,22,0.1)' : 'none'
              }}
            >
              Create Shop
            </button>
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn}>
              <h2 style={{ margin: 0, color: '#2B1216', fontSize: '26px' }}>Welcome back</h2>
              <p style={{ color: '#8A7A5F', fontSize: '13.5px', marginTop: '6px', marginBottom: '20px' }}>Sign in to your RetailAI account</p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={function () { setRole('admin') }}
                  style={{
                    flex: '1', padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: '600',
                    border: role === 'admin' ? '1.5px solid #7A2331' : '1px solid #DCCEAE',
                    background: role === 'admin' ? '#F7E3E3' : '#FFFCF5',
                    color: role === 'admin' ? '#7A2331' : '#6B5636'
                  }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={function () { setRole('employee') }}
                  style={{
                    flex: '1', padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: '600',
                    border: role === 'employee' ? '1.5px solid #4A6741' : '1px solid #DCCEAE',
                    background: role === 'employee' ? '#E4EEDA' : '#FFFCF5',
                    color: role === 'employee' ? '#4A6741' : '#6B5636'
                  }}
                >
                  Employee
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} required style={inputStyle} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} required style={inputStyle} placeholder="••••••••" />
              </div>

              {error && <p style={{ color: '#93493A', fontSize: '13px', background: '#F2D6CE', padding: '10px 14px', borderRadius: '9px' }}>{error}</p>}

              <button type="submit" style={{
                width: '100%', padding: '15px', marginTop: '16px',
                background: role === 'admin' ? '#7A2331' : '#4A6741', color: '#FFF8EC', border: 'none',
                borderRadius: '11px', fontSize: '15.5px', fontWeight: '700'
              }}>
                Sign In &rarr;
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <h2 style={{ margin: 0, color: '#2B1216', fontSize: '26px' }}>Create Your Shop</h2>
              <p style={{ color: '#8A7A5F', fontSize: '13.5px', marginTop: '6px', marginBottom: '20px' }}>Register your store on RetailAI</p>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Shop Name</label>
                <input type="text" value={shopName} onChange={function (e) { setShopName(e.target.value) }} required style={inputStyle} placeholder="e.g. Style Studio" />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Owner Name</label>
                <input type="text" value={ownerName} onChange={function (e) { setOwnerName(e.target.value) }} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Phone</label>
                <input type="text" value={phone} onChange={function (e) { setPhone(e.target.value) }} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} required style={inputStyle} />
              </div>

              {error && <p style={{ color: '#93493A', fontSize: '13px', background: '#F2D6CE', padding: '10px 14px', borderRadius: '9px' }}>{error}</p>}

              <button type="submit" style={{
                width: '100%', padding: '15px', marginTop: '16px',
                background: '#C89B3C', color: '#2B1216', border: 'none',
                borderRadius: '11px', fontSize: '15.5px', fontWeight: '700'
              }}>
                Create Shop
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage