# 🎥 Converge: Real-Time Video Conferencing Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

**Converge** is a full-stack, peer-to-peer video conferencing application. Built entirely from scratch, it bypasses traditional server-heavy media routing by utilizing WebRTC and UDP for zero-latency video and audio streaming, supported by a custom Node.js signaling server.

🔗 **[Live Demo: Converge on Vercel](https://converge01.vercel.app/)** 

---

## ✨ Key Engineering Features

* **Peer-to-Peer Architecture:** Utilizes WebRTC for direct browser-to-browser media streaming. Implements NAT hole punching via Google STUN servers to seamlessly connect users across different private networks.
* **Custom Signaling Server:** A Node.js and Socket.IO backend that acts as a switchboard to manage concurrent meeting rooms, broadcast real-time text chat, and facilitate the critical exchange of ICE candidates.
* **Live Multi-Lingual Subtitles:** Integrates the browser's native Web Speech API for real-time speech-to-text transcription, routing the data through the MyMemory REST API to broadcast translated captions to all connected peers instantly.
* **Seamless Screen Sharing:** Implements dynamic track replacement (`replaceTrack`) to switch between camera and screen-share streams without dropping the WebRTC connection.
* **Stateful Token Authentication:** A custom-built, persistent authentication flow utilizing cryptographic tokens stored in `localStorage`, guarded on the frontend by Higher-Order Components (HOCs).

---

## 🏗️ System Architecture 

Converge uses a hybrid networking approach to maximize performance and minimize server costs:
1. **Signaling (TCP/WebSockets):** When a user joins a room, the React client connects to the Node.js server via Socket.IO. The server broadcasts their presence and acts as a middleman to exchange network coordinates (SDP/ICE Candidates).
2. **Media Streaming (UDP/WebRTC):** Once the network coordinates are exchanged, the server steps out of the way. Video and audio data are fired directly between the users' browsers using UDP, ensuring high-quality, zero-latency communication.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Context API (Global State Management)
* React Router DOM
* WebRTC & MediaDevices API
* Tailwind CSS / CSS Modules (UI/UX)

**Backend:**
* Node.js & Express.js
* Socket.IO
* MongoDB & Mongoose
* Built-in Crypto module (Authentication)

---
