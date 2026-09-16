import { useState, useEffect } from 'react'
import axios from 'axios'
import { getShopId } from '../utils'

function Returns() {
  const [returns, setReturns] = useState([])
  const [bills, setBills] = useState([])
  const [products, setProducts] = useState([])
  const [billId, setBillId] = useState('')
  const [productId, setProductId] = useState('')
  const [type, setType] = useState('Return')
  const [exchangedProductId, setExchangedProductId] = useState('')
  const [reason, setReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [message, setMessage] = useState('')

  function loadReturns() {
    axios.get('http://127.0.0.1:5000/returns?shop_id=' + getShopId()).then(function (res) { setReturns(res.data) })
  }

  useEffect(() => {
    loadReturns()
    axios.get('http://127.0.0.1:5000/bills?shop_id=' + getShopId()).then(function (res) { setBills(res.data) })
    axios.get('http://127.0.0.1:5000/products?shop_id=' + getShopId()).then(function (res) { setProducts(res.data) })
  }, [])

  const inputStyle = {
    padding: '11px', margin: '5px 0', borderRadius: '9px',
    border: '1px solid #E0CFA8', background: '#FAF6EE', color: '#2B2119', width: '100%'
  }

  async function handleSubmit() {
    if (!billId || !productId) {
      setMessage('Please select bill and product')
      return
    }
    try {
      await axios.post('http://127.0.0.1:5000/returns', {
        bill_id: parseInt(billId),
        product_id: parseInt(productId),
        type: type,
        exchanged_product_id: type === 'Exchange' && exchangedProductId ? parseInt(exchangedProductId) : null,
        reason: reason,
        refund_amount: refundAmount ? parseFloat(refundAmount) : 0,
        shop_id: getShopId()
      })
      setMessage('Return/Exchange recorded successfully')
      setBillId('')
      setProductId('')
      setReason('')
      setRefundAmount('')
      setExchangedProductId('')
      loadReturns()
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
          Customer Service
        </div>
        <h1 style={{ color: '#FFF8EC', margin: 0 }}>Returns &amp; Exchange</h1>
        <p style={{ color: '#E8D9C8', fontSize: '13.5px', marginTop: '8px', maxWidth: '460px' }}>
          Record customer returns and exchanges, with automatic stock adjustment.
        </p>
      </div>

      <div style={{ padding: '30px 40px' }}>
        <div style={{ background: '#FFFEFB', padding: '26px', borderRadius: '16px', maxWidth: '460px', marginBottom: '35px', border: '1px solid #F0E4CE', boxShadow: '0 6px 22px rgba(43, 18, 22, 0.07)' }}>
          <h3 style={{ marginTop: 0 }}>Record New Return/Exchange</h3>

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Bill</label>
            <select style={inputStyle} value={billId} onChange={function (e) { setBillId(e.target.value) }}>
              <option value="">-- Select Bill --</option>
              {bills.map(function (b) {
                return <option key={b.bill_id} value={b.bill_id}>Bill Number {b.bill_id} - {b.customer_name} (Rs.{b.total_amount})</option>
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Product</label>
            <select style={inputStyle} value={productId} onChange={function (e) { setProductId(e.target.value) }}>
              <option value="">-- Select Product --</option>
              {products.map(function (p) {
                return <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Type</label>
            <select style={inputStyle} value={type} onChange={function (e) { setType(e.target.value) }}>
              <option value="Return">Return</option>
              <option value="Exchange">Exchange</option>
            </select>
          </div>

          {type === 'Exchange' && (
            <div>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Exchanged For</label>
              <select style={inputStyle} value={exchangedProductId} onChange={function (e) { setExchangedProductId(e.target.value) }}>
                <option value="">-- Select New Product --</option>
                {products.map(function (p) {
                  return <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                })}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Reason</label>
            <input type="text" style={inputStyle} value={reason} onChange={function (e) { setReason(e.target.value) }} />
          </div>

          {type === 'Return' && (
            <div>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Refund Amount</label>
              <input type="number" style={inputStyle} value={refundAmount} onChange={function (e) { setRefundAmount(e.target.value) }} />
            </div>
          )}

          <button onClick={handleSubmit} style={{
            marginTop: '15px', padding: '12px 22px', background: '#7A2331',
            color: '#FFF8EC', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600'
          }}>
            Submit
          </button>

          {message && <p style={{ marginTop: '12px', color: '#4A6741', fontSize: '13.5px' }}>{message}</p>}
        </div>

        <h3>Return/Exchange History</h3>
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Returned Product</th>
              <th>Type</th>
              <th>Exchanged For</th>
              <th>Reason</th>
              <th>Refund</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {returns.map(function (r) {
              return (
                <tr key={r.return_id}>
                  <td>{r.bill_id}</td>
                  <td>{r.returned_product}</td>
                  <td>{r.type}</td>
                  <td>{r.exchanged_for || '-'}</td>
                  <td>{r.reason}</td>
                  <td>Rs.{r.refund_amount}</td>
                  <td>{r.return_date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Returns