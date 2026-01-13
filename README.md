# Form Builder Bug Report

A single-page web application featuring a full-screen AI chatbot that converts user-reported issues into professional, developer-ready bug reports. Built for the low-code Form Builder platform.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black.svg)

## ✨ Features

- 🤖 **AI-Powered Bug Reports** - Automatically converts user descriptions into structured, professional bug reports
- 📝 **Text Input** - Describe bugs in natural language
- 🖼️ **Image Upload** - Attach screenshots via file picker or drag-and-drop
- 🌓 **Dark/Light Theme** - Toggle between themes with persistence
- 📋 **DevOps Ready** - Output formatted for Jira, Azure Boards, and DevOps tools
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ♿ **Accessible** - ARIA labels and keyboard navigation support
- ⚡ **Fast & Lightweight** - No frameworks, pure HTML/CSS/JavaScript

## 🚀 Quick Deploy

Deploy your own instance with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/form-builder-bug-report&env=OPENROUTER_API_KEY&envDescription=API%20key%20from%20OpenRouter.ai&envLink=https://openrouter.ai/keys)

## 📦 Manual Deployment

### Prerequisites

- [Node.js](https://nodejs.org/) (for Vercel CLI)
- [Vercel Account](https://vercel.com/signup)
- [OpenRouter API Key](https://openrouter.ai/keys)

### Step-by-Step

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/form-builder-bug-report.git
   cd form-builder-bug-report
   ```

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Configure Environment Variable**
   
   Go to your Vercel Dashboard → Project → Settings → Environment Variables
   
   Add:
   - `OPENROUTER_API_KEY` = Your OpenRouter API key

6. **Redeploy for changes to take effect**
   ```bash
   vercel --prod
   ```

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | Your API key from [OpenRouter.ai](https://openrouter.ai/keys) |
| `SITE_URL` | ❌ No | Your deployed app URL (used for OpenRouter headers) |

## 📁 Project Structure

```
form-builder-bug-report/
├── api/
│   └── chat.py          # Vercel serverless function
├── public/
│   ├── index.html       # Main HTML page
│   ├── styles.css       # Complete styling
│   └── script.js        # Frontend JavaScript
├── vercel.json          # Vercel configuration
├── requirements.txt     # Python dependencies
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 💻 Local Development

1. **Clone and navigate to project**
   ```bash
   git clone https://github.com/YOUR_USERNAME/form-builder-bug-report.git
   cd form-builder-bug-report
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Add your API key to `.env`**
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

4. **Run with Vercel Dev**
   ```bash
   vercel dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔒 Security Notes

- **Never commit API keys** - The `.env` file is gitignored
- **Use environment variables** - API keys are read from `os.environ` in the serverless function
- **CORS enabled** - The API allows cross-origin requests for flexibility
- **Input validation** - File uploads are validated for type and size (max 10MB)

## 🎨 Customization

### Changing the AI Model

Edit `api/chat.py` and modify the `MODEL` constant:

```python
MODEL = "google/gemini-2.0-flash-exp:free"  # Change to any OpenRouter model
```

### Adjusting Response Parameters

```python
MAX_TOKENS = 2048      # Maximum response length
TEMPERATURE = 0.3      # Lower = more focused, Higher = more creative
```

### Modifying the System Prompt

The `SYSTEM_PROMPT` constant in `api/chat.py` defines how the AI generates bug reports. Customize it to match your team's bug report format.

## 📝 Bug Report Output Format

The AI generates bug reports in the following structure:

```
Summary:
_______________________________________________________

Title:
_______________________________________________________

Reproduce Steps:
_______________________________________________________

Actual Result:
_______________________________________________________

Expected Result:
```

This format is designed to be copy-paste ready for:
- Azure DevOps
- Jira
- GitHub Issues
- Linear
- Any ticketing system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) - AI model routing
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI model
- [Vercel](https://vercel.com/) - Hosting and serverless functions
- [Inter Font](https://rsms.me/inter/) - Typography

---

Built with ❤️ for QA Engineers and Developers
