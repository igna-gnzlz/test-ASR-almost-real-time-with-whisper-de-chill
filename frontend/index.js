let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const status = document.getElementById("status");
const audioContainer = document.getElementById("audioContainer");
const campoDeTexto = document.getElementById("transcription");

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

      const formData = new FormData();

      formData.append("file", audioBlob, "recording.webm");

      status.textContent = "Estado: transcribiendo...";

      try {
        const response = await fetch("http://localhost:8000/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        campoDeTexto.value = data.text;

        status.textContent = "Estado: transcripción finalizada";
      } catch (error) {
        console.error("Error", error);

        status.textContent = "Estado: error de transcripción";
      }
    });

    // Comenzar
    mediaRecorder.start();

    status.textContent = "Estado: grabando";

    startButton.disabled = true;
    stopButton.disabled = false;
  } catch (error) {
    console.error("Error al acceder al micrófono:", error);

    status.textContent = "Estado: no se pudo acceder al micrófono";

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

  status.textContent = "Estado: detenido";

  startButton.disabled = false;
  stopButton.disabled = true;
});
