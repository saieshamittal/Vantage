import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createProduct, deleteProduct, getApiErrorMessage, getProducts, updateProduct } from '../../services/api'
import { Search, Filter, Package, MoreVertical, ChevronLeft, ChevronRight, Plus, AlertTriangle, X, Pencil, Trash2, ChevronDown } from 'lucide-react'
import { adjustClientDashboardCounts } from '../../lib/clientDashboardCounts'

export default function Inventory() {
  const inventoryCacheKey = 'vantage_inventory_cache'
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [inventoryItems, setInventoryItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(inventoryCacheKey) || '[]')
    } catch {
      localStorage.removeItem(inventoryCacheKey)
      return []
    }
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingInventory, setIsLoadingInventory] = useState(true)
  const [formError, setFormError] = useState('')
  const [activeActionId, setActiveActionId] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'Widgets',
    stock: '',
    price: '',
  })

  const getInventoryStatus = (stock) => {
    const parsedStock = Number(stock)
    if (parsedStock <= 0) return 'Out of Stock'
    if (parsedStock < 10) return 'Low Stock'
    return 'In Stock'
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      sku: '',
      category: 'Widgets',
      stock: '',
      price: '',
    })
    setFormError('')
    setIsReorderMode(false)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setEditingProduct(null)
    resetProductForm()
  }

  const handleFormChange = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }))
  }

  const mapProductToDisplay = (product) => ({
    ...product,
    sku: product.sku || `PRD-${product.id}`,
    status: getInventoryStatus(product.stock),
    price: Number(product.price),
    stock: Number(product.stock),
  })

  const loadInventory = async ({ showErrorToast = true } = {}) => {
    try {
      setIsLoadingInventory(true)
      const response = await getProducts()
      const products = Array.isArray(response.data) ? response.data : []
      const mappedProducts = products.map(mapProductToDisplay)
      setInventoryItems(mappedProducts)
      localStorage.setItem(inventoryCacheKey, JSON.stringify(mappedProducts))
    } catch (error) {
      if (showErrorToast) {
        toast.error(getApiErrorMessage(error, 'Failed to load inventory'))
      }

      try {
        const cachedInventory = JSON.parse(localStorage.getItem(inventoryCacheKey) || '[]')
        setInventoryItems(Array.isArray(cachedInventory) ? cachedInventory : [])
      } catch {
        localStorage.removeItem(inventoryCacheKey)
      }
    } finally {
      setIsLoadingInventory(false)
    }
  }

  useEffect(() => {
    loadInventory({ showErrorToast: true })
  }, [])

  useEffect(() => {
    const searchPreset = location.state?.searchTerm
    const reorderProduct = location.state?.reorderProduct

    if (searchPreset) {
      setSearchTerm(searchPreset)
      navigate(location.pathname, { replace: true, state: { ...location.state, searchTerm: undefined } })
      return
    }

    if (!reorderProduct) {
      return
    }

    setEditingProduct(null)
    setIsReorderMode(true)
    setProductForm({
      name: reorderProduct.name || '',
      sku: reorderProduct.sku || '',
      category: reorderProduct.category || 'Widgets',
      stock: String(reorderProduct.stock ?? ''),
      price: String(reorderProduct.price ?? ''),
    })
    setFormError('')
    setIsAddModalOpen(true)

    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate])

  const openEditModal = (product) => {
    setEditingProduct(product)
    setIsReorderMode(false)
    setActiveActionId(null)
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      stock: String(product.stock),
      price: String(product.price),
    })
    setFormError('')
    setIsAddModalOpen(true)
  }

  const handleDeleteProduct = async (product) => {
    setActiveActionId(null)

    if (!window.confirm(`Delete ${product.name}? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteProduct(product.id)
      adjustClientDashboardCounts({ productsInStock: -Number(product.stock || 0) })
      await loadInventory()
      window.dispatchEvent(new Event('inventory-updated'))
      toast.success('Product deleted')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to delete product')
      toast.error(message)
    }
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()

    const price = Number(productForm.price)
    const stock = Number(productForm.stock)

    if (!productForm.name.trim() || !productForm.category || productForm.price === '' || productForm.stock === '') {
      setFormError('Product name, category, price, and stock are required.')
      return
    }

    if (Number.isNaN(price) || price < 0) {
      setFormError('Price must be a valid non-negative number.')
      return
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setFormError('Stock must be a valid whole number.')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const productPayload = {
        name: productForm.name.trim(),
        price,
        stock,
        category: productForm.category,
      }

      if (editingProduct) {
        const response = await updateProduct(editingProduct.id, productPayload)

        const updatedProduct = response.data
        const displayProduct = {
          ...updatedProduct,
          id: editingProduct.id,
          sku: productForm.sku.trim() || editingProduct.sku || `PRD-${editingProduct.id}`,
          status: getInventoryStatus(updatedProduct.stock),
          price: Number(updatedProduct.price),
          stock: Number(updatedProduct.stock),
        }

        setInventoryItems((current) =>
          current.map((item) => (item.id === editingProduct.id ? displayProduct : item))
        )
        adjustClientDashboardCounts({
          productsInStock: Number(displayProduct.stock || 0) - Number(editingProduct.stock || 0),
        })
        await loadInventory({ showErrorToast: false })
        window.dispatchEvent(new Event('inventory-updated'))
        toast.success('Product updated successfully')
        closeAddModal()
        return
      }

      const response = await createProduct(productPayload)

      const createdProduct = response.data
      const displayProduct = {
        ...createdProduct,
        sku: productForm.sku.trim() || `PRD-${createdProduct.id}`,
        status: getInventoryStatus(createdProduct.stock),
        price: Number(createdProduct.price),
        stock: Number(createdProduct.stock),
      }

      setInventoryItems((current) => [displayProduct, ...current])
      adjustClientDashboardCounts({ productsInStock: Number(displayProduct.stock || 0) })
      await loadInventory({ showErrorToast: false })
      window.dispatchEvent(new Event('inventory-updated'))
      toast.success('Product added successfully')
      closeAddModal()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to add product')
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase().replace(' ', '-') === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in stock': return 'bg-success/10 text-success'
      case 'low stock': return 'bg-warning/10 text-warning'
      case 'out of stock': return 'bg-destructive/10 text-destructive'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const categories = [...new Set(['Widgets', 'Gadgets', 'Tools', 'Accessories', 'Bundles', ...inventoryItems.map(item => item.category).filter(Boolean)])]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold">{inventoryItems.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">In Stock</p>
          <p className="text-2xl font-bold text-success">{inventoryItems.filter(i => i.status === 'In Stock').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold text-warning">{inventoryItems.filter(i => i.status === 'Low Stock').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Out of Stock</p>
          <p className="text-2xl font-bold text-destructive">{inventoryItems.filter(i => i.status === 'Out of Stock').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-input py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-input py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoadingInventory ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">Loading inventory...</div>
        ) : inventoryItems.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No inventory items found yet.</p>
            <p className="mt-2 text-xs text-muted-foreground">If you already added products in PostgreSQL, make sure they use this client's `company_id`.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.sku}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.stock < 10 && item.stock > 0 && <AlertTriangle className="w-4 h-4 text-warning" />}
                      {item.stock === 0 && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      <span>{item.stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                    <span className={`inline-flex whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-flex">
                      <button
                        type="button"
                        onClick={() => setActiveActionId(activeActionId === item.id ? null : item.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label={`Actions for ${item.name}`}
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {activeActionId === item.id && (
                        <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(item)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredInventory.length} of {inventoryItems.length} products
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm">1</span>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {editingProduct ? 'Edit Product' : isReorderMode ? 'Reorder Product' : 'Add Product'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingProduct
                    ? 'Update this inventory item'
                    : isReorderMode
                      ? 'Review the pre-filled details before adding this reorder'
                      : 'Create a new inventory item'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-5 px-6 py-5">
              <div>
                <label htmlFor="product-name" className="mb-2 block text-sm font-medium">
                  Product Name *
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={productForm.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                  placeholder="Widget Pro"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-sku" className="mb-2 block text-sm font-medium">
                    SKU
                  </label>
                  <input
                    id="product-sku"
                    type="text"
                    value={productForm.sku}
                    onChange={(event) => handleFormChange('sku', event.target.value)}
                    placeholder="WGT-001"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="product-category" className="mb-2 block text-sm font-medium">
                    Category *
                  </label>
                  <select
                    id="product-category"
                    value={productForm.category}
                    onChange={(event) => handleFormChange('category', event.target.value)}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-stock" className="mb-2 block text-sm font-medium">
                    Stock *
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.stock}
                    onChange={(event) => handleFormChange('stock', event.target.value)}
                    placeholder="100"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="product-price" className="mb-2 block text-sm font-medium">
                    Price *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(event) => handleFormChange('price', event.target.value)}
                    placeholder="249.00"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Status will be set automatically from stock: 0 is out of stock, below 10 is low stock.
              </div>

              {formError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="rounded-xl border border-border px-5 py-2.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : isReorderMode ? 'Add Reorder' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
