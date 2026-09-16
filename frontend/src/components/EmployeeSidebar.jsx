import { Link, useLocation } from 'react-router-dom'

function EmployeeSidebar({ employeeName, role, onLogout }) {
  const location = useLocation()

  function linkStyle(path) {
    const isActive = location.pathname === path
    return {
      display: 'block',
      padding: '13px 24px',
      color: isActive ? '#FFF8EC' : '#D9C0A8',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: isActive ? '600' : '400',
      background: isActive ? '#7A2331' : 'transparent',
      borderRadius: '8px',
      margin: '4px 12px'
    }
  }

  let links = [{ path: '/', label: 'Home' }]

  if (role === 'Cashier') {
    links.push({ path: '/billing', label: 'Billing' })
    links.push({ path: '/products', label: 'Products' })
    links.push({ path: '/customers', label: 'Customers' })
  } else if (role === 'Salesperson') {
    links.push({ path: '/products', label: 'Products' })
    links.push({ path: '/customers', label: 'Customers' })
    links.push({ path: '/billing', label: 'Billing' })
  } else if (role === 'Manager') {
    links.push({ path: '/products', label: 'Products' })
    links.push({ path: '/customers', label: 'Customers' })
    links.push({ path: '/billing', label: 'Billing' })
    links.push({ path: '/discounts', label: 'Discounts' })
    links.push({ path: '/returns', label: 'Returns' })
  }
  links.push({ path: '/cart', label: 'Cart' })

  return (
    <div style={{
      width: '230px',
      minHeight: '100vh',
      background: '#2B1216',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '10px'
    }}>
      <div style={{ padding: '20px 24px 10px' }}>
        <h2 style={{ color: '#FFF8EC', margin: 0, fontSize: '22px' }}>RetailAI</h2>
        <div style={{ color: '#C89B3C', fontSize: '12px', marginTop: '2px' }}>Jashn Collection</div>
      </div>

      <div style={{ color: '#D9C0A8', padding: '15px 24px', fontSize: '13px', borderTop: '1px solid #451A20', borderBottom: '1px solid #451A20', margin: '10px 0' }}>
        {employeeName}
        <div style={{ fontSize: '11px', color: '#C89B3C', marginTop: '3px' }}>{role}</div>
      </div>

      <div style={{ marginTop: '10px' }}>
        {links.map(function (link) {
          return <Link key={link.path} to={link.path} style={linkStyle(link.path)}>{link.label}</Link>
        })}
      </div>

      <button
        onClick={onLogout}
        style={{
          marginTop: 'auto', margin: '20px', padding: '11px',
          background: '#93493A', color: '#FFF8EC', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default EmployeeSidebar