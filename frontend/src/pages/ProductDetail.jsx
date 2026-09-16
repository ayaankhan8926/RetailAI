import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import JsBarcode from 'jsbarcode'
import { addToCart, getShopId } from '../utils'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [added, setAdded] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const barcodeRef = useRef(null)
  const isAdmin = !!localStorage.getItem('admin')
  const isEmployee = !!localStorage.getItem('employee')
  const isStaff = isAdmin || isEmployee

  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBrand, setEditBrand] = useState('')
  const [editSize, setEditSize] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editBarcode, setEditBarcode] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImagePreview, setEditImagePreview] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [applyImageToAllSizes, setApplyImageToAllSizes] = useState(true)

  function loadProduct() {
    axios.get('https://retailai-backend-0onv.onrender.com/products?shop_id=' + getShopId()).then(function (res) {
      setAllProducts(res.data)
      const found = res.data.find(function (p) { return p.product_id === parseInt(id) })
      setProduct(found)
      if (found) {
        setEditName(found.product_name)
        setEditBrand(found.brand)
        setEditSize(found.size)
        setEditColor(found.color)
        setEditCost(found.cost_price)
        setEditPrice(found.selling_price)
        setEditBarcode(found.barcode || '')
        setEditImageUrl(found.image_url || '')
      }
    })
  }

  useEffect(() => {
    loadProduct()
    setDeleteConfirm(false)
  }, [id])

  useEffect(() => {
    if (product && product.barcode && barcodeRef.current) {
      JsBarcode(barcodeRef.current, product.barcode, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        margin: 5
      })
    }
  }, [product])

  function handleImageError(e) {
    e.target.onerror = null
    e.target.src = 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&w=400'
  }

  function handleAddToCart() {
    addToCart(product)
    setAdded(true)
    setTimeout(function () { setAdded(false) }, 2000)
  }

  function handleEditImageFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function (ev) {
      setEditImagePreview(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  async function handleSaveEdit() {
    const finalImage = editImagePreview || editImageUrl || null
    try {
      await axios.put('https://retailai-backend-0onv.onrender.com/products/' + product.product_id, {
        product_name: editName,
        brand: editBrand,
        size: editSize,
        color: editColor,
        cost_price: parseFloat(editCost),
        selling_price: parseFloat(editPrice),
        image_url: finalImage,
        barcode: editBarcode
      })

      if (applyImageToAllSizes && finalImage) {
        const sameColorSiblings = allProducts.filter(function (p) {
          return p.product_name === product.product_name &&
                 p.brand === product.brand &&
                 p.color === product.color &&
                 p.product_id !== product.product_id
        })
        for (let i = 0; i < sameColorSiblings.length; i++) {
          const sib = sameColorSiblings[i]
          await axios.put('https://retailai-backend-0onv.onrender.com/products/' + sib.product_id, {
            product_name: sib.product_name,
            brand: sib.brand,
            size: sib.size,
            color: sib.color,
            cost_price: sib.cost_price,
            selling_price: sib.selling_price,
            image_url: finalImage,
            barcode: sib.barcode
          })
        }
      }

      setEditMessage('Product updated successfully' + (applyImageToAllSizes ? ' (image applied to all sizes of this color)' : ''))
      loadProduct()
      setEditImagePreview('')
      setTimeout(function () { setEditMode(false); setEditMessage('') }, 1500)
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message
      setEditMessage('Error: ' + errMsg)
    }
  }

  async function handleDeleteProduct() {
    try {
      await axios.delete('https://retailai-backend-0onv.onrender.com/products/' + product.product_id)
      navigate('/products')
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message
      setEditMessage('Error deleting: ' + errMsg)
    }
  }

  if (!product) {
    return <div style={{ padding: '30px' }}>Loading...</div>
  }

  const inputStyle = {
    width: '100%', padding: '11px', marginTop: '6px', marginBottom: '12px',
    borderRadius: '9px', border: '1px solid #DCCEAE', background: '#F3ECDF', color: '#2C2418', fontSize: '14px'
  }
  const labelStyle = { fontSize: '13px', color: '#6B5636', fontWeight: '600' }

  const stockQty = product.stock_quantity !== undefined ? product.stock_quantity : null
  const reorderLevel = product.reorder_level !== undefined ? product.reorder_level : 5
  const isLowStock = stockQty !== null && stockQty <= reorderLevel
  const isOutOfStock = stockQty !== null && stockQty <= 0

  const sameProductAllVariants = allProducts.filter(function (p) {
    return p.product_name === product.product_name && p.brand === product.brand
  })

  const colorMap = {}
  const colorOrder = []
  sameProductAllVariants.forEach(function (p) {
    if (!colorMap[p.color]) {
      colorMap[p.color] = p
      colorOrder.push(p.color)
    }
  })

  const sizeVariants = sameProductAllVariants.filter(function (p) {
    return p.color === product.color
  }).sort(function (a, b) {
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    const ai = order.indexOf(a.size)
    const bi = order.indexOf(b.size)
    if (ai !== -1 && bi !== -1) return ai - bi
    return a.size.localeCompare(b.size, undefined, { numeric: true })
  })

  const sizeGuideRows = [
    { size: 'S', chest: '36', waist: '30', length: '27' },
    { size: 'M', chest: '38', waist: '32', length: '28' },
    { size: 'L', chest: '40', waist: '34', length: '29' },
    { size: 'XL', chest: '42', waist: '36', length: '30' },
    { size: 'XXL', chest: '44', waist: '38', length: '31' }
  ]

  return (
    <div>
      <div style={{ background: '#FFFCF5', borderBottom: '1px solid #EFE6D2', padding: '18px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={function () { navigate('/products') }}
          style={{ padding: '10px 18px', background: '#F3ECDF', color: '#2C2418', border: 'none', borderRadius: '9px', cursor: 'pointer' }}
        >
          &larr; Back to Catalog
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <button
              onClick={function () { setEditMode(!editMode) }}
              style={{ padding: '10px 18px', background: editMode ? '#F2D6CE' : '#4A6741', color: editMode ? '#93493A' : '#FFF8EC', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600' }}
            >
              {editMode ? 'Cancel Edit' : 'Edit Product'}
            </button>
          )}
          <button
            onClick={function () { navigate('/cart') }}
            style={{ padding: '10px 18px', background: '#C1702E', color: '#FFF8EC', border: 'none', borderRadius: '9px', cursor: 'pointer' }}
          >
            View Cart
          </button>
        </div>
      </div>

      {editMode ? (
        <div style={{ padding: '40px 44px', maxWidth: '500px' }}>
          <h2 style={{ marginTop: 0 }}>Edit Product</h2>

          <label style={labelStyle}>Product Name</label>
          <input style={inputStyle} value={editName} onChange={function (e) { setEditName(e.target.value) }} />

          <label style={labelStyle}>Brand</label>
          <input style={inputStyle} value={editBrand} onChange={function (e) { setEditBrand(e.target.value) }} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Size</label>
              <input style={inputStyle} value={editSize} onChange={function (e) { setEditSize(e.target.value) }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Color</label>
              <input style={inputStyle} value={editColor} onChange={function (e) { setEditColor(e.target.value) }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Cost Price</label>
              <input type="number" style={inputStyle} value={editCost} onChange={function (e) { setEditCost(e.target.value) }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Selling Price</label>
              <input type="number" style={inputStyle} value={editPrice} onChange={function (e) { setEditPrice(e.target.value) }} />
            </div>
          </div>

          <label style={labelStyle}>Barcode (shared across all sizes/colors of this product)</label>
          <input style={inputStyle} value={editBarcode} onChange={function (e) { setEditBarcode(e.target.value) }} />

          <label style={labelStyle}>Image URL</label>
          <input style={inputStyle} value={editImageUrl} onChange={function (e) { setEditImageUrl(e.target.value); setEditImagePreview('') }} placeholder="Paste image URL here" />

          <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Or Upload New Image</label>
          <label style={{ padding: '10px 16px', background: '#EAE0CA', borderRadius: '8px', cursor: 'pointer', fontSize: '13.5px', display: 'inline-block', marginBottom: '14px' }}>
            Choose from Gallery
            <input type="file" accept="image/*" onChange={handleEditImageFile} style={{ display: 'none' }} />
          </label>

          {(editImagePreview || editImageUrl) && (
            <div style={{ marginBottom: '14px' }}>
              <img src={editImagePreview || editImageUrl} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }} onError={handleImageError} />
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '13.5px', color: '#6B5636', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={applyImageToAllSizes}
              onChange={function (e) { setApplyImageToAllSizes(e.target.checked) }}
            />
            Apply this image to all sizes of this color (recommended)
          </label>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={handleSaveEdit} style={{
              padding: '13px 30px', background: '#7A2331', color: '#FFF8EC', border: 'none',
              borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px'
            }}>
              Save Changes
            </button>

            {!deleteConfirm ? (
              <button onClick={function () { setDeleteConfirm(true) }} style={{
                padding: '13px 24px', background: '#F2D6CE', color: '#93493A', border: 'none',
                borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
              }}>
                Delete Product
              </button>
            ) : (
              <>
                <button onClick={handleDeleteProduct} style={{
                  padding: '13px 24px', background: '#93493A', color: '#FFF8EC', border: 'none',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                }}>
                  Confirm Delete
                </button>
                <button onClick={function () { setDeleteConfirm(false) }} style={{
                  padding: '13px 20px', background: '#F3ECDF', color: '#2C2418', border: 'none',
                  borderRadius: '10px', cursor: 'pointer', fontSize: '14px'
                }}>
                  Cancel
                </button>
              </>
            )}
          </div>

          {editMessage && <p style={{ marginTop: '12px', color: '#4A6741' }}>{editMessage}</p>}
        </div>
      ) : (
        <div style={{ padding: '40px 44px', display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
          <div style={{ width: '400px', height: '400px', borderRadius: '18px', overflow: 'hidden', background: '#EAE0CA', flexShrink: 0 }}>
            <img
              src={product.image_url || 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&w=400'}
              alt={product.product_name}
              onError={handleImageError}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ flex: '1', minWidth: '320px' }}>
            <div style={{ fontSize: '12px', color: '#C1702E', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {product.brand}
            </div>
            <h1 style={{ marginTop: '8px', marginBottom: '10px' }}>{product.product_name}</h1>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#211A10', fontFamily: "'Playfair Display', serif" }}>Rs.{product.selling_price}</div>
            <p style={{ color: '#8A7A5F', fontSize: '12.5px', marginTop: '2px' }}>*Inclusive of GST</p>

            {isStaff ? (
              <div style={{
                marginTop: '14px', maxWidth: '500px', padding: '14px 18px', borderRadius: '12px',
                background: isOutOfStock ? '#F2D6CE' : (isLowStock ? '#F7E6C8' : '#DCE7CD'),
                color: isOutOfStock ? '#93493A' : (isLowStock ? '#8A6D1F' : '#4A6741'),
                fontWeight: '600', fontSize: '14px'
              }}>
                Stock on hand: {stockQty !== null ? stockQty : 'N/A'} units
                {isOutOfStock && ' — Out of stock'}
                {!isOutOfStock && isLowStock && ' — Low stock, reorder soon'}
              </div>
            ) : (
              isLowStock && (
                <div style={{
                  marginTop: '14px', maxWidth: '500px', padding: '14px 18px', borderRadius: '12px',
                  background: isOutOfStock ? '#F2D6CE' : '#F7E6C8',
                  color: isOutOfStock ? '#93493A' : '#8A6D1F',
                  fontWeight: '600', fontSize: '14px'
                }}>
                  {isOutOfStock ? 'Out of stock' : 'Only a few left in stock, order soon!'}
                </div>
              )
            )}

            {colorOrder.length > 1 && (
              <div style={{ marginTop: '26px', maxWidth: '500px' }}>
                <div style={{ fontWeight: '700', color: '#211A10', fontSize: '15px', marginBottom: '10px' }}>
                  Selected Color &middot; {product.color}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {colorOrder.map(function (color) {
                    const variantForColor = colorMap[color]
                    const isCurrentColor = color === product.color
                    return (
                      <div
                        key={color}
                        onClick={function () { navigate('/products/' + variantForColor.product_id) }}
                        style={{
                          width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                          border: isCurrentColor ? '2.5px solid #C1702E' : '1px solid #DCCEAE'
                        }}
                      >
                        <img
                          src={variantForColor.image_url || 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&w=400'}
                          alt={color}
                          onError={handleImageError}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: '26px', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button
                  onClick={function () { setShowSizeGuide(true) }}
                  style={{ background: 'none', border: 'none', color: '#211A10', fontWeight: '700', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  SIZE GUIDE
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
                {sizeVariants.map(function (variant) {
                  const isCurrent = variant.product_id === product.product_id
                  const outOfStockVariant = variant.stock_quantity !== undefined && variant.stock_quantity <= 0
                  return (
                    <button
                      key={variant.product_id}
                      onClick={function () { if (!isCurrent) navigate('/products/' + variant.product_id) }}
                      disabled={outOfStockVariant}
                      style={{
                        padding: '14px 8px',
                        borderRadius: '10px',
                        border: isCurrent ? '2px solid #211A10' : '1px solid #DCCEAE',
                        background: outOfStockVariant ? '#F3ECDF' : '#FFFCF5',
                        color: outOfStockVariant ? '#B8AA8C' : '#211A10',
                        fontWeight: isCurrent ? '800' : '500',
                        fontSize: '14px',
                        cursor: outOfStockVariant ? 'not-allowed' : 'pointer',
                        textDecoration: outOfStockVariant ? 'line-through' : 'none'
                      }}
                    >
                      {variant.size}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ background: '#FFFEFB', border: '1px solid #EFE6D2', borderRadius: '14px', padding: '18px', marginTop: '26px', maxWidth: '300px', textAlign: 'center' }}>
              <svg ref={barcodeRef}></svg>
            </div>

            <div style={{
              marginTop: '20px', maxWidth: '500px', background: '#F7E6D3', borderRadius: '12px',
              padding: '14px 18px', fontSize: '13.5px', color: '#6B5636', fontWeight: '600'
            }}>
              Free 1-2 day delivery available
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                marginTop: '24px', padding: '17px', fontSize: '15px', fontWeight: '700', maxWidth: '500px', width: '100%',
                background: isOutOfStock ? '#DCCEAE' : (added ? '#4A6741' : '#211A10'),
                color: isOutOfStock ? '#8A7A5F' : '#FFF8EC', border: 'none',
                borderRadius: '11px', cursor: isOutOfStock ? 'not-allowed' : 'pointer'
              }}
            >
              {isOutOfStock ? 'OUT OF STOCK' : (added ? 'ADDED TO CART' : 'ADD TO CART')}
            </button>
          </div>
        </div>
      )}

      {showSizeGuide && (
        <div
          onClick={function () { setShowSizeGuide(false) }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(43,18,22,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
          }}
        >
          <div
            onClick={function (e) { e.stopPropagation() }}
            style={{ background: '#FFFCF5', borderRadius: '18px', padding: '32px', maxWidth: '480px', width: '90%', boxShadow: '0 20px 60px rgba(43,18,22,0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0 }}>Size Guide</h2>
              <button onClick={function () { setShowSizeGuide(false) }} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#8A7A5F' }}>&times;</button>
            </div>
            <p style={{ color: '#8A7A5F', fontSize: '13px', marginTop: 0, marginBottom: '18px' }}>All measurements in inches. Please measure yourself and compare with the chart below.</p>
            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr><th>Size</th><th>Chest</th><th>Waist</th><th>Length</th></tr>
              </thead>
              <tbody>
                {sizeGuideRows.map(function (row) {
                  const isCurrentSize = row.size === product.size
                  return (
                    <tr key={row.size} style={{ background: isCurrentSize ? '#F7E6D3' : 'transparent' }}>
                      <td style={{ fontWeight: isCurrentSize ? '700' : '400', color: isCurrentSize ? '#C1702E' : '#2C2418' }}>{row.size}</td>
                      <td>{row.chest}"</td>
                      <td>{row.waist}"</td>
                      <td>{row.length}"</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
