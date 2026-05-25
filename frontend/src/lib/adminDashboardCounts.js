export const ADMIN_DASHBOARD_BASE_COUNTS = {
  companies: 89,
  users: 3245,
}

export const ADMIN_DASHBOARD_COUNT_DELTAS_KEY = 'admin-dashboard-count-deltas'
export const ADMIN_DASHBOARD_COUNTS_UPDATED_EVENT = 'admin-dashboard-counts-updated'

export const getAdminDashboardCountDeltas = () => {
  try {
    const storedDeltas = JSON.parse(localStorage.getItem(ADMIN_DASHBOARD_COUNT_DELTAS_KEY) || '{}')

    return {
      companies: Number(storedDeltas.companies) || 0,
      users: Number(storedDeltas.users) || 0,
    }
  } catch {
    return {
      companies: 0,
      users: 0,
    }
  }
}

export const getAdminDashboardCounts = () => {
  const deltas = getAdminDashboardCountDeltas()

  return {
    companies: ADMIN_DASHBOARD_BASE_COUNTS.companies + deltas.companies,
    users: ADMIN_DASHBOARD_BASE_COUNTS.users + deltas.users,
  }
}

export const adjustAdminDashboardCount = (countType, delta) => {
  const currentDeltas = getAdminDashboardCountDeltas()
  const nextDeltas = {
    ...currentDeltas,
    [countType]: currentDeltas[countType] + delta,
  }

  localStorage.setItem(ADMIN_DASHBOARD_COUNT_DELTAS_KEY, JSON.stringify(nextDeltas))
  window.dispatchEvent(
    new CustomEvent(ADMIN_DASHBOARD_COUNTS_UPDATED_EVENT, {
      detail: { countType, delta, deltas: nextDeltas },
    })
  )
}
