function EmployeeDashboard({ employeeName, role }) {
  let description = 'Use the sidebar to access your tools.'
  if (role === 'Cashier') description = 'You have access to Billing, Products, and Customers.'
  if (role === 'Salesperson') description = 'You have access to Products, Customers, and Billing.'
  if (role === 'Manager') description = 'You have full access to Products, Customers, Billing, Discounts, and Returns.'

  return (
    <div style={{ padding: '30px' }}>
      <h1>Welcome, {employeeName}</h1>
      <div style={{ background: '#FFFDF7', border: '1px solid #EDE6D6', borderRadius: '12px', padding: '18px', display: 'inline-block', marginTop: '10px' }}>
        <div style={{ fontSize: '12px', color: '#8A7A5F' }}>ROLE</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#B5651D', marginTop: '4px' }}>{role}</div>
      </div>
      <p style={{ color: '#8A7A5F', marginTop: '20px' }}>{description}</p>
    </div>
  )
}

export default EmployeeDashboard
