import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function ShopSignup() {
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post('https://retailai-backend-0onv.onrender.com/shop/signup', {
        shop_name: shopName,
        owner_name: ownerName,
        owner_email: email,
        password: password
      })
      setSuccess(true)
      setTimeout(function () { navigate('/admin-login') }, 2000)
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Signup failed. Please try again.'
      setError(msg)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F1E8' }}>
      <div style={{
        flex: '1',
        background: 'linear-gradient(150deg, #2E2419 0%, #4A3620 55%, #B5651D 130%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        color: '#FFF8EC', padding: '40px'
      }}>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🏬</div>
        <h1 style={{ color: '#FFF8EC', fontSize: '38px', marginBottom: '10px' }}>RetailAI</h1>
        <p style={{ color: '#E8D9BE', fontSize: '15px', textAlign: 'center', maxWidth: '320px', lineHeight: '1.6' }}>
          Set up your own store on RetailAI in seconds. Your products, customers, and bills stay completely private to your shop.
        </p>
      </div>

      <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {success ? (
          <div style={{
            background: '#FFFDF7', padding: '48px', borderRadius: '18px', width: '380px',
            textAlign: 'center', boxShadow: '0 10px 40px rgba(58, 50, 38, 0.12)', border: '1px solid #EDE6D6'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
            <h2 style={{ color: '#4A6741' }}>Shop Created!</h2>
            <p style={{ color: '#8A7A5F', fontSize: '14px' }}>Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSignup} style={{
            background: '#FFFDF7', padding: '48px', borderRadius: '18px', width: '380px',
            color: '#3A3226', boxShadow: '0 10px 40px rgba(58, 50, 38, 0.12)', border: '1px solid #EDE6D6'
          }}>
            <h2 style={{ margin: 0, color: '#2E2419', fontSize: '24px' }}>Register Your Shop</h2>
            <p style={{ color: '#8A7A5F', fontSize: '13px', marginTop: '6px', marginBottom: '28px' }}>
              Create your store's own private workspace
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Shop Name</label><br />
              <input type="text" value={shopName} onChange={function (e) { setShopName(e.target.value) }} required
                placeholder="e.g. Kanchi Silks"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '9px', border: '1px solid #D8CBAE', background: '#F5F1E8', color: '#3A3226', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Your Name</label><br />
              <input type="text" value={ownerName} onChange={function (e) { setOwnerName(e.target.value) }} required
                placeholder="e.g. Priya Sharma"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '9px', border: '1px solid #D8CBAE', background: '#F5F1E8', color: '#3A3226', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Email</label><br />
              <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} required
                placeholder="owner@yourstore.com"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '9px', border: '1px solid #D8CBAE', background: '#F5F1E8', color: '#3A3226', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', color: '#6B5636', fontWeight: '600' }}>Password</label><br />
              <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '9px', border: '1px solid #D8CBAE', background: '#F5F1E8', color: '#3A3226', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            {error && <p style={{ color: '#93493A', fontSize: '13px', background: '#F2D6CE', padding: '8px 12px', borderRadius: '8px' }}>{error}</p>}

            <button type="submit" style={{
              width: '100%', padding: '14px', marginTop: '18px', background: '#B5651D',
              color: '#FFF8EC', border: 'none', borderRadius: '9px', fontSize: '15px', fontWeight: '600'
            }}>
              Create My Shop
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#8A7A5F' }}>
              Already have a shop? <Link to="/admin-login" style={{ color: '#B5651D', fontWeight: '600' }}>Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ShopSignup
