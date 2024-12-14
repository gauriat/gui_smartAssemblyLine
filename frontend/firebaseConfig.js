import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA4qBo3ZuN694xWVVB53M-JLAijRweQhkg",
  authDomain: "gui-smartline.firebaseapp.com",
  projectId: "gui-smartline",
  storageBucket: "gui-smartline.appspot.com",
  messagingSenderId: "1051290374043",
  appId: "1:1051290374043:web:382d1822bb79a8b9551b3e",
  measurementId: "G-HLX7M4YH2E"
  
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;