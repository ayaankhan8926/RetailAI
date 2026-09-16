import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { exportToCSV, getShopId } from '../utils'

function Dashboard() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [bills, setBills] = useState([])
  const [inventory, setInventory] = useState([])
  const [profit, setProfit] = useState(null)
  const [demand, setDemand] = useState([])
  const [billsChartData, setBillsChartData] = useState([])

  useEffect(() => {
    const shopId = getShopId()
    axios.get('http://127.0.0.1:5000/products?shop_id=' + shopId).then(function (res) { setProducts(res.data) })
    axios.get('http://127.0.0.1:5000/customers?shop_id=' + shopId).then(function (res) { setCustomers(res.data) })
    axios.get('http://127.0.0.1:5000/inventory?shop_id=' + shopId).then(function (res) { setInventory(res.data) })
    axios.get('http://127.0.0.1:5000/ai/profit-prediction?shop_id=' + shopId).then(function (res) { setProfit(res.data) })
    axios.get('http://127.0.0.1:5000/ai/demand-prediction?shop_id=' + shopId).then(function (res) {
      setDemand(Array.isArray(res.data) ? res.data : [])
    })
    axios.get('http://127.0.0.1:5000/bills?shop_id=' + shopId).then(function (res) {
      setBills(res.data)
      const sorted = [...res.data].sort(function (a, b) { return new Date(a.bill_date) - new Date(b.bill_date) })
      const chartData = sorted.map(function (bill) {
        return {
          date: new Date(bill.bill_date).toLocaleDateString(),
          amount: parseFloat(bill.total_amount)
        }
      })
      setBillsChartData(chartData)
    })
  }, [])

  let totalRevenue = 0
  for (let i = 0; i < bills.length; i++) {
    totalRevenue = totalRevenue + parseFloat(bills[i].total_amount || 0)
  }

  const lowStockItems = inventory.filter(function (item) { return item.quantity <= item.reorder_level })
  const [restockMsg, setRestockMsg] = useState('')

  async function handleRestock(inventoryId, productName, currentQty) {
    const amount = prompt('How many units to add to "' + productName + '"? (Current stock: ' + currentQty + ')')
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) return

    const item = inventory.find(function (i) { return i.inventory_id === inventoryId })
    if (!item) {
      setRestockMsg('Error: could not find that product')
      return
    }
    try {
      await axios.post('http://127.0.0.1:5000/inventory/restock', {
        product_id: item.product_id,
        quantity: parseInt(amount)
      })
      setRestockMsg('Stock updated for ' + productName)
      const res = await axios.get('http://127.0.0.1:5000/inventory?shop_id=' + getShopId())
      setInventory(res.data)
      setTimeout(function () { setRestockMsg('') }, 2500)
    } catch (error) {
      setRestockMsg('Error updating stock')
    }
  }
  const cardStyle = {
    background: '#FFFEFB',
    color: '#2B2119',
    borderRadius: '14px',
    padding: '22px',
    minWidth: '190px',
    flex: '1',
    boxShadow: '0 4px 16px rgba(43, 18, 22, 0.06)',
    border: '1px solid #F0E4CE'
  }

  const numberStyle = {
    fontSize: '30px',
    fontWeight: 'bold',
    margin: '8px 0',
    color: '#7A2331',
    fontFamily: "'Playfair Display', serif"
  }

  const labelStyle = { fontSize: '12.5px', color: '#8A7A5F', letterSpacing: '0.4px' }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(120deg, #2B1216 0%, #4A1E24 60%, #7A2331 130%)',
        padding: '34px 40px', color: '#FFF8EC',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px'
      }}>
        <div>
          <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#E8C88A', textTransform: 'uppercase', marginBottom: '8px' }}>
            Overview
          </div>
          <h1 style={{ color: '#FFF8EC', margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#E8D9C8', fontSize: '13.5px', marginTop: '8px' }}>
            A live snapshot of your store's performance.
          </p>
        </div>
        <button
          onClick={function () { exportToCSV(bills, 'sales_report') }}
          style={{ padding: '11px 22px', background: '#C89B3C', color: '#2B1216', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700' }}
        >
          Export Sales Report
        </button>
      </div>

      <div style={{ padding: '30px 40px' }}>
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <div style={labelStyle}>TOTAL PRODUCTS</div>
            <div style={numberStyle}>{products.length}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>TOTAL CUSTOMERS</div>
            <div style={numberStyle}>{customers.length}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>TOTAL BILLS</div>
            <div style={numberStyle}>{bills.length}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>TOTAL REVENUE</div>
            <div style={numberStyle}>Rs.{totalRevenue.toFixed(2)}</div>
          </div>

          <div style={{ ...cardStyle, background: lowStockItems.length > 0 ? '#F7DCC6' : '#FFFEFB', border: lowStockItems.length > 0 ? '1px solid #D4956B' : '1px solid #F0E4CE' }}>
            <div style={labelStyle}>LOW STOCK ALERTS</div>
            <div style={numberStyle}>{lowStockItems.length}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>PREDICTED MONTHLY PROFIT</div>
            <div style={numberStyle}>
              {profit && profit.predicted_monthly_profit !== undefined ? ('Rs.' + profit.predicted_monthly_profit) : 'Rs.0'}
            </div>
          </div>
        </div>

      {lowStockItems.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h2>Low Stock Products</h2>
            {restockMsg && <p style={{ color: '#4A6741', fontWeight: '600' }}>{restockMsg}</p>}
            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(function (item, idx) {
                  return (
                    <tr key={idx}>
                      <td>{item.product_name}</td>
                      <td>{item.brand}</td>
                      <td>{item.quantity}</td>
                      <td>{item.reorder_level}</td>
                      <td>
                                                <button
                          onClick={function () { handleRestock(item.inventory_id, item.product_name, item.quantity) }}
                          style={{ padding: '7px 14px', background: '#7A2331', color: '#FFF8EC', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {billsChartData.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h2>Revenue Trend</h2>
            <div style={{ background: '#FFFEFB', borderRadius: '14px', padding: '18px', border: '1px solid #F0E4CE', boxShadow: '0 4px 16px rgba(43, 18, 22, 0.05)' }}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={billsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E4CE" />
                  <XAxis dataKey="date" stroke="#7A2331" />
                  <YAxis stroke="#7A2331" />
                  <Tooltip contentStyle={{ background: '#FFFEFB', border: '1px solid #F0E4CE', color: '#2B2119' }} />
                  <Line type="monotone" dataKey="amount" stroke="#7A2331" strokeWidth={3} dot={{ r: 5, fill: '#C89B3C' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {demand.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h2>Predicted Demand (Next 30 Days)</h2>
            <div style={{ background: '#FFFEFB', borderRadius: '14px', padding: '18px', border: '1px solid #F0E4CE', boxShadow: '0 4px 16px rgba(43, 18, 22, 0.05)' }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={demand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E4CE" />
                  <XAxis dataKey="product_name" stroke="#7A2331" />
                  <YAxis stroke="#7A2331" />
                  <Tooltip contentStyle={{ background: '#FFFEFB', border: '1px solid #F0E4CE', color: '#2B2119' }} />
                  <Bar dataKey="predicted_demand_next_30_days" fill="#C89B3C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard