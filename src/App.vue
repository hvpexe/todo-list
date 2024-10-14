<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import {
  createTodo,
  deleteTodo,
  getTodoList,
  updateTextTodo,
} from '@/services/api'
import type { Todo } from '@/services/domain'
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const newTodo = ref('')
const todos = ref<Todo[]>([])
const isLoading = ref(false)
const isAddLoading = ref(false)
const isDeleteLoading = ref(false)
const visible = ref(false)
const confirm = useConfirm()
const toast = useToast()

// New refs for editing
const editingTodo = ref<Todo | null>(null)
const editedName = ref('')

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
  await updateStateTodo(id, completed)
  const todo: Todo | undefined = todos.value.find(todo => todo.id === id)
  todo!.completed = completed
}

const openEditDialog = (todo: Todo) => {
  editingTodo.value = todo
  editedName.value = todo.name
  visible.value = true
}

// New method to handle updating the todo name
const updateTodoName = async () => {
  if (editingTodo.value && editedName.value.trim() !== '') {
    try {
      console.log(editedName.value)
      await updateTextTodo(editingTodo.value.id, editedName.value)

      // Update local state
      const todo = todos.value.find(t => t.id === editingTodo.value!.id)
      todo!.name = editedName.value
      // Show success toast
      toast.add({
        severity: 'success',
        summary: 'Todo Updated',
        detail: 'The todo has been successfully updated',
        life: 3000,
      })

      // Close the dialog
      visible.value = false
    } catch (error: unknown) {
      // Show error toast
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Failed to update the todo: ' + error,
        life: 3000,
      })
    }
  }
}

onMounted(async () => {
  isLoading.value = true
  todos.value = await getTodoList()
  isLoading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex justify-center py-8">
    <Toast />
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-4 text-gray-800">Todo list</h1>
      <div class="mb-4">
        <div class="flex gap-2">
          <InputText
            v-model="newTodo"
            type="text"
            placeholder="Add new todo"
            class="w-full"
          />
          <Button
            type="button"
            label="Add"
            icon="pi pi-plus"
            :loading="isAddLoading"
            loading-icon="pi pi-spin pi-spinner"
            class="text-2xl"
            @click="addTodo"
          />
        </div>
      </div>
      <p v-if="isLoading" class="text-gray-500 text-center pt-36">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </p>
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

          <div class="flex gap-2">
            <Button label="Edit" @click="openEditDialog(todo)"></Button>
            <Dialog
              v-model:visible="visible"
              modal
              header="Edit"
              :style="{ width: '25rem' }"
            >
              <div class="mb-4">
                <Textarea
                  id="text"
                  class="w-full"
                  v-model="editedName"
                  :placeholder="editingTodo?.name"
                ></Textarea>
              </div>
              <div class="flex justify-end gap-2">
                <Button
                  type="button"
                  label="Cancel"
                  severity="secondary"
                  @click="visible = false"
                ></Button>
                <Button
                  type="button"
                  label="Save"
                  @click="updateTodoName"
                ></Button>
              </div>
            </Dialog>
            <ConfirmPopup></ConfirmPopup>
            <div class="card flex flex-wrap gap-2 justify-center">
              <Button
                @click="confirmDelete(todo.id)"
                label="Delete"
                severity="danger"
                outlined
              ></Button>
            </div>
          </div>
        </li>
      </ul>
      <p v-else class="text-gray-500 text-center">
        No todos yet. Add one to get started!
      </p>
    </div>
  </div>
</template>
