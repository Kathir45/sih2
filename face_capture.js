// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
// import { getFirestore, collection, doc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
// import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// // Firebase configuration
// import { firebaseConfig } from "./config.js";

// // Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);
// const db = getFirestore(firebaseApp);
// const auth = getAuth(firebaseApp);

// const video = document.getElementById("video");
// const captureBtn = document.getElementById("capture");
// const canvas = document.getElementById("canvas");

// // Get the stored task data from sessionStorage
// const taskData = JSON.parse(sessionStorage.getItem("taskData"));

// if (!taskData) {
//   alert("No task data found. Redirecting to the main page.");
//   window.location.href = "signout.html";
// }

// // Request camera permissions and start the video stream
// navigator.mediaDevices
//   .getUserMedia({ video: true })
//   .then((stream) => {
//     video.srcObject = stream;
//   })
//   .catch((error) => {
//     console.error("Error accessing camera:", error);
//     alert("Camera access is required for capturing your face.");
//     window.location.href = "signout.html";
//   });

// captureBtn.addEventListener("click", () => {
//   // Capture the image from the video stream
//   const context = canvas.getContext("2d");
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   context.drawImage(video, 0, 0, canvas.width, canvas.height);

//   // Convert the image to a data URL
//   const imageData = canvas.toDataURL("image/png");

//   // Save the task data and image to Firestore
//   saveTaskWithImage(taskData, imageData);
// });

// function saveTaskWithImage(taskData, imageData) {
//   onAuthStateChanged(auth, (user) => {
//     if (user) {
//       const userId = user.uid;
//       const tasksRef = collection(db, "users", userId, "tasks");

//       addDoc(tasksRef, {
//         ...taskData,
//         image: imageData,
//         timestamp: serverTimestamp(),
//       })
//         .then(() => {
//           alert("Task and face image saved successfully!");
//           window.location.href = "signout.html"; // Redirect back to the main page
//         })
//         .catch((error) => {
//           console.error("Error saving task and image:", error);
//         });
//     } else {
//       console.error("User is not logged in.");
//       alert("User not logged in. Redirecting to the main page.");
//       window.location.href = "signout.html";
//     }
//   });
// }
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const video = document.getElementById("video");
const captureBtn = document.getElementById("capture");
const canvas = document.getElementById("canvas");

const deviceId = localStorage.getItem("uniqueDeviceId");

// Request camera permissions and start the video stream
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    alert("Camera access is required.");
    console.error(error);
    window.location.href = "authenticate.html";
  });

captureBtn.addEventListener("click", async () => {
  // Capture the image from the video stream
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const newImage = canvas.toDataURL("image/png");

  // Compare with existing image
  const deviceDoc = doc(db, "devices", deviceId);
  const deviceSnapshot = await getDoc(deviceDoc);

  if (deviceSnapshot.exists()) {
    const existingImage = deviceSnapshot.data().image;

    if (existingImage) {
      // Compare images (simplified logic for demonstration)
      const isMatched = existingImage === newImage;

      if (isMatched) {
        // Replace the image
        await updateDoc(deviceDoc, { image: newImage });
        alert("Authentication successful! Image updated.");
        window.location.href = "signout.html";
      } else {
        alert("Authentication failed. Images do not match.");
        window.location.href = "authenticate.html";
      }
    } else {
      // No existing image, add the new one
      await updateDoc(deviceDoc, { image: newImage });
      alert("First-time setup complete. Image saved.");
      window.location.href = "signout.html";
    }
  } else {
    alert("Device not found. Please register again.");
    window.location.href = "signout.html";
  }
});
