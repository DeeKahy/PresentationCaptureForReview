# PresentationCaptureForReview

A completely frontend JavaScript application that records your spoken presentation and converts it to text using Whisper AI - all running in your browser with no server required!

## Features

- 🎤 **Browser-based audio recording** - Uses your microphone to capture presentations
- 🤖 **Whisper Small model** - English-only transcription (~300MB model)
- 💾 **Automatic caching** - Model downloads once and caches in your browser
- 📋 **Easy copying** - One-click copy to clipboard for pasting into LLMs
- 🔒 **Privacy-focused** - All processing happens locally in your browser
- 🌐 **GitHub Pages ready** - Deploy as a static site with zero server costs

## Live Demo

Visit the [live demo](https://your-username.github.io/PresentationCaptureForReview/) (replace with your actual GitHub Pages URL)

## How to Use

1. Open the application in a modern browser (Chrome, Edge, or Safari recommended)
2. Wait for the Whisper model to download (only happens on first visit, ~300MB)
3. Click "Start Recording" and grant microphone permissions
4. Speak your presentation
5. Click "Stop Recording" when done
6. Wait a few seconds for transcription
7. Copy the text and paste it anywhere you need!

## Deployment to GitHub Pages

1. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "main" branch as source
   - Save changes

2. **Access your site:**
   - Your site will be available at: `https://your-username.github.io/PresentationCaptureForReview/`
   - First load will download the model (~300MB) - subsequent visits use cached version

## Technical Details

- **Frontend Framework:** Vanilla JavaScript (ES6 modules)
- **Speech Recognition:** Transformers.js with Whisper Small English model
- **Audio Recording:** MediaRecorder API with WebM format
- **Model Size:** ~300MB (downloads and caches automatically)
- **Browser Support:** Chrome, Edge, Safari (requires modern browser with Web Audio API)

## Browser Requirements

- Modern browser with ES6 module support
- Microphone access permissions
- Sufficient storage for model caching (~300MB)
- Web Audio API support
- MediaRecorder API support

## Privacy & Security

All audio processing happens entirely in your browser. No data is sent to any server. The Whisper model is downloaded from Hugging Face CDN and cached locally.

## License

MIT License - Feel free to use and modify as needed!
