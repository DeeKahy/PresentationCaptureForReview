import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// Configure transformers.js
env.allowLocalModels = false;
env.allowRemoteModels = true;

// UI Elements
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const transcriptionText = document.getElementById('transcriptionText');
const statusText = document.getElementById('statusText');
const modelStatus = document.getElementById('modelStatus');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTime = document.getElementById('recordingTime');

// State
let transcriber = null;
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let recordingInterval = null;

// Initialize the Whisper model
async function initializeModel() {
    try {
        statusText.textContent = 'Loading Whisper Small model... This may take a few minutes on first load.';
        progressBar.style.display = 'block';
        
        // Create the transcriber with progress callback
        transcriber = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-small.en',
            {
                progress_callback: (progress) => {
                    if (progress.status === 'downloading') {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        progressFill.style.width = `${percent}%`;
                        progressText.textContent = `${percent}%`;
                        statusText.textContent = `Downloading model... ${progress.file}`;
                    } else if (progress.status === 'loading') {
                        statusText.textContent = `Loading model... ${progress.file}`;
                    }
                }
            }
        );
        
        progressBar.style.display = 'none';
        statusText.textContent = 'Model loaded! Ready to record.';
        modelStatus.querySelector('.status-icon').textContent = '✅';
        recordBtn.disabled = false;
        
    } catch (error) {
        console.error('Error loading model:', error);
        statusText.textContent = `Error: ${error.message}`;
        modelStatus.querySelector('.status-icon').textContent = '❌';
    }
}

// Start recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Use webm opus for better compatibility and quality
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
            ? 'audio/webm;codecs=opus' 
            : 'audio/webm';
        
        mediaRecorder = new MediaRecorder(stream, { mimeType });
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());
            await processAudio();
        };
        
        mediaRecorder.start();
        
        // Update UI
        recordBtn.style.display = 'none';
        stopBtn.style.display = 'flex';
        stopBtn.disabled = false;
        recordingIndicator.style.display = 'flex';
        
        // Start timer
        recordingStartTime = Date.now();
        updateRecordingTime();
        recordingInterval = setInterval(updateRecordingTime, 1000);
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please ensure you have granted microphone permissions.');
    }
}

// Update recording time display
function updateRecordingTime() {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    recordingTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        
        // Update UI
        stopBtn.disabled = true;
        recordingIndicator.style.display = 'none';
        clearInterval(recordingInterval);
        
        statusText.textContent = 'Processing audio...';
        modelStatus.querySelector('.status-icon').textContent = '⏳';
    }
}

// Process the recorded audio
async function processAudio() {
    try {
        // Create blob from chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert blob to array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // Decode audio data
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get audio data (mono channel)
        let audio;
        if (audioBuffer.numberOfChannels === 2) {
            const channel1 = audioBuffer.getChannelData(0);
            const channel2 = audioBuffer.getChannelData(1);
            audio = new Float32Array(channel1.length);
            for (let i = 0; i < channel1.length; i++) {
                audio[i] = (channel1[i] + channel2[i]) / 2;
            }
        } else {
            audio = audioBuffer.getChannelData(0);
        }
        
        // Transcribe
        statusText.textContent = 'Transcribing...';
        const result = await transcriber(audio, {
            language: 'english',
            task: 'transcribe',
            chunk_length_s: 30,
            stride_length_s: 5,
        });
        
        // Display result
        const currentText = transcriptionText.value;
        const newText = result.text.trim();
        
        if (currentText) {
            transcriptionText.value = currentText + '\n\n' + newText;
        } else {
            transcriptionText.value = newText;
        }
        
        copyBtn.disabled = false;
        clearBtn.disabled = false;
        
        statusText.textContent = 'Transcription complete! Ready to record again.';
        modelStatus.querySelector('.status-icon').textContent = '✅';
        
        // Reset UI
        recordBtn.style.display = 'flex';
        stopBtn.style.display = 'none';
        recordBtn.disabled = false;
        
    } catch (error) {
        console.error('Error processing audio:', error);
        statusText.textContent = `Error: ${error.message}`;
        modelStatus.querySelector('.status-icon').textContent = '❌';
        
        // Reset UI
        recordBtn.style.display = 'flex';
        stopBtn.style.display = 'none';
        recordBtn.disabled = false;
    }
}

// Copy text to clipboard
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(transcriptionText.value);
        
        // Show feedback
        const originalText = copyBtn.querySelector('.btn-text').textContent;
        copyBtn.querySelector('.btn-text').textContent = 'Copied!';
        copyBtn.querySelector('.btn-icon').textContent = '✅';
        
        setTimeout(() => {
            copyBtn.querySelector('.btn-text').textContent = originalText;
            copyBtn.querySelector('.btn-icon').textContent = '📋';
        }, 2000);
        
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Could not copy to clipboard');
    }
}

// Clear transcription text
function clearTranscription() {
    if (confirm('Are you sure you want to clear all transcription text?')) {
        transcriptionText.value = '';
        copyBtn.disabled = true;
        clearBtn.disabled = true;
    }
}

// Event listeners
recordBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
copyBtn.addEventListener('click', copyToClipboard);
clearBtn.addEventListener('click', clearTranscription);

// Initialize on page load
initializeModel();
