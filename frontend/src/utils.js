import Papa from 'papaparse'
import { saveAs } from 'file-saver'

export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, filename + '.csv')
}

export function getCart() {
  const cart = localStorage.getItem('cart')
  return cart ? JSON.parse(cart) : []
}

export function addToCart(product) {
  const cart = getCart()
  const existing = cart.find(function (item) { return item.product_id === product.product_id })
  if (existing) {
    existing.quantity = existing.quantity + 1
  } else {
    cart.push({
      product_id: product.product_id,
      product_name: product.product_name,
      brand: product.brand,
      selling_price: product.selling_price,
      image_url: product.image_url,
      quantity: 1
    })
  }
  localStorage.setItem('cart', JSON.stringify(cart))
}

export function clearCart() {
  localStorage.removeItem('cart')
}

export function getShopId() {
  const admin = JSON.parse(localStorage.getItem('admin') || 'null')
  const employee = JSON.parse(localStorage.getItem('employee') || 'null')
  return (admin && admin.shop_id) || (employee && employee.shop_id) || 1
}
