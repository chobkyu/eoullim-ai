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
  console.log("녹음 시작");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

    mediaRecorder.onstop = async () => {
      console.log("녹음 종료됨");
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioPlayback.src = URL.createObjectURL(audioBlob);

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("word", wordElement.innerText);

      try {
        const response = await fetch("/api/evaluate", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        feedback.innerText = result.feedback;
      } catch (err) {
        console.error("서버 요청 실패", err);
        feedback.innerText = "평가 요청 실패";
      } finally {
        if (currentIndex < words.length - 1) {
          nextWordBtn.disabled = false;
          console.log("다음 버튼 활성화");
        }
      }
    };

    mediaRecorder.start();

    // 버튼 상태 변경
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
  console.log("중지 버튼 클릭됨");
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
    console.log(`다음 단어로 이동: ${words[currentIndex]}`);
  }
};

// 초기 단어 세팅
setWord(currentIndex);
