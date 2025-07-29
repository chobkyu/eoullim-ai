let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const audioPlayback = document.getElementById("audioPlayback");
const feedback = document.getElementById("feedback");
const word = document.getElementById("word").innerText;

recordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  mediaRecorder = new MediaRecorder(stream);

  audioChunks = [];
  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    audioPlayback.src = URL.createObjectURL(audioBlob);

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("word", word);

    const response = await fetch("/api/evaluate", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    feedback.innerText = result.feedback;
  };

  mediaRecorder.start();
  recordBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
};
