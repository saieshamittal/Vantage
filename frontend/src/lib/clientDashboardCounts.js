export const CLIENT_DASHBOARD_BASE_COUNTS = {
  revenue: 28450,
  orders: 318,
  productsInStock: 1245,
  pendingOrders: 24,
}

export const CLIENT_DASHBOARD_COUNT_DELTAS_KEY = 'client-dashboard-count-deltas'
export const CLIENT_DASHBOARD_COUNTS_UPDATED_EVENT = 'client-dashboard-counts-updated'

export const getClientDashboardCountDeltas = () => {
  try {
    const storedDeltas = JSON.parse(localStorage.getItem(CLIENT_DASHBOARD_COUNT_DELTAS_KEY) || '{}')

    return {
      revenue: Number(storedDeltas.revenue) || 0,
      orders: Number(storedDeltas.orders) || 0,
      productsInStock: Number(storedDeltas.productsInStock) || 0,
      pendingOrders: Number(storedDeltas.pendingOrders) || 0,
    }
  } catch {
    return {
      revenue: 0,
      orders: 0,
      productsInStock: 0,
      pendingOrders: 0,
    }
  }
}

export const getClientDashboardCounts = () => {
  const deltas = getClientDashboardCountDeltas()

  return {
    revenue: CLIENT_DASHBOARD_BASE_COUNTS.revenue + deltas.revenue,
    orders: CLIENT_DASHBOARD_BASE_COUNTS.orders + deltas.orders,
    productsInStock: CLIENT_DASHBOARD_BASE_COUNTS.productsInStock + deltas.productsInStock,
    pendingOrders: CLIENT_DASHBOARD_BASE_COUNTS.pendingOrders + deltas.pendingOrders,
  }
}

export const adjustClientDashboardCounts = (countDeltas) => {
  const currentDeltas = getClientDashboardCountDeltas()
  const nextDeltas = {
    revenue: currentDeltas.revenue + (Number(countDeltas.revenue) || 0),
    orders: currentDeltas.orders + (Number(countDeltas.orders) || 0),
    productsInStock: currentDeltas.productsInStock + (Number(countDeltas.productsInStock) || 0),
    pendingOrders: currentDeltas.pendingOrders + (Number(countDeltas.pendingOrders) || 0),
  }

  localStorage.setItem(CLIENT_DASHBOARD_COUNT_DELTAS_KEY, JSON.stringify(nextDeltas))
  window.dispatchEvent(
    new CustomEvent(CLIENT_DASHBOARD_COUNTS_UPDATED_EVENT, {
      detail: { deltas: countDeltas, totals: nextDeltas },
    })
  )
}
