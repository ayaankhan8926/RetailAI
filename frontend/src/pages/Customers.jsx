import { useState, useEffect } from 'react'
import axios from 'axios'
import { exportToCSV, getShopId } from '../utils'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [addMessage, setAddMessage] = useState('')

  function loadCustomers() {
    axios.get('http://127.0.0.1:5000/customers?shop_id=' + getShopId())
      .then(function (response) { setCustomers(response.data) })
      .catch(function (error) { console.error('Error fetching customers:', error) })
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  async function handleAddCustomer() {
    if (!newName || !newPhone) {
      setAddMessage('Please fill at least name and phone')
      return
    }
    try {
      await axios.post('http://127.0.0.1:5000/customers', {
        name: newName,
        phone: newPhone,
        email: newEmail,
        address: newAddress,
        shop_id: getShopId()
      })
      setAddMessage('Customer added successfully')
      setNewName('')
      setNewPhone('')
      setNewEmail('')
      setNewAddress('')
      loadCustomers()
      setTimeout(function () { setShowAddForm(false); setAddMessage('') }, 1200)
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message
      setAddMessage('Error: ' + errMsg)
    }
  }

  function segmentStyle(segment) {
    let bg = '#F0E4CE'
    let color = '#7A2331'
    if (segment === 'Frequent') { bg = '#DCE7CD'; color = '#4A6741' }
    if (segment === 'Occasional') { bg = '#F2E2B8'; color = '#8A6D1F' }
    if (segment === 'One-time') { bg = '#F2D6CE'; color = '#93493A' }
    return {
      background: bg,
      color: color,
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600'
    }
  }

  const inputStyle = {
    padding: '11px', margin: '5px 0', borderRadius: '9px',
    border: '1px solid #E0CFA8', background: '#FAF6EE', color: '#2B2119', width: '100%'
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(120deg, #2B1216 0%, #4A1E24 60%, #7A2331 130%)',
        padding: '34px 40px', color: '#FFF8EC',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px'
      }}>
        <div>
          <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#E8C88A', textTransform: 'uppercase', marginBottom: '8px' }}>
            Customer Relations
          </div>
          <h1 style={{ color: '#FFF8EC', margin: 0 }}>Customer List</h1>
          <p style={{ color: '#E8D9C8', fontSize: '13.5px', marginTop: '8px', maxWidth: '460px' }}>
            {customers.length} customers, segmented automatically by AI.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={function () { setShowAddForm(!showAddForm) }}
            style={{ padding: '11px 22px', background: '#4A6741', color: '#FFF8EC', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700' }}
          >
            {showAddForm ? 'Cancel' : '+ Add Customer'}
          </button>
          <button
            onClick={function () { exportToCSV(customers, 'customers_report') }}
            style={{ padding: '11px 22px', background: '#C89B3C', color: '#2B1216', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700' }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ padding: '30px 40px' }}>
        {showAddForm && (
          <div style={{ background: '#FFFEFB', padding: '26px', borderRadius: '16px', maxWidth: '460px', marginBottom: '35px', border: '1px solid #F0E4CE', boxShadow: '0 6px 22px rgba(43, 18, 22, 0.07)' }}>
            <h3 style={{ marginTop: 0 }}>Add New Customer</h3>

            <div>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Name</label>
              <input type="text" style={inputStyle} value={newName} onChange={function (e) { setNewName(e.target.value) }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Phone</label>
              <input type="text" style={inputStyle} value={newPhone} onChange={function (e) { setNewPhone(e.target.value) }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Email (optional)</label>
              <input type="email" style={inputStyle} value={newEmail} onChange={function (e) { setNewEmail(e.target.value) }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Address (optional)</label>
              <input type="text" style={inputStyle} value={newAddress} onChange={function (e) { setNewAddress(e.target.value) }} />
            </div>

            <button onClick={handleAddCustomer} style={{
              marginTop: '15px', padding: '12px 22px', background: '#7A2331',
              color: '#FFF8EC', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600'
            }}>
              Save Customer
            </button>

            {addMessage && <p style={{ marginTop: '12px', color: '#4A6741', fontSize: '13.5px' }}>{addMessage}</p>}
          </div>
        )}

        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Segment</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(function (customer) {
              return (
                <tr key={customer.customer_id}>
                  <td>{customer.customer_id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.address || '-'}</td>
                  <td>
                    <span style={segmentStyle(customer.segment)}>
                      {customer.segment || 'One-time'}
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

export default Customers