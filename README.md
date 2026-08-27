# WhisperX Test

MVP de un sistema de transcripción de audio utilizando **WhisperX**, con un frontend web simple y un backend desarrollado con **FastAPI**.

Actualmente permite:

- Capturar audio desde el micrófono del navegador.
- Iniciar y finalizar una grabación.
- Enviar el audio grabado al backend.
- Procesar el audio mediante WhisperX.
- Mostrar la transcripción en el navegador.

> **Estado actual:** este MVP realiza la transcripción una vez finalizada la grabación. El procesamiento casi en tiempo real será implementado posteriormente.

---

## 1. Requisitos

Antes de comenzar, asegurarse de tener instalado:

- [Git](https://git-scm.com/)
- [Python](https://www.python.org/)
- [FFmpeg](https://www.gyan.dev/ffmpeg/builds/)
- Un navegador moderno, como Chrome o Edge.
- Visual Studio Code (recomendado).

### Importante

WhisperX utiliza `torchcodec` para el procesamiento del audio. La versión utilizada actualmente requiere una versión compatible de FFmpeg, pero dicha versión ya no está mantenida ni estable.

Es posible que en la terminal salte el siguiente error, pero lo pueden ignorar sin problemas:

```text
fix torchcodec installation. Error message was:

Could not load libtorchcodec. Likely causes:
          1. FFmpeg is not properly installed in your environment. We support
             versions 4, 5, 6 and 7.
          2. The PyTorch version (2.8.0+cpu) is not compatible with
             this version of TorchCodec. Refer to the version compatibility
             table:
             https://github.com/pytorch/torchcodec?tab=readme-ov-file#installing-torchcodec.
          3. Another runtime dependency; see exceptions below.
        The following exceptions were raised as we tried to load libtorchcodec:

[start of libtorchcodec loading traceback]
FFmpeg version 7: Could not find module 'C:\Users\incri\OneDrive\Escritorio\code\whisperX-test\.venv\Lib\site-packages\torchcodec\libtorchcodec_core7.dll' (or one of its dependencies). Try using the full path with constructor syntax.
FFmpeg version 6: Could not find module 'C:\Users\incri\OneDrive\Escritorio\code\whisperX-test\.venv\Lib\site-packages\torchcodec\libtorchcodec_core6.dll' (or one of its dependencies). Try using the full path with constructor syntax.
FFmpeg version 5: Could not find module 'C:\Users\incri\OneDrive\Escritorio\code\whisperX-test\.venv\Lib\site-packages\torchcodec\libtorchcodec_core5.dll' (or one of its dependencies). Try using the full path with constructor syntax.
FFmpeg version 4: Could not find module 'C:\Users\incri\OneDrive\Escritorio\code\whisperX-test\.venv\Lib\site-packages\torchcodec\libtorchcodec_core4.dll' (or one of its dependencies). Try using the full path with constructor syntax.
[end of libtorchcodec loading traceback].
```

---

## 2. Clonar el repositorio

Clonar el proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar al directorio:

```bash
cd <NOMBRE_DEL_REPOSITORIO>
```

La estructura esperada es:

```text
.
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── venv/
│
└── frontend/
    └── index.html
```

> La carpeta `venv/` no debería estar incluida en Git. Cada desarrollador debe crear su propio entorno virtual.

---

# Backend

## 3. Crear el entorno virtual

Ingresar al directorio del backend:

```bash
cd backend
```

Crear el entorno virtual:

```bash
python -m venv venv
```

### Windows

Activar el entorno:

```powershell
venv\Scripts\activate
```

Si se activó correctamente, debería aparecer `(venv)` al comienzo de la terminal.

### Linux / macOS

```bash
source venv/bin/activate
```

---

## 4. Instalar las dependencias

Con el entorno virtual activado:

```bash
pip install -r requirements.txt
```

Las principales dependencias son:

- **WhisperX**: transcripción y procesamiento del audio.
- **FastAPI**: API del backend.
- **Uvicorn**: servidor ASGI.
- **PyTorch**: framework utilizado por WhisperX.
- **TorchCodec**: procesamiento/decodificación de audio.

La instalación puede tardar varios minutos debido al tamaño de PyTorch y las dependencias de WhisperX.

---

## 5. Levantar el backend

Desde `backend/` y con el entorno virtual activado:

```bash
uvicorn app:app --reload
```

El servidor debería quedar disponible en:

```text
http://localhost:8000
```

Se puede comprobar accediendo desde el navegador a:

```text
http://localhost:8000
```

Debería responder:

```json
{
  "status": "ok"
}
```

---

# Frontend

## 6. Levantar el frontend

El frontend debe ejecutarse mediante un servidor HTTP local para que el navegador pueda utilizar correctamente el micrófono.

### Opción recomendada: VS Code + Live Server

Instalar la extensión:

**Live Server**

Luego:

1. Abrir el proyecto en VS Code.
2. Abrir `frontend/index.html`.
3. Hacer clic derecho sobre el archivo.
4. Seleccionar **Open with Live Server**.

Se abrirá una dirección similar a:

```text
http://127.0.0.1:5500
```

---

## 7. Utilizar el sistema

Una vez que estén funcionando ambos servidores:

```text
Frontend
http://127.0.0.1:5500
        │
        │ POST /transcribe
        ▼
Backend
http://localhost:8000
        │
        ▼
     WhisperX
```

En el navegador:

1. Presionar **Comenzar**.
2. Aceptar el permiso para utilizar el micrófono.
3. Hablar.
4. Presionar **Finalizar**.
5. El audio será enviado al backend.
6. WhisperX procesará el audio.
7. La transcripción aparecerá en el campo de texto.

---

# Solución de problemas

## Error de CORS

Si el navegador muestra un error similar a:

```text
blocked by CORS policy
```

verificar que `app.py` tenga configurado CORS para el origen del frontend:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Después de modificar el backend, reiniciar Uvicorn.

---

## Error relacionado con TorchCodec / FFmpeg

Si aparece:

```text
Could not load libtorchcodec
```

Simplemente ignorarlo.

---

## El navegador no permite utilizar el micrófono

El navegador debe tener permiso para acceder al micrófono.

Además, el frontend debe ejecutarse mediante:

```text
http://localhost:5500
```

o:

```text
http://127.0.0.1:5500
```

No se recomienda abrir directamente el archivo:

```text
file:///.../index.html
```

---

# Desarrollo

Para trabajar en el proyecto se necesitan dos terminales.

### Terminal 1 - Backend

```powershell
cd backend
venv\Scripts\activate
uvicorn app:app --reload
```

### Terminal 2 - Frontend

Abrir `frontend/index.html` mediante Live Server.

---

# Próximos pasos

El objetivo del proyecto es evolucionar este MVP hacia un sistema de **transcripción casi en tiempo real**.

La siguiente etapa consiste en modificar el flujo actual:

```text
Grabar
   ↓
Finalizar
   ↓
Enviar audio completo
   ↓
WhisperX
   ↓
Transcripción
```

hacia:

```text
Micrófono
   ↓
Fragmentos de audio
   ↓
Backend
   ↓
WhisperX
   ↓
Transcripción incremental
   ↓
Actualización de la interfaz
```

Posteriormente se podrá incorporar:

- Pausar y reanudar la grabación.
- Procesamiento casi en tiempo real.
- Diarización de hablantes.
- Segmentación temporal.
- Acumulación de contexto.
- Procesamiento incremental mediante un LLM.
- Detección de entidades.
- Anonimización de información sensible.
- Generación de preguntas sugeridas a partir de la denuncia.
