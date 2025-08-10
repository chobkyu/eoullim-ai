let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const nextWordBtn = document.getElementById("nextWordBtn");
const audioPlayback = document.getElementById("audioPlayback");
const feedback = document.getElementById("feedback");
const wordElement = document.getElementById("word");

const words = ["곡괭이", "컴퓨터", "자동차", "바나나", "학교"];
let currentIndex = 0;

function setWord(index) {
  wordElement.innerText = words[index];
}

recordBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    console.log("sibal");
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("word", wordElement.innerText);

      try {
        const response = await fetch("/api/evaluate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("서버 오류");

        // 서버에서 음성 오디오(Blob) 받기
        const ttsBlob = await response.blob();
        console.log(ttsBlob.type);
        // 기존 녹음 재생은 삭제하고
        audioPlayback.src = "";

        // 서버에서 온 음성 재생
        audioPlayback.src = URL.createObjectURL(ttsBlob);

        await audioPlayback.play().catch((e) => {
          console.error("Audio playback failed:", e);
        });

        feedback.innerText = "음성 피드백 재생 중...";
      } catch (err) {
        console.error("서버 요청 실패", err);
        feedback.innerText = "평가 요청 실패";
      } finally {
        if (currentIndex < words.length - 1) {
          nextWordBtn.disabled = false;
        }
      }
    };

    mediaRecorder.start();

    recordBtn.disabled = true;
    stopBtn.disabled = false;
    nextWordBtn.disabled = true;
    feedback.innerText = "";
    audioPlayback.src = "";
  } catch (err) {
    console.error("마이크 접근 실패", err);
    feedback.innerText = "마이크 접근 실패";
  }
};

stopBtn.onclick = () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  recordBtn.disabled = false;
  stopBtn.disabled = true;
};

nextWordBtn.onclick = () => {
  if (currentIndex < words.length - 1) {
    currentIndex++;
    setWord(currentIndex);
    feedback.innerText = "";
    audioPlayback.src = "";
    nextWordBtn.disabled = true;
  }
};

setWord(currentIndex);
