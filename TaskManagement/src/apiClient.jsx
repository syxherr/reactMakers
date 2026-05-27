import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Tasks ─────────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll: async () => {
    const { data } = await api.get('/tasks')
    return data
  },

  getById: async (id) => {
    const { data } = await api.get(`/tasks/${id}`)
    return data
  },

  create: async (task) => {
    const now = new Date().toISOString()
    const { data } = await api.post('/tasks', {
      ...task,
      id: `t${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      checklist: task.checklist ?? [],
    })
    return data
  },

  update: async ({ id, ...patch }) => {
    const { data } = await api.patch(`/tasks/${id}`, {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
    return data
  },

  move: async (id, column) => {
    const { data } = await api.patch(`/tasks/${id}`, {
      column,
      updatedAt: new Date().toISOString(),
    })
    return data
  },

  delete: async (id) => {
    await api.delete(`/tasks/${id}`)
    return id
  },
}

// ─── Columns ────────────────────────────────────────────────────────────────
export const columnsApi = {
  getAll: async () => {
    const { data } = await api.get('/columns?_sort=order')
    return data
  },
}

// ─── Members ────────────────────────────────────────────────────────────────
export const membersApi = {
  getAll: async () => {
    const { data } = await api.get('/members')
    return data
  },
}