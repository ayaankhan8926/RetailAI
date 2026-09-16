import { useState, useEffect } from 'react'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import { getShopId } from '../utils'

function Billing() {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [discountPercent, setDiscountPercent] = useState(0)
  const [message, setMessage] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [lastBill, setLastBill] = useState(null)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [ncName, setNcName] = useState('')
  const [ncPhone, setNcPhone] = useState('')
  const [ncEmail, setNcEmail] = useState('')
  const [ncAddress, setNcAddress] = useState('')
  const [ncMessage, setNcMessage] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanMessage, setScanMessage] = useState('')

  useEffect(() => {
    const shopId = getShopId()
    axios.get('http://127.0.0.1:5000/customers?shop_id=' + shopId).then(function (res) { setCustomers(res.data) })
    axios.get('http://127.0.0.1:5000/products?shop_id=' + shopId).then(function (res) { setProducts(res.data) })
  }, [])

  function loadCustomers() {
    axios.get('http://127.0.0.1:5000/customers?shop_id=' + getShopId()).then(function (res) { setCustomers(res.data) })
  }

  async function handleAddNewCustomer() {
    if (!ncName || !ncPhone) {
      setNcMessage('Please fill name and phone')
      return
    }
    try {
      const response = await axios.post('http://127.0.0.1:5000/customers', {
        name: ncName,
        phone: ncPhone,
        email: ncEmail,
        address: ncAddress,
        shop_id: getShopId()
      })
      setNcMessage('Customer added')
      setNcName('')
      setNcPhone('')
      setNcEmail('')
      setNcAddress('')
      loadCustomers()
      setSelectedCustomer(String(response.data.customer_id))
      setTimeout(function () { setShowNewCustomer(false); setNcMessage('') }, 1000)
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message
      setNcMessage('Error: ' + errMsg)
    }
  }

  async function handleBarcodeEnter(e) {
    if (e.key !== 'Enter') return
    const code = barcodeInput.trim()
    if (!code) return
    try {
      const response = await axios.get('http://127.0.0.1:5000/products/barcode/' + code)
      const product = response.data
      const existingIndex = items.findIndex(function (item) { return item.product_id === String(product.product_id) })
      if (existingIndex !== -1) {
        const newItems = [...items]
        newItems[existingIndex].quantity = parseInt(newItems[existingIndex].quantity) + 1
        setItems(newItems)
      } else {
        const cleanItems = items.filter(function (item) { return item.product_id })
        cleanItems.push({ product_id: String(product.product_id), quantity: 1 })
        setItems(cleanItems.length > 0 ? cleanItems : [{ product_id: String(product.product_id), quantity: 1 }])
      }
      setScanMessage('Added: ' + product.product_name + ' (Size ' + product.size + ', ' + product.color + ')')
      setBarcodeInput('')
      setTimeout(function () { setScanMessage('') }, 2500)
    } catch (error) {
      setScanMessage('Barcode not found')
      setBarcodeInput('')
      setTimeout(function () { setScanMessage('') }, 2000)
    }
  }

  function getProduct(id) {
    return products.find(function (p) { return p.product_id === parseInt(id) })
  }

  function getCustomer(id) {
    return customers.find(function (c) { return c.customer_id === parseInt(id) })
  }

      function handleItemChange(index, field, value) {
    const newItems = [...items]
    if (field === 'quantity') {
      newItems[index][field] = value
    } else {
      newItems[index][field] = value
      newItems[index].quantity = 1
    }
    setItems(newItems)
  }

  function handleQuantityBlur(index) {
    const newItems = [...items]
    let qty = parseInt(newItems[index].quantity)
    if (!qty || qty < 1) qty = 1
    newItems[index].quantity = qty
    setItems(newItems)
  }

  function addItemRow() {
    setItems([...items, { product_id: '', quantity: 1 }])
  }

  function removeItemRow(index) {
    setItems(items.filter(function (_, i) { return i !== index }))
  }

    let subtotal = 0
  let stockError = ''
  for (let i = 0; i < items.length; i++) {
    const product = getProduct(items[i].product_id)
    const qtyNum = parseInt(items[i].quantity) || 0
    if (product) {
      subtotal = subtotal + (product.selling_price * qtyNum)
      const maxStock = product.stock_quantity !== undefined ? product.stock_quantity : 9999
      if (qtyNum > maxStock) {
        stockError = 'Only ' + maxStock + ' units available for ' + product.product_name + ' (Size ' + product.size + ', ' + product.color + ')'
      }
    }
  }

  const discountAmount = subtotal * (parseFloat(discountPercent || 0) / 100)
  const afterDiscount = subtotal - discountAmount
  const gstRate = afterDiscount > 2999 ? 0.18 : 0.05
  const gstAmount = afterDiscount * gstRate
  const cgstAmount = gstAmount / 2
  const sgstAmount = gstAmount / 2
  const totalAmount = afterDiscount + gstAmount

  async function handleSubmit() {
    if (!selectedCustomer) {
      setMessage('Please select a customer')
      return
    }

    const validItems = items.filter(function (item) { return item.product_id })
    if (validItems.length === 0) {
      setMessage('Please add at least one product')
      return
    }

    for (let i = 0; i < validItems.length; i++) {
      const product = getProduct(validItems[i].product_id)
      const maxStock = product && product.stock_quantity !== undefined ? product.stock_quantity : 9999
      if (parseInt(validItems[i].quantity) > maxStock) {
        setMessage('Cannot bill ' + validItems[i].quantity + ' units of ' + product.product_name + ' (Size ' + product.size + '), only ' + maxStock + ' in stock')
        return
      }
    }

    if (paymentMode === 'Card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        setMessage('Please fill all card details')
        return
      }
    }

    const customer = getCustomer(selectedCustomer)

    const billItemsWithDetails = []
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i]
      const product = getProduct(item.product_id)
      billItemsWithDetails.push({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        price_at_sale: product.selling_price,
        product_name: product.product_name,
        brand: product.brand,
        size: product.size,
        color: product.color
      })
    }

    const itemsForApi = []
    for (let i = 0; i < billItemsWithDetails.length; i++) {
      itemsForApi.push({
        product_id: billItemsWithDetails[i].product_id,
        quantity: billItemsWithDetails[i].quantity,
        price_at_sale: billItemsWithDetails[i].price_at_sale
      })
    }

    const billData = {
      customer_id: parseInt(selectedCustomer),
      employee_id: 1,
      shop_id: getShopId(),
      subtotal: subtotal,
      discount_amount: discountAmount,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      payment_mode: paymentMode,
      items: itemsForApi
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/bills', billData)
      setMessage('Bill created successfully! Bill ID: ' + response.data.bill_id)

      const newBill = {
        bill_id: response.data.bill_id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        date: new Date().toLocaleString(),
        items: billItemsWithDetails,
        subtotal: subtotal,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        gstRate: gstRate,
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
        paymentMode: paymentMode
      }
      setLastBill(newBill)

      setItems([{ product_id: '', quantity: 1 }])
      setSelectedCustomer('')
      setDiscountPercent(0)
      setCardNumber('')
      setCardName('')
      setCardExpiry('')
      setCardCvv('')

      axios.get('http://127.0.0.1:5000/products?shop_id=' + getShopId()).then(function (res) { setProducts(res.data) })
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.error
        ? error.response.data.error
        : error.message
      setMessage('Error creating bill: ' + errMsg)
    }
  }

  function buildInvoiceHtml(bill) {
    let itemsRows = ''
    for (let i = 0; i < bill.items.length; i++) {
      const item = bill.items[i]
      const priceNum = parseFloat(item.price_at_sale)
      const lineTotal = priceNum * item.quantity
      const itemLabel = item.product_name + ' (' + item.brand + ') - Size: ' + item.size + ', Color: ' + item.color
      itemsRows = itemsRows + '<tr><td>' + (i + 1) + '</td><td>' + itemLabel + '</td><td style="text-align:center;">' + item.quantity + '</td><td style="text-align:right;">Rs.' + priceNum.toFixed(2) + '</td><td style="text-align:right;">Rs.' + lineTotal.toFixed(2) + '</td></tr>'
    }

    const gstPercentLabel = (bill.gstRate * 100).toFixed(0)
    const halfPercentLabel = (bill.gstRate * 100 / 2).toFixed(1)

    let html = ''
    html = html + '<html><head><title>Invoice ' + bill.bill_id + '</title>'
    html = html + '<style>'
    html = html + 'body { font-family: Georgia, serif; padding: 30px; color: #2B2119; }'
    html = html + '.header { text-align: center; margin-bottom: 20px; }'
    html = html + '.header h1 { margin: 0; color: #7A2331; }'
    html = html + '.details { display: flex; justify-content: space-between; margin-bottom: 20px; }'
    html = html + 'table { width: 100%; border-collapse: collapse; margin-top: 10px; }'
    html = html + 'th, td { border: 1px solid #E0CFA8; padding: 8px; }'
    html = html + 'th { background: #F0E4CE; }'
    html = html + '.totals { margin-top: 20px; float: right; width: 300px; }'
    html = html + '.totals div { display: flex; justify-content: space-between; padding: 5px 0; }'
    html = html + '.grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #7A2331; padding-top: 8px; }'
    html = html + '.footer { clear: both; margin-top: 60px; text-align: center; font-size: 13px; color: #8A7A5F; }'
    html = html + '</style></head><body>'
    html = html + '<div class="header"><h1>Jashn Collection</h1><p>GST Invoice</p></div>'
    html = html + '<div class="details">'
    html = html + '<div><strong>Bill To:</strong><br/>' + bill.customer_name + '<br/>' + bill.customer_phone + '<br/>' + (bill.customer_address || '') + '</div>'
    html = html + '<div><strong>Invoice Number:</strong> ' + bill.bill_id + '<br/><strong>Date:</strong> ' + bill.date + '<br/><strong>Payment Mode:</strong> ' + bill.paymentMode + '</div>'
    html = html + '</div>'
    html = html + '<table><thead><tr><th>Sl</th><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>'
    html = html + '<tbody>' + itemsRows + '</tbody></table>'
    html = html + '<div class="totals">'
    html = html + '<div><span>Subtotal:</span><span>Rs.' + bill.subtotal.toFixed(2) + '</span></div>'
    html = html + '<div><span>Discount ' + bill.discountPercent + ' percent:</span><span>-Rs.' + bill.discountAmount.toFixed(2) + '</span></div>'
    html = html + '<div><span>CGST ' + halfPercentLabel + ' percent:</span><span>Rs.' + bill.cgstAmount.toFixed(2) + '</span></div>'
    html = html + '<div><span>SGST ' + halfPercentLabel + ' percent:</span><span>Rs.' + bill.sgstAmount.toFixed(2) + '</span></div>'
    html = html + '<div style="font-size:12px;color:#8A7A5F;"><span>Total GST ' + gstPercentLabel + ' percent</span><span>Rs.' + bill.gstAmount.toFixed(2) + '</span></div>'
    html = html + '<div class="grand-total"><span>Total:</span><span>Rs.' + bill.totalAmount.toFixed(2) + '</span></div>'
    html = html + '</div>'
    html = html + '<div class="footer">Thank you for shopping with Jashn Collection. This is a computer generated invoice.</div>'
    html = html + '</body></html>'

    return html
  }

  function handlePrint() {
    if (!lastBill) return
    const htmlContent = buildInvoiceHtml(lastBill)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')
    if (!printWindow) {
      alert('Popup blocked. Please allow popups for this site and try again.')
      return
    }
    printWindow.onload = function () {
      printWindow.focus()
      printWindow.print()
    }
  }

  const inputStyle = { padding: '11px', margin: '5px', borderRadius: '9px', border: '1px solid #E0CFA8', background: '#FAF6EE', color: '#2B2119' }

  const upiString = 'upi://pay?pa=jashncollection@paytm&pn=JashnCollection&am=' + totalAmount.toFixed(2) + '&cu=INR&tn=Purchase'

  return (
    <div>
      <div style={{
        background: 'linear-gradient(120deg, #2B1216 0%, #4A1E24 60%, #7A2331 130%)',
        padding: '34px 40px', color: '#FFF8EC'
      }}>
        <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#E8C88A', textTransform: 'uppercase', marginBottom: '8px' }}>
          Point of Sale
        </div>
        <h1 style={{ color: '#FFF8EC', margin: 0 }}>Create New Bill</h1>
      </div>

      <div style={{ padding: '30px 40px', color: '#2B2119' }}>
        <div style={{ marginBottom: '20px' }}>
          <label>Customer: </label>
          <select style={inputStyle} value={selectedCustomer} onChange={function (e) { setSelectedCustomer(e.target.value) }}>
            <option value="">-- Select Customer --</option>
            {customers.map(function (c) {
              return <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.phone})</option>
            })}
          </select>

          <button
            type="button"
            onClick={function () { setShowNewCustomer(!showNewCustomer) }}
            style={{ marginLeft: '10px', padding: '10px 16px', background: '#4A6741', color: '#FFF8EC', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600' }}
          >
            {showNewCustomer ? 'Cancel' : '+ New Customer'}
          </button>

          <label style={{ marginLeft: '20px' }}>Discount Percent: </label>
          <input
            type="number"
            min="0"
            max="100"
            style={{ ...inputStyle, width: '80px' }}
            value={discountPercent}
            onChange={function (e) { setDiscountPercent(e.target.value) }}
          />
        </div>

        {showNewCustomer && (
          <div style={{ background: '#FFFEFB', padding: '20px', borderRadius: '14px', maxWidth: '460px', marginBottom: '20px', border: '1px solid #F0E4CE', boxShadow: '0 4px 16px rgba(43,18,22,0.06)' }}>
            <h4 style={{ marginTop: 0 }}>Add New Customer</h4>
            <input placeholder="Name" value={ncName} onChange={function (e) { setNcName(e.target.value) }} style={{ ...inputStyle, width: '90%', display: 'block' }} />
            <input placeholder="Phone" value={ncPhone} onChange={function (e) { setNcPhone(e.target.value) }} style={{ ...inputStyle, width: '90%', display: 'block' }} />
            <input placeholder="Email (optional)" value={ncEmail} onChange={function (e) { setNcEmail(e.target.value) }} style={{ ...inputStyle, width: '90%', display: 'block' }} />
            <input placeholder="Address (optional)" value={ncAddress} onChange={function (e) { setNcAddress(e.target.value) }} style={{ ...inputStyle, width: '90%', display: 'block' }} />
            <button onClick={handleAddNewCustomer} style={{ marginTop: '10px', padding: '10px 20px', background: '#7A2331', color: '#FFF8EC', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Save Customer
            </button>
            {ncMessage && <p style={{ marginTop: '10px', color: '#4A6741' }}>{ncMessage}</p>}
          </div>
        )}

        <div style={{ background: '#FFFEFB', padding: '18px', borderRadius: '14px', maxWidth: '400px', marginBottom: '20px', border: '1px solid #F0E4CE' }}>
          <label style={{ fontSize: '13px', color: '#7A2331', fontWeight: '600' }}>Scan or Enter Barcode</label>
          <input
            type="text"
            value={barcodeInput}
            onChange={function (e) { setBarcodeInput(e.target.value) }}
            onKeyDown={handleBarcodeEnter}
            placeholder="Scan barcode and press Enter"
            autoFocus
            style={{ ...inputStyle, width: '100%', marginTop: '6px' }}
          />
          {scanMessage && <p style={{ marginTop: '8px', color: scanMessage.indexOf('not found') !== -1 ? '#93493A' : '#4A6741', fontSize: '13px' }}>{scanMessage}</p>}
          <p style={{ fontSize: '11.5px', color: '#8A7A5F', marginTop: '6px' }}>Note: since sizes/colors share one barcode, scanning always adds the first matching variant &mdash; adjust size/color manually below if needed.</p>
        </div>

        <h3>Items</h3>
        {items.map(function (item, index) {
          const selectedProduct = getProduct(item.product_id)
          const maxStock = selectedProduct && selectedProduct.stock_quantity !== undefined ? selectedProduct.stock_quantity : null
          return (
            <div key={index} style={{ marginBottom: '10px' }}>
              <select
                style={{ ...inputStyle, minWidth: '380px' }}
                value={item.product_id}
                onChange={function (e) { handleItemChange(index, 'product_id', e.target.value) }}
              >
                <option value="">-- Select Product --</option>
                {products.map(function (p) {
                  const outOfStock = p.stock_quantity !== undefined && p.stock_quantity <= 0
                  return (
                    <option key={p.product_id} value={p.product_id} disabled={outOfStock}>
                      {p.product_name} ({p.brand}) - Size: {p.size}, {p.color} - Rs.{p.selling_price} {outOfStock ? '[OUT OF STOCK]' : '[' + p.stock_quantity + ' in stock]'}
                    </option>
                  )
                })}
              </select>

                                        <input
                type="number"
                min="1"
                style={{ ...inputStyle, width: '80px' }}
                value={item.quantity}
                onChange={function (e) { handleItemChange(index, 'quantity', e.target.value) }}
                onBlur={function () { handleQuantityBlur(index) }}
              />

              {selectedProduct && maxStock !== null && (
                <span style={{ fontSize: '12px', color: maxStock <= 0 ? '#93493A' : '#8A7A5F', marginLeft: '6px', fontWeight: maxStock <= 0 ? '700' : '400' }}>
                  {maxStock <= 0 ? 'Out of stock' : ('(' + maxStock + ' in stock)')}
                </span>
              )}

              <button onClick={function () { removeItemRow(index) }} style={{ marginLeft: '10px', padding: '10px 14px', background: '#F2D6CE', color: '#93493A', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Remove</button>
            </div>
          )
        })}

        <button onClick={addItemRow} style={{ padding: '10px 18px', marginTop: '10px', background: '#F0E4CE', color: '#7A2331', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>+ Add Product</button>

        {stockError && (
          <p style={{ marginTop: '12px', color: '#93493A', fontWeight: '600', background: '#F2D6CE', padding: '10px 14px', borderRadius: '8px', maxWidth: '500px' }}>
            {stockError}
          </p>
        )}

        <div style={{ marginTop: '30px' }}>
          <label>Payment Mode: </label>
          <select style={inputStyle} value={paymentMode} onChange={function (e) { setPaymentMode(e.target.value) }}>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
        </div>

        {paymentMode === 'UPI' && (
          <div style={{ marginTop: '20px', background: '#FFFEFB', padding: '22px', borderRadius: '14px', maxWidth: '300px', textAlign: 'center', border: '1px solid #F0E4CE', boxShadow: '0 4px 16px rgba(43,18,22,0.06)' }}>
            <p>Scan to Pay Rs.{totalAmount.toFixed(2)}</p>
            <div style={{ background: '#fff', padding: '10px', display: 'inline-block', borderRadius: '8px' }}>
              <QRCodeSVG value={upiString} size={180} />
            </div>
            <p style={{ fontSize: '11px', color: '#8A7A5F', marginTop: '10px' }}>
              Demo QR for project demonstration only, not linked to a live bank account
            </p>
          </div>
        )}

        {paymentMode === 'Card' && (
          <div style={{ marginTop: '20px', background: '#FFFEFB', padding: '22px', borderRadius: '14px', maxWidth: '400px', border: '1px solid #F0E4CE', boxShadow: '0 4px 16px rgba(43,18,22,0.06)' }}>
            <h4>Card Details</h4>
            <div>
              <label>Card Number: </label><br />
              <input
                type="text"
                maxLength="16"
                placeholder="1234 5678 9012 3456"
                style={{ ...inputStyle, width: '90%' }}
                value={cardNumber}
                onChange={function (e) { setCardNumber(e.target.value) }}
              />
            </div>
            <div>
              <label>Name on Card: </label><br />
              <input
                type="text"
                style={{ ...inputStyle, width: '90%' }}
                value={cardName}
                onChange={function (e) { setCardName(e.target.value) }}
              />
            </div>
            <div style={{ display: 'flex' }}>
              <div>
                <label>Expiry MM/YY: </label><br />
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength="5"
                  style={{ ...inputStyle, width: '80px' }}
                  value={cardExpiry}
                  onChange={function (e) { setCardExpiry(e.target.value) }}
                />
              </div>
              <div style={{ marginLeft: '15px' }}>
                <label>CVV: </label><br />
                <input
                  type="password"
                  maxLength="3"
                  style={{ ...inputStyle, width: '60px' }}
                  value={cardCvv}
                  onChange={function (e) { setCardCvv(e.target.value) }}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', background: '#FFFEFB', padding: '22px', borderRadius: '14px', maxWidth: '400px', border: '1px solid #F0E4CE', boxShadow: '0 4px 16px rgba(43,18,22,0.06)' }}>
          <div>Subtotal: Rs.{subtotal.toFixed(2)}</div>
          <div>Discount {discountPercent || 0} percent: -Rs.{discountAmount.toFixed(2)}</div>
          <div>CGST {(gstRate * 100 / 2).toFixed(1)} percent: Rs.{cgstAmount.toFixed(2)}</div>
          <div>SGST {(gstRate * 100 / 2).toFixed(1)} percent: Rs.{sgstAmount.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#8A7A5F' }}>Total GST rate applied: {(gstRate * 100).toFixed(0)}% (amount is {afterDiscount > 2999 ? 'above' : 'up to'} Rs.2999)</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '10px', color: '#7A2331', fontFamily: "'Playfair Display', serif" }}>Total: Rs.{totalAmount.toFixed(2)}</div>
        </div>

        <button onClick={handleSubmit} disabled={!!stockError} style={{ marginTop: '20px', padding: '14px 32px', fontSize: '16px', background: stockError ? '#DCCEAE' : '#7A2331', color: stockError ? '#8A7A5F' : '#FFF8EC', border: 'none', borderRadius: '10px', cursor: stockError ? 'not-allowed' : 'pointer', fontWeight: '700' }}>
          Create Bill
        </button>

        {lastBill && (
          <button onClick={handlePrint} style={{ marginTop: '20px', marginLeft: '15px', padding: '14px 32px', fontSize: '16px', background: '#C89B3C', color: '#2B1216', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
            Print Bill Number {lastBill.bill_id}
          </button>
        )}

        {message && <p style={{ marginTop: '15px' }}>{message}</p>}
      </div>
    </div>
  )
}

export default Billing