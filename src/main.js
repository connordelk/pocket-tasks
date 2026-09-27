import { createClient } from '@supabase/supabase-js'
import './style.css'

const projectUrl = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const isConfigured = Boolean(
  projectUrl?.startsWith('https://') &&
  publishableKey &&
  !projectUrl.includes('your-project') &&
  !publishableKey.includes('your_key_here'),
)
const supabase = isConfigured ? createClient(projectUrl, publishableKey) : null

const elements = {
  setupWarning: document.querySelector('#setup-warning'),
  message: document.querySelector('#message'),
  authPanel: document.querySelector('#auth-panel'),
  tasksPanel: document.querySelector('#tasks-panel'),
  authTitle: document.querySelector('#auth-title'),
  authSubtitle: document.querySelector('#auth-subtitle'),
  loginTab: document.querySelector('#login-tab'),
  registerTab: document.querySelector('#register-tab'),
  authForm: document.querySelector('#auth-form'),
  authSubmit: document.querySelector('#auth-submit'),
  authHint: document.querySelector('#auth-hint'),
  email: document.querySelector('#email'),
  password: document.querySelector('#password'),
  accountEmail: document.querySelector('#account-email'),
  logoutButton: document.querySelector('#logout-button'),
  addForm: document.querySelector('#add-form'),
  addButton: document.querySelector('#add-button'),
  newTask: document.querySelector('#new-task'),
  taskSummary: document.querySelector('#task-summary'),
  taskCount: document.querySelector('#task-count'),
  taskList: document.querySelector('#task-list'),
  emptyState: document.querySelector('#empty-state'),
  emptyTitle: document.querySelector('#empty-title'),
  emptyCopy: document.querySelector('#empty-copy'),
  filters: [...document.querySelectorAll('[data-filter]')],
}

let user = null
let tasks = []
let filter = 'all'
let authMode = 'login'
let editingId = null
let messageTimer

function showMessage(text, type = 'success') {
  clearTimeout(messageTimer)
  elements.message.textContent = text
  elements.message.className = `notice notice-${type}`
  elements.message.setAttribute('role', type === 'error' ? 'alert' : 'status')
  messageTimer = setTimeout(() => elements.message.classList.add('hidden'), 7000)
}

function setAuthMode(mode) {
  authMode = mode
  const registering = mode === 'register'
  elements.authTitle.textContent = registering ? 'Create your account' : 'Log in to your list'
  elements.authSubtitle.textContent = registering
    ? 'A free account keeps your tasks private and in sync.'
    : 'Your tasks are saved securely to your account.'
  elements.authSubmit.textContent = registering ? 'Create account' : 'Log in'
  elements.authHint.innerHTML = registering
    ? 'Already have an account? Select <strong>Log in</strong> above.'
    : 'New here? Select <strong>Create account</strong> above.'
  elements.password.autocomplete = registering ? 'new-password' : 'current-password'
  elements.loginTab.classList.toggle('active', !registering)
  elements.registerTab.classList.toggle('active', registering)
  elements.loginTab.setAttribute('aria-selected', String(!registering))
  elements.registerTab.setAttribute('aria-selected', String(registering))
  elements.message.classList.add('hidden')
}

function renderAccount() {
  const signedIn = Boolean(user)
  elements.authPanel.classList.toggle('hidden', signedIn)
  elements.tasksPanel.classList.toggle('hidden', !signedIn)
  elements.accountEmail.textContent = user?.email ?? ''
  if (signedIn) renderTasks()
}

function visibleTasks() {
  if (filter === 'active') return tasks.filter((task) => !task.is_complete)
  if (filter === 'done') return tasks.filter((task) => task.is_complete)
  return tasks
}

function button(text, className, action, label) {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = className
  element.textContent = text
  element.setAttribute('aria-label', label)
  element.addEventListener('click', action)
  return element
}

function renderTasks() {
  const remaining = tasks.filter((task) => !task.is_complete).length
  elements.taskSummary.textContent = tasks.length
    ? `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left to do.`
    : 'A fresh start, one task at a time.'
  elements.taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`
  elements.filters.forEach((element) => {
    const active = element.dataset.filter === filter
    element.classList.toggle('active', active)
    element.setAttribute('aria-pressed', String(active))
  })

  const shown = visibleTasks()
  elements.taskList.replaceChildren()
  elements.emptyState.classList.toggle('hidden', shown.length > 0)
  if (shown.length === 0) {
    elements.emptyTitle.textContent = tasks.length ? 'Nothing here' : 'No tasks yet'
    elements.emptyCopy.textContent = tasks.length
      ? 'Try another filter to see your tasks.'
      : 'Add your first task above to get started.'
  }

  for (const task of shown) {
    const item = document.createElement('li')
    item.className = `task-item card${task.is_complete ? ' completed' : ''}`

    if (editingId === task.id) {
      const form = document.createElement('form')
      form.className = 'edit-form'
      const input = document.createElement('input')
      input.type = 'text'
      input.maxLength = 120
      input.required = true
      input.value = task.title
      input.setAttribute('aria-label', 'Edit task title')
      const save = document.createElement('button')
      save.type = 'submit'
      save.className = 'button button-primary'
      save.textContent = 'Save'
      form.append(input, save, button('Cancel', 'button button-quiet', () => {
        editingId = null
        renderTasks()
      }, 'Cancel editing'))
      form.addEventListener('submit', async (event) => {
        event.preventDefault()
        const title = input.value.trim()
        if (!title) return showMessage('Enter a task name.', 'error')
        save.disabled = true
        const { error } = await supabase.from('tasks').update({ title }).eq('id', task.id).eq('user_id', user.id)
        save.disabled = false
        if (error) return showMessage(error.message, 'error')
        task.title = title
        editingId = null
        renderTasks()
        showMessage('Task updated.')
      })
      item.append(form)
      elements.taskList.append(item)
      input.focus()
      continue
    }

    const main = document.createElement('div')
    main.className = 'task-main'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = task.is_complete
    checkbox.className = 'task-checkbox'
    checkbox.setAttribute('aria-label', `${task.is_complete ? 'Mark incomplete' : 'Complete'}: ${task.title}`)
    checkbox.addEventListener('change', async () => {
      checkbox.disabled = true
      const is_complete = checkbox.checked
      const { error } = await supabase.from('tasks').update({ is_complete }).eq('id', task.id).eq('user_id', user.id)
      checkbox.disabled = false
      if (error) {
        checkbox.checked = task.is_complete
        return showMessage(error.message, 'error')
      }
      task.is_complete = is_complete
      renderTasks()
    })
    const title = document.createElement('span')
    title.className = 'task-title'
    title.textContent = task.title
    main.append(checkbox, title)

    const actions = document.createElement('div')
    actions.className = 'task-actions'
    actions.append(
      button('Edit', 'button button-quiet', () => {
        editingId = task.id
        renderTasks()
      }, `Edit ${task.title}`),
      button('Delete', 'button button-danger', async () => {
        if (!window.confirm(`Delete “${task.title}”?`)) return
        const { error } = await supabase.from('tasks').delete().eq('id', task.id).eq('user_id', user.id)
        if (error) return showMessage(error.message, 'error')
        tasks = tasks.filter((item) => item.id !== task.id)
        renderTasks()
        showMessage('Task deleted.')
      }, `Delete ${task.title}`),
    )
    item.append(main, actions)
    elements.taskList.append(item)
  }
}

async function loadTasks() {
  if (!user) return
  const currentUserId = user.id
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, is_complete, created_at')
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false })
  if (user?.id !== currentUserId) return
  if (error) return showMessage(`Could not load tasks: ${error.message}`, 'error')
  tasks = data ?? []
  renderTasks()
}

elements.loginTab.addEventListener('click', () => setAuthMode('login'))
elements.registerTab.addEventListener('click', () => setAuthMode('register'))

elements.authForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!supabase) return showMessage('Add your Supabase settings first.', 'error')
  const email = elements.email.value.trim()
  const password = elements.password.value
  elements.authSubmit.disabled = true
  elements.authSubmit.textContent = authMode === 'register' ? 'Creating account…' : 'Logging in…'
  const result = authMode === 'register'
    ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    : await supabase.auth.signInWithPassword({ email, password })
  elements.authSubmit.disabled = false
  elements.authSubmit.textContent = authMode === 'register' ? 'Create account' : 'Log in'
  if (result.error) return showMessage(result.error.message, 'error')
  if (!result.data.session) {
    showMessage('Check your email to confirm your account, then log in.')
    return
  }
  user = result.data.user
  elements.password.value = ''
  renderAccount()
  await loadTasks()
  showMessage(authMode === 'register' ? 'Account created. Welcome!' : 'Welcome back!')
})

elements.logoutButton.addEventListener('click', async () => {
  elements.logoutButton.disabled = true
  const { error } = await supabase.auth.signOut()
  elements.logoutButton.disabled = false
  if (error) return showMessage(error.message, 'error')
  user = null
  tasks = []
  editingId = null
  renderAccount()
  showMessage('You have logged out.')
})

elements.addForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!user) return showMessage('Log in before adding a task.', 'error')
  const title = elements.newTask.value.trim()
  if (!title) return showMessage('Enter a task name.', 'error')
  elements.addButton.disabled = true
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: user.id, title })
    .select('id, title, is_complete, created_at')
    .single()
  elements.addButton.disabled = false
  if (error) return showMessage(error.message, 'error')
  tasks.unshift(data)
  elements.newTask.value = ''
  renderTasks()
  elements.newTask.focus()
  showMessage('Task added.')
})

elements.filters.forEach((element) => element.addEventListener('click', () => {
  filter = element.dataset.filter
  editingId = null
  renderTasks()
}))

async function initialize() {
  if (!supabase) {
    elements.setupWarning.classList.remove('hidden')
    elements.authSubmit.disabled = true
    return
  }
  const { data, error } = await supabase.auth.getUser()
  if (error && error.name !== 'AuthSessionMissingError') {
    showMessage(`Could not restore your session: ${error.message}`, 'error')
  }
  user = data?.user ?? null
  renderAccount()
  if (user) await loadTasks()
}

initialize()
