import { useState, useEffect } from 'react'
import axios from 'axios'
import { getShopId } from '../utils'

function Discounts() {
  const [discounts, setDiscounts] = useState([])
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [discountType, setDiscountType] = useState('Percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')

  function loadDiscounts() {
    axios.get('https://retailai-backend-0onv.onrender.com/discounts?shop_id=' + getShopId()).then(function (res) { setDiscounts(res.data) })
  }

  useEffect(() => {
    loadDiscounts()
    axios.get('https://retailai-backend-0onv.onrender.com/products?shop_id=' + getShopId()).then(function (res) { setProducts(res.data) })
  }, [])

  const inputStyle = {
    padding: '11px', margin: '5px 0', borderRadius: '9px',
    border: '1px solid #E0CFA8', background: '#FAF6EE', color: '#2B2119', width: '100%'
  }

  async function handleSubmit() {
    if (!discountValue || !startDate || !endDate) {
      setMessage('Please fill all fields')
      return
    }
    try {
      await axios.post('https://retailai-backend-0onv.onrender.com/discounts', {
        product_id: productId ? parseInt(productId) : null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        start_date: startDate,
        end_date: endDate,
        status: 'Active',
        shop_id: getShopId()
      })
      setMessage('Discount added successfully')
      setProductId('')
      setDiscountValue('')
      setStartDate('')
      setEndDate('')
      loadDiscounts()
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message
      setMessage('Error: ' + errMsg)
    }
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(120deg, #2B1216 0%, #4A1E24 60%, #7A2331 130%)',
        padding: '34px 40px', color: '#FFF8EC'
      }}>
        <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#E8C88A', textTransform: 'uppercase', marginBottom: '8px' }}>
          Promotions
        </div>
        <h1 style={{ color: '#FFF8EC', margin: 0 }}>Discounts</h1>
        <p style={{ color: '#E8D9C8', fontSize: '13.5px', marginTop: '8px', maxWidth: '460px' }}>
          Create store-wide or product-specific promotions to drive sales.
        </p>
      </div>

      <div style={{ padding: '30px 40px' }}>
        <div style={{ background: '#FFFEFB', padding: '26px', borderRadius: '16px', maxWidth: '460px', marginBottom: '35px', border: '1px solid #F0E4CE', boxShadow: '0 6px 22px rgba(43, 18, 22, 0.07)' }}>
          <h3 style={{ marginTop: 0 }}>Add New Discount</h3>

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Product (leave blank for store-wide)</label>
            <select style={inputStyle} value={productId} onChange={function (e) { setProductId(e.target.value) }}>
              <option value="">-- Store-wide --</option>
              {products.map(function (p) {
                return <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
              })}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: '1' }}>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Type</label>
              <select style={inputStyle} value={discountType} onChange={function (e) { setDiscountType(e.target.value) }}>
                <option value="Percentage">Percentage</option>
                <option value="Flat">Flat</option>
              </select>
            </div>
            <div style={{ flex: '1' }}>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Value</label>
              <input type="number" style={inputStyle} value={discountValue} onChange={function (e) { setDiscountValue(e.target.value) }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: '1' }}>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Start Date</label>
              <input type="date" style={inputStyle} value={startDate} onChange={function (e) { setStartDate(e.target.value) }} />
            </div>
            <div style={{ flex: '1' }}>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>End Date</label>
              <input type="date" style={inputStyle} value={endDate} onChange={function (e) { setEndDate(e.target.value) }} />
            </div>
          </div>

          <button onClick={handleSubmit} style={{
            marginTop: '15px', padding: '12px 22px', background: '#7A2331',
            color: '#FFF8EC', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600'
          }}>
            Add Discount
          </button>

          {message && <p style={{ marginTop: '12px', color: '#4A6741', fontSize: '13.5px' }}>{message}</p>}
        </div>

        <h3>Existing Discounts</h3>
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Value</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map(function (d) {
              return (
                <tr key={d.discount_id}>
                  <td>{d.product_name || 'Store-wide'}</td>
                  <td>{d.discount_type}</td>
                  <td>{d.discount_value}</td>
                  <td>{d.start_date}</td>
                  <td>{d.end_date}</td>
                  <td>
                    <span style={{ background: '#DCE7CD', color: '#4A6741', padding: '3px 10px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '600' }}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Discounts
