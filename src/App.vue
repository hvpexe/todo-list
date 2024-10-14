<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import { createTodo, deleteTodo, getTodoList, updateTodo } from '@/services/api'
import type { Todo } from '@/services/domain'
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const newTodo = ref('')
const todos = ref<Todo[]>([])
const isLoading = ref(false)
const isAddLoading = ref(false)
const isDeleteLoading = ref(false)

const confirm = useConfirm()
const toast = useToast()

const confirmDelete = (id: string) => {
  confirm.require({
    message: 'Do you want to delete this record?',
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: () => {
      isDeleteLoading.value = true
      deleteTodo(id)
      todos.value = todos.value.filter(todo => todo.id !== id)
      isDeleteLoading.value = false
      toast.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'You have accepted',
        life: 3000,
      })
    },
    reject: () => {},
  })
}

const addTodo = async () => {
  isAddLoading.value = true
  if (newTodo.value.trim() !== '') {
    const addedTodo = await createTodo({
      name: newTodo.value,
      completed: false,
    })
    todos.value.push(addedTodo)

    toast.add({
      severity: 'info',
      summary: 'Confirmed',
      detail: 'You add new todo',
      life: 3000,
    })
    newTodo.value = ''
  }
  isAddLoading.value = false
}

const updateStateTodo = async (id: string, completed: boolean) => {
  await updateTodo(id, completed)
  const todo: Todo | undefined = todos.value.find(todo => todo.id === id)
  todo!.completed = completed
}

onMounted(async () => {
  isLoading.value = true
  todos.value = await getTodoList()
  isLoading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-4 text-gray-800">Todo list</h1>
      <form @submit.prevent="addTodo" class="mb-4">
        <div class="flex gap-2">
          <InputText
            v-model="newTodo"
            type="text"
            placeholder="Add new todo"
            class="w-full"
          />
          <Button type="submit" :disabled="isAddLoading">
            {{ isAddLoading ? 'Loading' : 'Add' }}
          </Button>
        </div>
      </form>
      <p v-if="isLoading" class="text-gray-500 text-center">Loading...</p>
      <ul v-else-if="todos.length > 0" class="space-y-2">
        <li
          v-for="todo in todos"
          :key="todo.id"
          class="flex items-center justify-between bg-gray-50 p-3 rounded-md"
        >
          <div class="flex items-center">
            <Checkbox
              :id="todo.id"
              :binary="true"
              v-model="todo.completed"
              class="mr-2"
              @change="updateStateTodo(todo.id, todo.completed)"
            />
            <label
              :for="todo.id"
              :class="{ 'line-through text-gray-500': todo.completed }"
            >
              {{ todo.name }}
            </label>
          </div>
          <Toast />
          <ConfirmPopup></ConfirmPopup>
          <div class="card flex flex-wrap gap-2 justify-center">
            <Button
              @click="confirmDelete(todo.id)"
              label="Delete"
              severity="danger"
              outlined
            ></Button>
          </div>
        </li>
      </ul>
      <!-- <p v-else class="text-gray-500 text-center">
        No todos yet. Add one to get started!
      </p> -->
    </div>
  </div>
</template>
