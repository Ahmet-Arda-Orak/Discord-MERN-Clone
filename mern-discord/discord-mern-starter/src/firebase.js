import firebase from 'firebase'

const firebaseConfig = {
        apiKey: "AIzaSyAkpFZifnTC9fdQSVaCUOTYY5SeLNPz7Bw",
        authDomain: "discord-clone-live-357e8.firebaseapp.com",
        projectId: "discord-clone-live-357e8",
        storageBucket: "discord-clone-live-357e8.appspot.com",
        messagingSenderId: "250790736668",
        appId: "1:250790736668:web:5f79aeca4ef031533240d9"
};

const firebaseApp = firebase.initializeApp(firebaseConfig)

const db = firebaseApp.firestore()
const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()

export { auth, provider }
export default db