import { ref } from 'vue'
import http from '../api/http'

// undefined = sessão ainda não verificada; null = visitante; objeto = Usuário autenticado
const user = ref(undefined)

async function fetchUser() {
  try {
    const { data } = await http.get('/api/user')
    user.value = data
  } catch {
    user.value = null
  }

  return user.value
}

async function login({ email, password }) {
  await http.get('/sanctum/csrf-cookie')
  await http.post('/login', { email, password })
  await fetchUser()
}

async function logout() {
  await http.post('/logout')
  user.value = null
}

export function useAuth() {
  return { user, fetchUser, login, logout }
}
