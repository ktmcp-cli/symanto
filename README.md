# Symanto Text Analytics CLI

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
> — Peter Steinberger, Founder of OpenClaw

`@ktmcp-cli/symanto` is a production-ready command-line interface for the [Symanto](https://symanto.com) Psycholinguistic Text Analytics API. Analyze sentiment, emotions, personality traits, communication styles, and more — directly from your terminal or scripts.

> **Unofficial CLI.** This package is not affiliated with or endorsed by Symanto Group.

---

## Installation

```bash
npm install -g @ktmcp-cli/symanto
```

Or run without installing:

```bash
npx @ktmcp-cli/symanto <command>
```

---

## Setup

Obtain an API key from [Symanto](https://symanto.com) and configure the CLI:

```bash
symanto config set --api-key YOUR_API_KEY
```

---

## Commands

### Configuration

```bash
# Set your API key
symanto config set --api-key YOUR_API_KEY

# Show current configuration (key is masked)
symanto config show

# Clear all configuration
symanto config clear
```

### Sentiment Analysis

Detect whether text is positive or negative.

```bash
symanto sentiment "I absolutely love this product!"
symanto sentiment "The service was terrible." --lang en
symanto sentiment "Das ist wunderbar!" --lang de --json
```

### Emotion Analysis

Identify emotions such as joy, anger, sadness, fear, love, and more.

```bash
symanto emotion "I can't believe they did that to me!"
symanto emotion "She smiled and everything felt right." --lang en --json
```

### Ekman Emotion Analysis

Classify text using Ekman's six basic emotions: anger, disgust, fear, joy, sadness, surprise.

```bash
symanto ekman "This is absolutely outrageous!"
symanto ekman "I had no idea that was going to happen." --lang en
symanto ekman "I feel so sad today." --json
```

### Personality Traits

Analyze MBTI-like personality dimensions (Introvert/Extrovert, Intuitive/Sensing, Thinking/Feeling, Judging/Perceiving).

```bash
symanto personality "I love spending time with large groups of people and brainstorming new ideas together!"
symanto personality "I prefer working alone and following a structured plan." --lang en --json
```

### Communication Style & Tonality

Understand how someone communicates — their style and tone.

```bash
symanto communication "You really need to listen to me right now."
symanto communication "I was wondering if perhaps you might consider my proposal?" --lang en
symanto communication "Here are the facts: sales dropped 12% last quarter." --json
```

### Language Detection

Automatically detect what language a piece of text is written in.

```bash
symanto language "Bonjour, comment allez-vous?"
symanto language "Ich bin sehr glücklich heute." --json
symanto language "今日はとても良い天気です。"
```

### Topic Sentiment Analysis

Extract topics from text and determine the sentiment associated with each topic.

```bash
symanto topic-sentiment "The battery life is great but the screen quality is disappointing."
symanto topic-sentiment "Fast shipping, but the packaging was damaged." --lang en
symanto topic-sentiment "I love the food here, though the service could be better." --json
```

### Full Analysis (All-in-One)

Run sentiment, emotion, and personality analysis in parallel with a single command.

```bash
symanto analyze "I've always been a creative thinker who gets energized by solving complex problems with a team."
symanto analyze "I hate how they handled the situation — it made me feel completely ignored." --lang en
symanto analyze "Today was a good day." --json
```

---

## Output Formats

By default, results are displayed in a colorized, human-readable format with progress bars showing confidence scores.

Add `--json` to any command to get raw JSON output, suitable for scripting and piping:

```bash
symanto sentiment "Great experience!" --json | jq '.[0].predictions'
```

---

## Language Support

Most endpoints accept a `--lang` option. Common codes:

| Code | Language   |
|------|------------|
| en   | English    |
| de   | German     |
| es   | Spanish    |
| fr   | French     |
| it   | Italian    |
| pt   | Portuguese |
| nl   | Dutch      |
| tr   | Turkish    |
| ar   | Arabic     |

The `language` command detects language automatically and does not require `--lang`.

---

## Requirements

- Node.js >= 18.0.0
- A valid Symanto API key

---

## License

MIT — Copyright 2024 KTMCP

---

## Links

- Symanto API: https://symanto.com
- Issues: https://github.com/ktmcp-cli/symanto/issues
- Homepage: https://killthemcp.com/symanto-cli
