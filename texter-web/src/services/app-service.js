import { setupStore } from '../redux/store'
import { setupFirebase } from './firebase'
import { setupBackend } from './backend'

export class AppService {
  constructor() {
    const { store, history } = setupStore()
    this.store = store
    this.history = history
    this.firebase = setupFirebase()
    this.backend = setupBackend()
  }
}
