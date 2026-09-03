let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const status = document.getElementById("status");
const audioContainer = document.getElementById("audioContainer");
const campoDeTexto = document.getElementById("transcription");
const modelSelect = document.getElementById("model");
const audioFile = document.getElementById("audioFile");
const transcribeFileButton = document.getElementById("transcribeFileButton");
const transcribeRecordingButton = document.getElementById(
  "transcribeRecordingButton",
);
const transcriptionTime = document.getElementById("transcriptionTime");

let recordedAudioBlob = null;

// Comenzar grabación
startButton.addEventListener("click", async () => {
  try {
    // Solicitar acceso al micrófono
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    // Crear el grabador
    mediaRecorder = new MediaRecorder(stream);

    audioChunks = [];

    // Cada vez que llega un fragmento de audio
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });

    // Cuando termina la grabación
    mediaRecorder.addEventListener("stop", async () => {
      const audioBlob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType,
      });

      recordedAudioBlob = audioBlob;

      transcribeRecordingButton.disabled = false;

      // Crear URL temporal para reproducir el audio
      const audioUrl = URL.createObjectURL(audioBlob);

      // Mostrar reproductor
      const audio = document.createElement("audio");

      audio.controls = true;
      audio.src = audioUrl;

      audioContainer.innerHTML = "";
      audioContainer.appendChild(audio);

      const formData = new FormData();

      formData.append("file", audioBlob, "recording.webm");

      formData.append("model", modelSelect.value);

      status.textContent = "Estado: Transcribiendo...";

      try {
        const startTime = performance.now();

        const response = await fetch("http://localhost:8000/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        const endTime = performance.now();

        const elapsedTime = (endTime - startTime) / 1000;

        transcriptionTime.textContent = `Tiempo de transcripción: ${elapsedTime.toFixed(2)} segundos`;

        campoDeTexto.value = data.text;

        status.textContent = "Estado: Transcripción finalizada";
      } catch (error) {
        console.error("Error", error);

        status.textContent = "Estado: Error de transcripción";
      }
    });

    // Comenzar
    mediaRecorder.start();

    status.textContent = "Estado: Grabando";

    startButton.disabled = true;
    stopButton.disabled = false;
  } catch (error) {
    console.error("Error al acceder al micrófono:", error);

    status.textContent = "Estado: No se pudo acceder al micrófono";

    alert(
      "No se pudo acceder al micrófono. " +
        "Verificá los permisos del navegador.",
    );
  }
});

// Finalizar grabación
stopButton.addEventListener("click", () => {
  if (!mediaRecorder) {
    return;
  }

  mediaRecorder.stop();

  // Detener realmente el micrófono
  mediaRecorder.stream.getTracks().forEach((track) => {
    track.stop();
  });

  status.textContent = "Estado: Detenido";

  startButton.disabled = false;
  stopButton.disabled = true;
});

transcribeRecordingButton.addEventListener("click", async () => {
  if (!recordedAudioBlob) {
    return;
  }

  const formData = new FormData();

  formData.append("file", recordedAudioBlob, "recording.webm");

  formData.append("model", modelSelect.value);

  status.textContent = "Estado: transcribiendo grabación...";

  try {
    const response = await fetch("http://localhost:8000/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    document.getElementById("transcription").value = data.text;

    status.textContent = "Estado: transcripción finalizada";
  } catch (error) {
    console.error(error);

    status.textContent = "Estado: error de transcripción";
  }
});

transcribeFileButton.addEventListener("click", async () => {
  const file = audioFile.files[0];

  if (!file) {
    alert("Seleccioná un archivo de audio.");
    return;
  }

  const formData = new FormData();

  formData.append("file", file, file.name);

  formData.append("model", modelSelect.value);

  status.textContent = "Estado: transcribiendo archivo...";

  try {
    const response = await fetch("http://localhost:8000/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    document.getElementById("transcription").value = data.text;

    status.textContent = "Estado: transcripción finalizada";
  } catch (error) {
    console.error(error);

    status.textContent = "Estado: error de transcripción";
  }
});
