import { useState, useEffect } from 'react'
import axios from 'axios'
import { getShopId } from '../utils'

function Employees() {
  const [employees, setEmployees] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('Salesperson')
  const [joiningDate, setJoiningDate] = useState('')
  const [message, setMessage] = useState('')

  function loadEmployees() {
    axios.get('http://127.0.0.1:5000/employees?shop_id=' + getShopId()).then(function (res) { setEmployees(res.data) })
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const inputStyle = {
    padding: '11px', margin: '5px 0', borderRadius: '9px',
    border: '1px solid #E0CFA8', background: '#FAF6EE', color: '#2B2119', width: '100%'
  }

  async function handleSubmit() {
    if (!name || !email || !password || !phone || !joiningDate) {
      setMessage('Please fill all fields')
      return
    }
    try {
      await axios.post('http://127.0.0.1:5000/employees', {
        name: name,
        email: email,
        password: password,
        phone: phone,
        role: role,
        joining_date: joiningDate,
        shop_id: getShopId()
      })
      setMessage('Employee added successfully')
      setName('')
      setEmail('')
      setPassword('')
      setPhone('')
      setRole('Salesperson')
      setJoiningDate('')
      loadEmployees()
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message
      setMessage('Error: ' + errMsg)
    }
  }

  function roleBadge(role) {
    let bg = '#F0E4CE'
    let color = '#7A2331'
    if (role === 'Manager') { bg = '#DCE7CD'; color = '#4A6741' }
    if (role === 'Cashier') { bg = '#F2E2B8'; color = '#8A6D1F' }
    if (role === 'Salesperson') { bg = '#F2D6CE'; color = '#93493A' }
    return { background: bg, color: color, padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' }
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(120deg, #2B1216 0%, #4A1E24 60%, #7A2331 130%)',
        padding: '34px 40px', color: '#FFF8EC'
      }}>
        <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#E8C88A', textTransform: 'uppercase', marginBottom: '8px' }}>
          Team Management
        </div>
        <h1 style={{ color: '#FFF8EC', margin: 0 }}>Employees</h1>
        <p style={{ color: '#E8D9C8', fontSize: '13.5px', marginTop: '8px', maxWidth: '460px' }}>
          Manage your team and their access levels.
        </p>
      </div>

      <div style={{ padding: '30px 40px' }}>
        <div style={{ background: '#FFFEFB', padding: '26px', borderRadius: '16px', maxWidth: '460px', marginBottom: '35px', border: '1px solid #F0E4CE', boxShadow: '0 6px 22px rgba(43, 18, 22, 0.07)' }}>
          <h3 style={{ marginTop: 0 }}>Add New Employee</h3>

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Name</label>
            <input type="text" style={inputStyle} value={name} onChange={function (e) { setName(e.target.value) }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Email</label>
            <input type="email" style={inputStyle} value={email} onChange={function (e) { setEmail(e.target.value) }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Password</label>
            <input type="text" style={inputStyle} value={password} onChange={function (e) { setPassword(e.target.value) }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Phone</label>
            <input type="text" style={inputStyle} value={phone} onChange={function (e) { setPhone(e.target.value) }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: '1' }}>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Role</label>
              <select style={inputStyle} value={role} onChange={function (e) { setRole(e.target.value) }}>
                <option value="Salesperson">Salesperson</option>
                <option value="Cashier">Cashier</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div style={{ flex: '1' }}>
              <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Joining Date</label>
              <input type="date" style={inputStyle} value={joiningDate} onChange={function (e) { setJoiningDate(e.target.value) }} />
            </div>
          </div>

          <button onClick={handleSubmit} style={{
            marginTop: '15px', padding: '12px 22px', background: '#7A2331',
            color: '#FFF8EC', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600'
          }}>
            Add Employee
          </button>

          {message && <p style={{ marginTop: '12px', color: '#4A6741', fontSize: '13.5px' }}>{message}</p>}
        </div>

        <h3>Employee List</h3>
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joining Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(function (emp) {
              return (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td><span style={roleBadge(emp.role)}>{emp.role}</span></td>
                  <td>{emp.joining_date}</td>
                  <td>{emp.status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Employees