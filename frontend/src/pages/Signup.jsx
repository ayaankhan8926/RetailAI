import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Signup({ onSignupSuccess }) {
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

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
      const adminData = {
        name: ownerName,
        shop_id: response.data.shop_id
      }
      localStorage.setItem('admin', JSON.stringify(adminData))
      onSignupSuccess(adminData)
      navigate('/')
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Signup failed. Please try again.'
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
          Your store.<br />Your <span style={{ color: '#E8B77E', fontStyle: 'italic' }}>own account</span>.
        </h1>
        <p style={{ color: '#E8D9BE', fontSize: '16px', lineHeight: '1.7', maxWidth: '420px' }}>
          Start managing your own clothing store with AI-powered insights, billing, and inventory tracking.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '35px', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,248,236,0.1)', border: '1px solid rgba(255,248,236,0.25)', color: '#FFF8EC', padding: '7px 16px', borderRadius: '20px', fontSize: '13px' }}>
            &#9679; Free to Start
          </span>
          <span style={{ background: 'rgba(255,248,236,0.1)', border: '1px solid rgba(255,248,236,0.25)', color: '#FFF8EC', padding: '7px 16px', borderRadius: '20px', fontSize: '13px' }}>
            &#9679; Isolated Shop Data
          </span>
        </div>

        <div style={{
          marginTop: '45px', background: 'rgba(255,248,236,0.08)', border: '1px solid rgba(255,248,236,0.2)',
          borderRadius: '16px', padding: '20px 24px', maxWidth: '340px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#E8B77E' }}>Your own dashboard</div>
          <div style={{ fontSize: '13px', color: '#E8D9BE', marginTop: '4px' }}>Products, customers, billing and AI insights, fully separate from other shops on RetailAI.</div>
        </div>
      </div>

      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3ECDF', padding: '40px', overflowY: 'auto' }}>
        <form onSubmit={handleSignup} style={{ width: '100%', maxWidth: '400px', padding: '30px 0' }}>
          <div style={{ fontSize: '34px' }}>&#127976;</div>
          <h2 style={{ margin: '14px 0 0', color: '#211A10', fontSize: '28px' }}>Create Your Shop</h2>
          <p style={{ color: '#8A7A5F', fontSize: '13.5px', marginTop: '6px', marginBottom: '28px' }}>
            Register your store on RetailAI
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Shop Name</label><br />
            <input
              type="text"
              value={shopName}
              onChange={function (e) { setShopName(e.target.value) }}
              required
              placeholder="e.g. Style Studio"
              style={{ width: '100%', padding: '13px', marginTop: '6px', borderRadius: '10px', border: '1px solid #DCCEAE', background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Owner Name</label><br />
            <input
              type="text"
              value={ownerName}
              onChange={function (e) { setOwnerName(e.target.value) }}
              required
              style={{ width: '100%', padding: '13px', marginTop: '6px', borderRadius: '10px', border: '1px solid #DCCEAE', background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Email</label><br />
            <input
              type="email"
              value={email}
              onChange={function (e) { setEmail(e.target.value) }}
              required
              style={{ width: '100%', padding: '13px', marginTop: '6px', borderRadius: '10px', border: '1px solid #DCCEAE', background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Phone</label><br />
            <input
              type="text"
              value={phone}
              onChange={function (e) { setPhone(e.target.value) }}
              required
              style={{ width: '100%', padding: '13px', marginTop: '6px', borderRadius: '10px', border: '1px solid #DCCEAE', background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Password</label><br />
            <input
              type="password"
              value={password}
              onChange={function (e) { setPassword(e.target.value) }}
              required
              style={{ width: '100%', padding: '13px', marginTop: '6px', borderRadius: '10px', border: '1px solid #DCCEAE', background: '#FFFCF5', color: '#2C2418', fontSize: '14.5px' }}
            />
          </div>

          {error && <p style={{ color: '#93493A', fontSize: '13px', background: '#F2D6CE', padding: '10px 14px', borderRadius: '9px' }}>{error}</p>}

          <button type="submit" style={{
            width: '100%', padding: '15px', marginTop: '18px',
            background: '#C1702E', color: '#FFF8EC', border: 'none',
            borderRadius: '11px', fontSize: '15.5px', fontWeight: '700'
          }}>
            Create Shop
          </button>

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13.5px', color: '#8A7A5F' }}>
            Already have a shop? <a href="/admin-login" style={{ color: '#C1702E', fontWeight: '700' }}>Admin Login</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup