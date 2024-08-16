import React, { useState, useRef } from "react";
import Recorder from 'recorder-js';

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [recorder, setRecorder] = useState(null);
  const audioContextRef = useRef(null);

  const startRecording = async () => {
    setIsRecording(true);
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = audioContextRef.current;
    const rec = new Recorder(audioContext);

    rec.init(stream).then(() => {
      setRecorder(rec);
      rec.start();
    }).catch((error) => {
      console.error("Error initializing recorder:", error);
      setIsRecording(false);
    });
  };

  const stopRecording = async () => {
    if (recorder) {
      setIsRecording(false);
      try {
        const { blob } = await recorder.stop();
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        // 서버로 전송
        sendAudioToServer(blob);
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav"); // WAV 파일명

    try {
      const response = await fetch("http://localhost:8000/uploadfile/", {
        method: "POST",
        body: formData,
        mode: 'cors',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded successfully");
        console.log("Server response:", data);
      } else {
        console.error("Failed to upload file");
        const errorData = await response.json();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "녹음 중지" : "녹음 시작"}
      </button>
      {audioURL && (
        <audio controls>
          <source src={audioURL} type="audio/wav" />
          브라우저가 오디오 요소를 지원하지 않습니다.
        </audio>
      )}
    </div>
  );
}

export default AudioRecorder;
