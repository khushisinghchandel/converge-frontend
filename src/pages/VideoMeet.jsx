import React, { useEffect, useRef, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import io from 'socket.io-client';
import { Badge, Button, IconButton, TextField } from '@mui/material';
import { Translate, Videocam, VideocamOff, Mic, MicOff, ScreenShare, StopScreenShare, CallEnd, Chat, ClosedCaption, ClosedCaptionOff } from '@mui/icons-material';
import styles from '../styles/videoComponent.module.css';
// Add userData to your destructuring


const server_url = "https://converge-backend-vq5a.onrender.com";

var connections = {};
const peerConfig = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
};

export default function VideoMeet() {
    const { addToHistory, userData } = useContext(AuthContext);

    let socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    let recognitionRef = useRef(null);
    

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState([]); // Tracks remote streams
    const [audio, setAudio] = useState();
    const [screen, setScreen] = useState();
    const [showModal, setShowModal] = useState(true); // Join screen
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [displayChat, setDisplayChat] = useState(false);
    const [subtitle, setSubtitle] = useState("");
const [isTranslating, setIsTranslating] = useState(false);
const [language, setLanguage] = useState("hi"); // Default to Hindi
const languageRef = useRef(language);
    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
    // When the lobby closes and the meeting starts...
    if (!showModal && localVideoRef.current && window.localStream) {
        // Re-attach the stream to the new video element
        localVideoRef.current.srcObject = window.localStream;
    }
}, [showModal]);

useEffect(() => {
    languageRef.current = language;
}, [language]);

    const getPermissions = async () => {
    try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoStream) {
            // This is the key: store it so we can find it later
            window.localStream = videoStream; 
            localVideoRef.current.srcObject = videoStream;
        }
    } catch (e) { console.log(e) }
};

    const connectToVideo = () => {
    setAudio(audioAvailable);
    // setVideo(videoAvailable); // DELETE OR COMMENT THIS LINE
    setShowModal(false);
    initiateSocketConnection();
};

    const initiateSocketConnection = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on("signal", gotSignalFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.pathname);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { 
        sender: sender, // This will now be the real name
        data: data, 
        socketIdSender: socketIdSender 
    }]);
    
    if (!displayChat) setNewMessages((prev) => prev + 1);
});

            socketRef.current.on("user-left", (id) => {
                setVideo((prev) => prev.filter((v) => v.socketId !== id));
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfig);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections[socketListId].ontrack = (event) => {
                        setVideo((prev) => {
                            const exists = prev.find(v => v.socketId === socketListId);
                            if (exists) return prev;
                            return [...prev, { socketId: socketListId, stream: event.streams[0] }];
                        });
                    };

                    // Add local stream to the connection
                    if (localVideoRef.current && localVideoRef.current.srcObject) {
    localVideoRef.current.srcObject.getTracks().forEach(track => {
        connections[socketListId].addTrack(track, localVideoRef.current.srcObject);
    });
}
                });

                if (id !== socketIdRef.current) {
                    createOffer(id);
                }
            });
        });
        socketRef.current.on("subtitle-message", async (text, sender, socketIdSender) => {
    console.log(`1. Socket caught message from ${sender}: ${text}`);
    
    try {
        // Use the REF here so it always has the newest dropdown value!
        const currentLang = languageRef.current || 'hi'; 
        console.log(`-> Requesting translation to: ${currentLang}`);

        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${currentLang}`
        );
        const data = await response.json();
        
        // Let's see EXACTLY what the API gives us
        console.log("-> API Raw Response:", data);
        
        // Safety check to ensure the response is actually valid
        if (data && data.responseData && data.responseData.translatedText) {
            const translatedText = data.responseData.translatedText;
            console.log(`2. API Translation successful: ${translatedText}`);
            
            setSubtitle(`${sender}: ${translatedText}`);
            
            setTimeout(() => {
                setSubtitle("");
            }, 7000);
        } else {
            console.warn("API didn't return translated text. Check the Raw Response log.");
            setSubtitle(`${sender} (Original): ${text}`);
        }

    } catch (error) {
        console.error("API Error occurred:", error);
        setSubtitle(`${sender} (Original): ${text}`);
    }
});
    };

    const createOffer = async (id) => {
        const offer = await connections[id].createOffer();
        await connections[id].setLocalDescription(offer);
        socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }));
    };

    const gotSignalFromServer = async (fromId, message) => {
        const signal = JSON.parse(message);
        if (signal.sdp) {
            await connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp));
            if (signal.sdp.type === 'offer') {
                const answer = await connections[fromId].createAnswer();
                await connections[fromId].setLocalDescription(answer);
                socketRef.current.emit("signal", fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
            }
        }
        if (signal.ice) {
            await connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice));
        }
    };

    const sendMessage = () => {
    // Use the actual name from the logged-in user
    const senderName = userData?.name || "Anonymous"; 
    
    socketRef.current.emit("chat-message", message, senderName);
    setMessage("");
};

    const handleVideo = () => {
    const videoTrack = window.localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setVideoAvailable(videoTrack.enabled);
};

    const handleAudio = () => {
        const track = localVideoRef.current.srcObject.getAudioTracks()[0];
        track.enabled = !track.enabled;
        setAudioAvailable(track.enabled);
    };

    const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Your browser does not support live captions.");
        return;
    }

    // 1. Create the engine and save it to our ref
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; 

    recognition.continuous = true; 
    recognition.interimResults = false; 
    recognition.lang = 'en-US'; 

    recognition.onstart = () => {
        setIsTranslating(true);
        console.log("Microphone is listening for translation...");
    };

    recognition.onresult = async (event) => {
        const current = event.resultIndex;
        const spokenText = event.results[current][0].transcript;
        
        console.log("Just heard:", spokenText);

        // 1. Grab your name (just like we did for the chat)
        const senderName = userData?.name || "Anonymous";
        
        // 2. Throw the text across the socket to the other person
        socketRef.current.emit("subtitle-message", spokenText, senderName);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
    };

    // 2. Add an onend listener to ensure state updates if it stops naturally
    recognition.onend = () => {
        setIsTranslating(false);
        console.log("Microphone stopped listening.");
    };

    recognition.start();
};

// 3. Add the function to turn it off
const stopListening = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsTranslating(false);
    }
};

    const handleScreenShare = async () => {
    try {
        // 1. Get the screen stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        // 2. Find the video track we just got
        const videoTrack = screenStream.getVideoTracks()[0];

        // 3. Replace the track for every person connected to you
        Object.keys(connections).forEach((id) => {
            const sender = connections[id].getSenders().find((s) => s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        });

        // 4. Update your own local preview
        localVideoRef.current.srcObject = screenStream;
        setScreenAvailable(true);

        // 5. Handle when user clicks "Stop Sharing" on the browser's popup
        videoTrack.onended = () => {
            stopScreenShare();
        };

    } catch (e) {
        console.error("Screen share error:", e);
    }
};

const stopScreenShare = async () => {
    // 1. Get your camera back
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTrack = videoStream.getVideoTracks()[0];

    // 2. Replace the track back to camera for everyone
    Object.keys(connections).forEach((id) => {
        const sender = connections[id].getSenders().find((s) => s.track.kind === 'video');
        if (sender) {
            sender.replaceTrack(videoTrack);
        }
    });

    // 3. Update local preview and state
    localVideoRef.current.srcObject = videoStream;
    window.localStream = videoStream; // Keep global stream updated
    setScreenAvailable(false);
};

    return (
        <div className={styles.container}>
            {showModal ? (
                <div className={styles.lobby}>
                    <h2>Ready to join?</h2>
                    <video ref={localVideoRef} autoPlay muted className={styles.lobbyVideo}></video>
                    <div className={styles.lobbyControls}>
                        <IconButton onClick={handleVideo}>{videoAvailable ? <Videocam /> : <VideocamOff />}</IconButton>
                        <IconButton onClick={handleAudio}>{audioAvailable ? <Mic /> : <MicOff />}</IconButton>
                        <Button variant="contained" onClick={connectToVideo}>Join Meeting</Button>
                    </div>
                </div>
            ) : (
                <div className={styles.mainCall}>
                    <div className={styles.videoContainer}>
                        <video ref={localVideoRef} autoPlay muted className={styles.localVideo}></video>
                        {video.map((v) => (
                            <RemoteVideo key={v.socketId} stream={v.stream} />
                        ))}
                    </div>

                    <div className={styles.footerControls}>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>{audioAvailable ? <Mic /> : <MicOff />}</IconButton>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>{videoAvailable ? <Videocam /> : <VideocamOff />}</IconButton>
                        {/* TRANSLATION / SUBTITLE BUTTON */}
{/* TRANSLATION / SUBTITLE BUTTON */}
{/* LIVE TRANSLATION BROADCAST BUTTON */}
<IconButton onClick={isTranslating ? stopListening : startListening}>
    <Translate style={{ color: isTranslating ? "#FF9839" : "white" }} />
</IconButton>

<select 
    value={language} 
    onChange={(e) => setLanguage(e.target.value)}
    style={{ backgroundColor: "#3c4043", color: "white", border: "none", borderRadius: "5px", padding: "5px" }}
>
    <option value="hi">Hindi</option>
    <option value="es">Spanish</option>
    <option value="fr">French</option>
    <option value="de">German</option>
    <option value="ja">Japanese</option>
</select>
                        <IconButton onClick={screenAvailable ? stopScreenShare : handleScreenShare} style={{ color: "white" }}>
        {screenAvailable ? <StopScreenShare /> : <ScreenShare />}
    </IconButton>
                        <IconButton onClick={() => window.location.href = "/home"} style={{ color: "red" }}><CallEnd /></IconButton>
                        <Badge badgeContent={newMessages} color="primary">
                            <IconButton onClick={() => setDisplayChat(!displayChat)} style={{ color: "white" }}><Chat /></IconButton>
                        </Badge>
                    </div>

                    {/* TRANSLATED SUBTITLE OVERLAY */}
{/* TRANSLATED SUBTITLE OVERLAY */}
{subtitle && (
    <div style={{
        position: "fixed",
        bottom: "12%", /* Puts it at the bottom, safely above your control buttons */
        left: "50%",
        transform: "translateX(-50%)", /* Centers it perfectly horizontally */
        backgroundColor: "rgba(0, 0, 0, 0.75)", /* Semi-transparent black so it doesn't block the video entirely */
        color: "white",
        padding: "10px 24px",
        borderRadius: "8px",
        zIndex: 999999,
        fontSize: "1.1rem", /* Standard, readable subtitle size */
        fontWeight: "400", /* Normal weight, much easier to read than bold */
        textAlign: "center",
        maxWidth: "80%", /* Prevents super long translations from stretching edge-to-edge */
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)", /* Subtle shadow to lift it off the video */
        letterSpacing: "0.5px", /* Slight spacing makes fast-moving text easier to read */
        lineHeight: "1.4"
    }}>
        {subtitle}
    </div>
)}

                  {displayChat && (
    <div className={styles['chat-sidebar']}>
        {/* 1. Chat Header */}
        <div className={styles['chat-header']}>
            <h3>Live Chat</h3>
            {/* Closes the chat sidebar when clicked */}
            <button className={styles['close-chat-btn']} onClick={() => setDisplayChat(false)}>
                &times;
            </button>
        </div>

        {/* 2. Scrollable Message Area */}
        <div className={styles['chat-messages']}>
            {messages.map((msg, i) => {
                // Checks if the message belongs to the person typing so it aligns to the right
                const isMyMessage = msg.sender === (userData?.name || "Anonymous");
                
                return (
                    <div 
                        key={i} 
                        className={`${styles['chat-bubble-container']} ${isMyMessage ? styles['my-message'] : styles['their-message']}`}
                    >
                        <span className={styles['chat-sender-name']}>{msg.sender}</span>
                        <div className={styles['chat-bubble']}>
                            {msg.data}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* 3. Input Area */}
        <div className={styles['chat-input-area']}>
            <input 
                type="text" 
                className={styles['chat-input']} 
                placeholder="Type a message..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    // Allows the user to hit 'Enter' to send the message instead of clicking the button
                    if (e.key === 'Enter') sendMessage();
                }} 
            />
            <button className={styles['chat-send-btn']} onClick={sendMessage}>
                Send
            </button>
        </div>
    </div>
)}
                </div>
            )}
        </div>
    );
}

// Sub-component for Remote Videos
const RemoteVideo = ({ stream }) => {
    const videoRef = useRef();
    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
    }, [stream]);
    return <video ref={videoRef} autoPlay className={styles.remoteVideo}></video>;
};