import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, columnsApi, membersApi } from '../api'
import { useOptimisticStore } from '../store'

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const QK = {
  tasks: ['tasks'],
  task: (id) => ['tasks', id],
  columns: ['columns'],
  members: ['members'],
}

// ─── Queries ─────────────────────────────────────────────────────────────────
export const useTasks = () =>
  useQuery({ queryKey: QK.tasks, queryFn: tasksApi.getAll })

export const useColumns = () =>
  useQuery({ queryKey: QK.columns, queryFn: columnsApi.getAll })

export const useMembers = () =>
  useQuery({ queryKey: QK.members, queryFn: membersApi.getAll })

// ─── Mutations ────────────────────────────────────────────────────────────────
export const useCreateTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.tasks }),
  })
}

export const useUpdateTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksApi.update,
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: QK.tasks })
      const prev = qc.getQueryData(QK.tasks)
      qc.setQueryData(QK.tasks, (old) =>
        old?.map((t) => (t.id === patch.id ? { ...t, ...patch } : t))
      )
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(QK.tasks, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: QK.tasks }),
  })
}

export const useMoveTask = () => {
  const qc = useQueryClient()
  const { addPendingMove, removePendingMove } = useOptimisticStore()
  return useMutation({
    mutationFn: ({ id, column }) => tasksApi.move(id, column),
    onMutate: async ({ id, column }) => {
      addPendingMove(id, column)
      await qc.cancelQueries({ queryKey: QK.tasks })
      const prev = qc.getQueryData(QK.tasks)
      qc.setQueryData(QK.tasks, (old) =>
        old?.map((t) => (t.id === id ? { ...t, column } : t))
      )
      return { prev }
    },
    onError: (_, { id }, ctx) => {
      removePendingMove(id)
      qc.setQueryData(QK.tasks, ctx.prev)
    },
    onSuccess: (_, { id }) => removePendingMove(id),
    onSettled: () => qc.invalidateQueries({ queryKey: QK.tasks }),
  })
}

export const useDeleteTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksApi.delete,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.tasks })
      const prev = qc.getQueryData(QK.tasks)
      qc.setQueryData(QK.tasks, (old) => old?.filter((t) => t.id !== id))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(QK.tasks, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: QK.tasks }),
  })
}