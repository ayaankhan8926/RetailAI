import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getShopId } from '../utils'

function AIDashboard() {
  const [bestSeller, setBestSeller] = useState(null)
  const [slowMoving, setSlowMoving] = useState([])
  const [demand, setDemand] = useState([])
  const [reorder, setReorder] = useState([])
  const [profit, setProfit] = useState(null)
  const [segmentation, setSegmentation] = useState([])

  useEffect(() => {
    const shopId = getShopId()
    axios.get('https://retailai-backend-0onv.onrender.com/ai/best-seller?shop_id=' + shopId).then(function (res) { setBestSeller(res.data) })
    axios.get('https://retailai-backend-0onv.onrender.com/ai/slow-moving?shop_id=' + shopId).then(function (res) { setSlowMoving(Array.isArray(res.data) ? res.data : []) })
    axios.get('https://retailai-backend-0onv.onrender.com/ai/demand-prediction?shop_id=' + shopId).then(function (res) { setDemand(Array.isArray(res.data) ? res.data : []) })
    axios.get('https://retailai-backend-0onv.onrender.com/ai/reorder-recommendation?shop_id=' + shopId).then(function (res) { setReorder(Array.isArray(res.data) ? res.data : []) })
    axios.get('https://retailai-backend-0onv.onrender.com/ai/profit-prediction?shop_id=' + shopId).then(function (res) { setProfit(res.data) })
    axios.get('https://retailai-backend-0onv.onrender.com/ai/customer-segmentation?shop_id=' + shopId).then(function (res) { setSegmentation(Array.isArray(res.data) ? res.data : []) })
  }, [])

  const sectionStyle = {
    background: '#FFFEFB',
    color: '#2B2119',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '25px',
    border: '1px solid #F0E4CE',
    boxShadow: '0 4px 16px rgba(43, 18, 22, 0.06)'
  }

  const tableStyle = { borderCollapse: 'collapse', width: '100%', marginTop: '10px' }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(120deg, #2B1216 0%, #4A1E24 60%, #7A2331 130%)',
        padding: '34px 40px', color: '#FFF8EC'
      }}>
        <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#E8C88A', textTransform: 'uppercase', marginBottom: '8px' }}>
          Machine Learning Insights
        </div>
        <h1 style={{ color: '#FFF8EC', margin: 0 }}>AI Dashboard</h1>
        <p style={{ color: '#E8D9C8', fontSize: '13.5px', marginTop: '8px', maxWidth: '460px' }}>
          Demand forecasts, reorder recommendations, and customer segmentation, powered by your sales data.
        </p>
      </div>

      <div style={{ padding: '30px 40px' }}>
        <div style={sectionStyle}>
          <h2>Best Seller Prediction</h2>
          {bestSeller && bestSeller.top_brand ? (
            <div style={{ display: 'flex', gap: '30px', marginTop: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div><strong style={{ color: '#7A2331' }}>Top Brand:</strong> {bestSeller.top_brand}</div>
              <div><strong style={{ color: '#7A2331' }}>Top Color:</strong> {bestSeller.top_color}</div>
              <div><strong style={{ color: '#7A2331' }}>Top Size:</strong> {bestSeller.top_size}</div>
            </div>
          ) : <p>Loading...</p>}

          {slowMoving.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[...slowMoving].sort(function (a, b) { return b.total_sold - a.total_sold })}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4CE" />
                <XAxis dataKey="product_name" stroke="#7A2331" />
                <YAxis stroke="#7A2331" />
                <Tooltip contentStyle={{ background: '#FFFEFB', border: '1px solid #F0E4CE', color: '#2B2119' }} />
                <Bar dataKey="total_sold" fill="#7A2331" radius={[6, 6, 0, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={sectionStyle}>
          <h2>Profit Prediction</h2>
          {profit && profit.total_profit_so_far !== undefined ? (
            <div style={{ display: 'flex', gap: '30px', marginTop: '10px', flexWrap: 'wrap' }}>
              <div><strong style={{ color: '#7A2331' }}>Total Profit So Far:</strong> Rs.{profit.total_profit_so_far}</div>
              <div><strong style={{ color: '#7A2331' }}>Predicted Monthly Profit:</strong> Rs.{profit.predicted_monthly_profit}</div>
            </div>
          ) : <p>Not enough sales data yet</p>}
        </div>

             <div style={sectionStyle}>
        <h2>Demand Prediction (Next 30 Days)</h2>
        <p style={{ fontSize: '12.5px', color: '#8A7A5F', marginTop: '-6px', marginBottom: '14px' }}>
          Based on average daily sales rate extrapolated to 30 days. Accuracy improves significantly as more sales data accumulates over a longer period.
        </p>
        {demand.length > 0 ? (
          <div>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={demand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E4CE" />
                  <XAxis dataKey="product_name" stroke="#7A2331" />
                  <YAxis stroke="#7A2331" />
                  <Tooltip contentStyle={{ background: '#FFFEFB', border: '1px solid #F0E4CE', color: '#2B2119' }} />
                  <Bar dataKey="predicted_demand_next_30_days" fill="#C89B3C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <table border="1" cellPadding="8" style={tableStyle}>
                <thead>
                  <tr><th>Product</th><th>Brand</th><th>Predicted Demand</th></tr>
                </thead>
                <tbody>
                  {demand.map(function (item, idx) {
                    return (
                      <tr key={idx}>
                        <td>{item.product_name}</td>
                        <td>{item.brand}</td>
                        <td>{item.predicted_demand_next_30_days}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : <p>Not enough sales data yet</p>}
        </div>

        <div style={sectionStyle}>
          <h2>Reorder Recommendations</h2>
          {reorder.length > 0 ? (
            <table border="1" cellPadding="8" style={tableStyle}>
              <thead>
                <tr><th>Product</th><th>Brand</th><th>Current Stock</th><th>Predicted Demand</th><th>Recommended Order Qty</th></tr>
              </thead>
              <tbody>
                {reorder.map(function (item, idx) {
                  return (
                    <tr key={idx}>
                      <td>{item.product_name}</td>
                      <td>{item.brand}</td>
                      <td>{item.current_stock}</td>
                      <td>{item.predicted_demand_next_30_days}</td>
                      <td>{item.recommended_order_qty}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : <p>No reorders needed right now, stock levels are sufficient.</p>}
        </div>

        <div style={sectionStyle}>
          <h2>Slow-Moving / Dead Stock</h2>
          {slowMoving.length > 0 ? (
            <table border="1" cellPadding="8" style={tableStyle}>
              <thead>
                <tr><th>Product</th><th>Brand</th><th>Stock Left</th><th>Total Sold</th></tr>
              </thead>
              <tbody>
                {slowMoving.map(function (item, idx) {
                  return (
                    <tr key={idx}>
                      <td>{item.product_name}</td>
                      <td>{item.brand}</td>
                      <td>{item.stock_left}</td>
                      <td>{item.total_sold}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : <p>No product data available</p>}
        </div>

        <div style={sectionStyle}>
          <h2>Customer Segmentation</h2>
          {segmentation.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={Object.entries(
                      segmentation.reduce(function (acc, c) {
                        acc[c.segment] = (acc[c.segment] || 0) + 1
                        return acc
                      }, {})
                    ).map(function (entry) { return { name: entry[0], value: entry[1] } })}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {['#4A6741', '#C89B3C', '#7A2331'].map(function (color, idx) {
                      return <Cell key={idx} fill={color} />
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#FFFEFB', border: '1px solid #F0E4CE', color: '#2B2119' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <table border="1" cellPadding="8" style={tableStyle}>
                <thead>
                  <tr><th>Customer</th><th>Total Purchases</th><th>Total Spent</th><th>Segment</th></tr>
                </thead>
                <tbody>
                  {segmentation.map(function (item, idx) {
                    return (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.total_purchases}</td>
                        <td>Rs.{item.total_spent}</td>
                        <td>{item.segment}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : <p>Not enough customer data yet for segmentation</p>}
        </div>
      </div>
    </div>
  )
}

export default AIDashboard
