import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart } from '../utils'

function Cart() {
  const [items, setItems] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setItems(getCart())
  }, [])

  function removeItem(productId) {
    const newCart = items.filter(function (item) { return item.product_id !== productId })
    setItems(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  let subtotal = 0
  for (let i = 0; i < items.length; i++) {
    subtotal = subtotal + (items[i].selling_price * items[i].quantity)
  }
  const gst = subtotal * 0.05
  const total = subtotal + gst

  return (
    <div>
      <div style={{
        background: 'linear-gradient(120deg, #2B1216 0%, #4A1E24 60%, #7A2331 130%)',
        padding: '34px 40px', color: '#FFF8EC',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px'
      }}>
        <div>
          <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#E8C88A', textTransform: 'uppercase', marginBottom: '8px' }}>
            Shopping Cart
          </div>
          <h1 style={{ color: '#FFF8EC', margin: 0 }}>Your Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>
        </div>
        <button
          onClick={function () { navigate('/products') }}
          style={{ padding: '11px 22px', background: '#C89B3C', color: '#2B1216', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700' }}
        >
          &larr; Continue Shopping
        </button>
      </div>

      <div style={{ padding: '30px 40px' }}>
        {items.length === 0 ? (
          <p style={{ color: '#8A7A5F' }}>Your cart is empty. Browse products to add items.</p>
        ) : (
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2', minWidth: '340px' }}>
              {items.map(function (item) {
                return (
                  <div key={item.product_id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: '#FFFEFB', border: '1px solid #F0E4CE', borderRadius: '14px',
                    padding: '16px', marginBottom: '14px', boxShadow: '0 4px 16px rgba(43,18,22,0.05)'
                  }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', background: '#F0E4CE', flexShrink: 0 }}>
                      <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: '1' }}>
                      <div style={{ fontWeight: '700', color: '#2B1216' }}>{item.product_name}</div>
                      <div style={{ fontSize: '12.5px', color: '#8A7A5F', marginTop: '2px' }}>Brand: {item.brand}</div>
                      <div style={{ fontSize: '12.5px', color: '#8A7A5F' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#7A2331', fontSize: '17px' }}>Rs.{(item.selling_price * item.quantity).toFixed(2)}</div>
                    <button
                      onClick={function () { removeItem(item.product_id) }}
                      style={{ background: '#F2D6CE', color: '#93493A', border: 'none', borderRadius: '8px', padding: '9px 14px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ background: '#FFFEFB', border: '1px solid #F0E4CE', borderRadius: '16px', padding: '26px', boxShadow: '0 6px 22px rgba(43,18,22,0.07)' }}>
                <h3 style={{ marginTop: 0 }}>Order Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#6B5636' }}>
                  <span>Subtotal</span><span>Rs.{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#6B5636' }}>
                  <span>GST (5%)</span><span>Rs.{gst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid #F0E4CE', marginTop: '8px', fontWeight: '800', fontSize: '19px', color: '#7A2331', fontFamily: "'Playfair Display', serif" }}>
                  <span>Total</span><span>Rs.{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={function () { navigate('/billing') }}
                  style={{
                    width: '100%', padding: '15px', marginTop: '14px',
                    background: '#7A2331', color: '#FFF8EC', border: 'none',
                    borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  Proceed to Billing &rarr;
                </button>
                <p style={{ fontSize: '12px', color: '#8A7A5F', marginTop: '12px' }}>
                  Cart items are a reference only. Finalize the sale on the Billing page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart