const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const audioPlayback = document.getElementById("audioPlayback");
const feedback = document.getElementById("feedback");
const wordList = document.getElementById("wordList");

const words = ["곡괭이", "컴퓨터", "자동차", "바나나", "학교"];
let currentIndex = 0;
let mediaRecorder;
let audioChunks = [];

// 단어 리스트를 화면에 쭉 보여주기
function renderWordList() {
  wordList.innerHTML = "";
  words.forEach((word, idx) => {
    const div = document.createElement("div");
    div.classList.add("word-item");
    if (idx === currentIndex) div.classList.add("current");
    div.id = `word-${idx}`;
    div.innerHTML = `
      <div>단어: ${word}</div>
      <div class="feedback" id="feedback-${idx}"></div>
    `;
    wordList.appendChild(div);
  });
}

renderWordList();

function updateCurrentWordHighlight() {
  words.forEach((_, idx) => {
    const div = document.getElementById(`word-${idx}`);
    if (idx === currentIndex) div.classList.add("current");
    else div.classList.remove("current");
  });
}

recordBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioPlayback.src = URL.createObjectURL(audioBlob);

      // 서버에 전송
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("word", words[currentIndex]);

      const feedbackDiv = document.getElementById(`feedback-${currentIndex}`);

      try {
        const response = await fetch("/api/evaluate", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        feedbackDiv.innerText = result.feedback || "평가 완료";
        feedbackDiv.style.color = "green";
      } catch (err) {
        console.error("서버 요청 실패", err);
        feedbackDiv.innerText = "평가 요청 실패";
        feedbackDiv.style.color = "red";
      }

      // 다음 단어로 넘어가기
      if (currentIndex < words.length - 1) {
        currentIndex++;
        updateCurrentWordHighlight();
      } else {
        feedback.innerText = "모든 단어 녹음 및 평가 완료!";
        recordBtn.disabled = true;
        stopBtn.disabled = true;
      }
    };

    mediaRecorder.start();

    recordBtn.disabled = true;
    stopBtn.disabled = false;
    feedback.innerText = `단어 "${words[currentIndex]}" 녹음 중...`;
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
  feedback.innerText = "";
};
