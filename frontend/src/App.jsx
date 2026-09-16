import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import EmployeeSidebar from './components/EmployeeSidebar'
import AuthPage from './pages/AuthPage'
import EmployeeLogin from './pages/EmployeeLogin'
import EmployeeDashboard from './pages/EmployeeDashboard'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Customers from './pages/Customers'
import Billing from './pages/Billing'
import AIDashboard from './pages/AIDashboard'
import Discounts from './pages/Discounts'
import Returns from './pages/Returns'
import Employees from './pages/Employees'
import Cart from './pages/Cart'
import './App.css'

function App() {
  const [admin, setAdmin] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [checkedStorage, setCheckedStorage] = useState(false)

  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin')
    const savedEmployee = localStorage.getItem('employee')
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin))
    if (savedEmployee) setEmployee(JSON.parse(savedEmployee))
    setCheckedStorage(true)
  }, [])

  function handleAdminLogout() {
    localStorage.removeItem('admin')
    setAdmin(null)
  }

  function handleEmployeeLogout() {
    localStorage.removeItem('employee')
    setEmployee(null)
  }

  if (!checkedStorage) return null

  return (
    <BrowserRouter>
      {!admin && !employee ? (
        <AuthPage onAdminLogin={setAdmin} onEmployeeLogin={setEmployee} />
      ) : admin ? (
        <div style={{ display: 'flex' }}>
          <Sidebar adminName={admin.name} onLogout={handleAdminLogout} />
        <div style={{ marginLeft: '230px', width: 'calc(100vw - 230px)', minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
<Route path="/cart" element={<Cart />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/ai-dashboard" element={<AIDashboard />} />
              <Route path="/discounts" element={<Discounts />} />
              <Route path="/returns" element={<Returns />} />
<Route path="/employees" element={<Employees />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
     ) : (
        <div style={{ display: 'flex' }}>
          <EmployeeSidebar employeeName={employee.name} role={employee.role} onLogout={handleEmployeeLogout} />
         <div style={{ marginLeft: '230px', width: 'calc(100vw - 230px)', minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<EmployeeDashboard employeeName={employee.name} role={employee.role} />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
<Route path="/cart" element={<Cart />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/billing" element={<Billing />} />
              {employee.role === 'Manager' && <Route path="/discounts" element={<Discounts />} />}
              {employee.role === 'Manager' && <Route path="/returns" element={<Returns />} />}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      )}
    </BrowserRouter>
  )
}

export default App
