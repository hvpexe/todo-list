import type { TodoModel } from '@/services/domain'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getTodoList = async () => {
  try {
    const response = await apiClient.get('/api/todos')
    return response.data
  } catch (error) {
    console.error('Error in getTodoList:', error)
    throw error
  }
}

export const createTodo = async (todo: TodoModel) => {
  try {
    const response = await apiClient.post('/api/todos', todo)
    return response.data
  } catch (error) {
    console.error('Error in createTodo:', error)
    throw error
  }
}

export const deleteTodo = async (id: string) => {
  try {
    const response = await apiClient.delete(`/api/todos/${id}`)
    return response.data
  } catch (error) {
    console.error('Error in deleteTodo:', error)
    throw error
  }
}

export const updateStateTodo = async (id: string, check: boolean) => {
  try {
    const response = await apiClient.put(`/api/todos/${id}`, {
      completed: check,
    })
    return response.data
  } catch (error) {
    console.error('Error in updateTodo:', error)
    throw error
  }
}

export const updateTextTodo = async (id: string, name: string) => {
  try {
    const response = await apiClient.put(`/api/todos/${id}`, {
      name: name,
    })
    return response.data
  } catch (error) {
    console.error('Error in updateTodo:', error)
    throw error
  }
}
