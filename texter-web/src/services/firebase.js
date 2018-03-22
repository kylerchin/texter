import { FirebaseApp } from 'firebase-rxjs'

export const setupFirebase = () => {
  var config = {
    apiKey: 'AIzaSyDj-Rsl-DnaqwZUeikJw2hcBGUO1FE20Do',
    authDomain: 'kenneth-texter.firebaseapp.com',
    databaseURL: 'https://kenneth-texter.firebaseio.com',
    projectId: 'kenneth-texter',
    storageBucket: 'kenneth-texter.appspot.com',
    messagingSenderId: '22836786973',
  }
  const app = new FirebaseApp({ options: config })
  return app.database()
}
