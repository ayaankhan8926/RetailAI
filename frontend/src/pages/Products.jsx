import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { exportToCSV, getShopId } from '../utils'

function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Default')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [newSizes, setNewSizes] = useState('')
  const [newColor, setNewColor] = useState('')
  const [newCost, setNewCost] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newBarcode, setNewBarcode] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [addMessage, setAddMessage] = useState('')
  const navigate = useNavigate()

  function loadProducts() {
    axios.get('https://retailai-backend-0onv.onrender.com/products?shop_id=' + getShopId())
      .then(function (response) { setProducts(response.data) })
      .catch(function (error) { console.error('Error fetching products:', error) })
  }

  useEffect(() => {
    loadProducts()
  }, [])

  function handleImageError(e) {
    e.target.onerror = null
    e.target.src = 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&w=400'
  }

  function handleImageFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setNewImageFile(file)
    const reader = new FileReader()
    reader.onload = function (ev) {
      setNewImagePreview(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  async function handleAddProduct() {
    if (!newName || !newBrand || !newSizes || !newColor || !newCost || !newPrice) {
      setAddMessage('Please fill all fields (Sizes can be a list like M, L, XL)')
      return
    }
    const finalImage = newImagePreview || newImageUrl || null
    const sizeList = newSizes.split(',').map(function (s) { return s.trim() }).filter(function (s) { return s.length > 0 })
    const sharedBarcode = newBarcode || ('890' + Date.now().toString().slice(-9))

    try {
      for (let i = 0; i < sizeList.length; i++) {
        await axios.post('https://retailai-backend-0onv.onrender.com/products', {
          product_name: newName,
          category_id: 1,
          brand: newBrand,
          size: sizeList[i],
          color: newColor,
          cost_price: parseFloat(newCost),
          selling_price: parseFloat(newPrice),
          supplier_id: 1,
          shop_id: getShopId(),
          barcode: sharedBarcode,
          image_url: finalImage
        })
      }
      setAddMessage('Product added successfully with ' + sizeList.length + ' size(s)')
      setNewName('')
      setNewBrand('')
      setNewSizes('')
      setNewColor('')
      setNewCost('')
      setNewPrice('')
      setNewBarcode('')
      setNewImageUrl('')
      setNewImageFile(null)
      setNewImagePreview('')
      loadProducts()
      setTimeout(function () { setShowAddForm(false); setAddMessage('') }, 1500)
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message
      setAddMessage('Error: ' + errMsg)
    }
  }

  const categories = ['All']
  products.forEach(function (p) {
    if (p.brand && categories.indexOf(p.brand) === -1) categories.push(p.brand)
  })

  let filtered = products.filter(function (p) {
    const matchesSearch = p.product_name.toLowerCase().indexOf(search.toLowerCase()) !== -1
    const matchesCategory = selectedCategory === 'All' || p.brand === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (sortBy === 'PriceLowHigh') {
    filtered = [...filtered].sort(function (a, b) { return a.selling_price - b.selling_price })
  } else if (sortBy === 'PriceHighLow') {
    filtered = [...filtered].sort(function (a, b) { return b.selling_price - a.selling_price })
  } else if (sortBy === 'NameAZ') {
    filtered = [...filtered].sort(function (a, b) { return a.product_name.localeCompare(b.product_name) })
  }

  const grouped = {}
  const groupOrder = []
  filtered.forEach(function (p) {
    const key = p.product_name + '||' + p.brand
    if (!grouped[key]) {
      grouped[key] = []
      groupOrder.push(key)
    }
    grouped[key].push(p)
  })

  return (
    <div>
      <div style={{ background: '#FFFCF5', borderBottom: '1px solid #EFE6D2', padding: '24px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              Catalog <span style={{ color: '#C1702E', fontSize: '20px' }}>&#10003; Live Inventory</span>
            </h1>
            <p style={{ color: '#8A7A5F', fontSize: '13.5px', margin: '6px 0 0' }}>
              Every item synced with your real-time stock and AI insights.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#C1702E', fontFamily: "'Playfair Display', serif" }}>{groupOrder.length}</div>
              <div style={{ fontSize: '11px', color: '#8A7A5F', letterSpacing: '0.5px' }}>PRODUCTS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#4A6741', fontFamily: "'Playfair Display', serif" }}>{categories.length - 1}</div>
              <div style={{ fontSize: '11px', color: '#8A7A5F', letterSpacing: '0.5px' }}>BRANDS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#211A10', fontFamily: "'Playfair Display', serif" }}>{filtered.length}</div>
              <div style={{ fontSize: '11px', color: '#8A7A5F', letterSpacing: '0.5px' }}>SKUs</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search for products..."
            value={search}
            onChange={function (e) { setSearch(e.target.value) }}
            style={{
              flex: '1', minWidth: '220px', padding: '12px 18px', borderRadius: '10px', border: '1px solid #DCCEAE',
              background: '#F3ECDF', color: '#2C2418', fontSize: '14px'
            }}
          />
          <button
            onClick={function () { setShowAddForm(!showAddForm) }}
            style={{ padding: '12px 22px', background: '#4A6741', color: '#FFF8EC', border: 'none', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {showAddForm ? 'Cancel' : '+ Add Product'}
          </button>
          <button
            onClick={function () { exportToCSV(products, 'products_report') }}
            style={{ padding: '12px 22px', background: '#C1702E', color: '#FFF8EC', border: 'none', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={{ background: '#FFFCF5', padding: '22px 36px', borderBottom: '1px solid #EFE6D2' }}>
          <h3 style={{ marginTop: 0 }}>Add New Product</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Product Name" value={newName} onChange={function (e) { setNewName(e.target.value) }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#F3ECDF' }} />
            <input placeholder="Brand" value={newBrand} onChange={function (e) { setNewBrand(e.target.value) }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#F3ECDF' }} />
            <input placeholder="Sizes (e.g. M, L, XL or 32, 34, 36)" value={newSizes} onChange={function (e) { setNewSizes(e.target.value) }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#F3ECDF', width: '220px' }} />
            <input placeholder="Color" value={newColor} onChange={function (e) { setNewColor(e.target.value) }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#F3ECDF' }} />
            <input placeholder="Cost Price" type="number" value={newCost} onChange={function (e) { setNewCost(e.target.value) }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#F3ECDF', width: '110px' }} />
            <input placeholder="Selling Price" type="number" value={newPrice} onChange={function (e) { setNewPrice(e.target.value) }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#F3ECDF', width: '110px' }} />
            <input placeholder="Barcode (shared across all sizes)" value={newBarcode} onChange={function (e) { setNewBarcode(e.target.value) }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#F3ECDF', width: '260px' }} />
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input placeholder="Image URL (optional)" value={newImageUrl} onChange={function (e) { setNewImageUrl(e.target.value); setNewImagePreview('') }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#F3ECDF', width: '260px' }} />
            <span style={{ fontSize: '13px', color: '#8A7A5F' }}>or</span>
            <label style={{ padding: '10px 16px', background: '#EAE0CA', borderRadius: '8px', cursor: 'pointer', fontSize: '13.5px' }}>
              Choose from Gallery
              <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: 'none' }} />
            </label>
            {(newImagePreview || newImageUrl) && (
              <img src={newImagePreview || newImageUrl} alt="preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
            )}
            <button onClick={handleAddProduct} style={{ padding: '10px 20px', background: '#B5651D', color: '#FFF8EC', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
          </div>
          {addMessage && <p style={{ marginTop: '10px', color: '#4A6741' }}>{addMessage}</p>}
        </div>
      )}

      <div style={{ padding: '18px 36px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #EFE6D2', background: '#FFFCF5' }}>
        <span style={{ fontSize: '12.5px', color: '#8A7A5F', fontWeight: '700', letterSpacing: '0.5px', marginRight: '5px' }}>BRAND:</span>
        {categories.map(function (cat) {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={function () { setSelectedCategory(cat) }}
              style={{
                padding: '7px 18px',
                borderRadius: '20px',
                border: isActive ? '1.5px solid #C1702E' : '1px solid #DCCEAE',
                background: isActive ? '#F7E6D3' : '#FFFCF5',
                color: isActive ? '#C1702E' : '#6B5636',
                fontWeight: isActive ? '700' : '400',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          )
        })}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: '#8A7A5F', fontWeight: '700', letterSpacing: '0.5px' }}>SORT BY:</span>
          <select
            value={sortBy}
            onChange={function (e) { setSortBy(e.target.value) }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #DCCEAE', background: '#FFFCF5', color: '#2C2418', fontSize: '13px' }}
          >
            <option value="Default">Default</option>
            <option value="PriceLowHigh">Price: Low to High</option>
            <option value="PriceHighLow">Price: High to Low</option>
            <option value="NameAZ">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '28px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '22px' }}>
          {groupOrder.map(function (key) {
            const variants = grouped[key]
            const first = variants[0]
            const sizes = variants.map(function (v) { return v.size }).join(', ')

            return (
              <div
                key={key}
                onClick={function () { navigate('/products/' + first.product_id) }}
                style={{
                  background: '#FFFCF5',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #EFE6D2',
                  boxShadow: '0 4px 16px rgba(44, 36, 24, 0.05)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '100%', height: '200px', overflow: 'hidden', background: '#EAE0CA' }}>
                  <img
                    src={first.image_url || 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&w=400'}
                    alt={first.product_name}
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#C1702E', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {first.brand}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: '#211A10', marginTop: '5px', fontFamily: "'Playfair Display', serif" }}>{first.product_name}</div>
                                   <div style={{ fontSize: '11.5px', color: '#8A7A5F', marginTop: '4px' }}>
                    {variants.length} option{variants.length !== 1 ? 's' : ''} available
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', background: '#EAE0CA', color: '#6B5636', padding: '4px 10px', borderRadius: '10px' }}>
                      {first.color}
                    </span>
                    <span style={{ fontWeight: '700', color: '#C1702E', fontSize: '17px' }}>Rs.{first.selling_price}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Products
