# AGENT.md — Symanto CLI Reference

Quick reference for AI agents using `@ktmcp-cli/symanto`.

## Setup

```bash
symanto config set --api-key $SYMANTO_API_KEY
```

## Key Commands

```bash
# Sentiment: positive/negative with confidence scores
symanto sentiment "Your text here" --lang en --json

# Emotion: joy, anger, sadness, fear, love, surprise, etc.
symanto emotion "Your text here" --lang en --json

# Ekman emotions: anger, disgust, fear, joy, sadness, surprise
symanto ekman "Your text here" --lang en --json

# Personality traits (MBTI-like dimensions)
symanto personality "Your text here" --lang en --json

# Communication style and tonality
symanto communication "Your text here" --lang en --json

# Language detection (no --lang needed)
symanto language "Your text here" --json

# Topic + sentiment combined
symanto topic-sentiment "Your text here" --lang en --json

# Full analysis: sentiment + emotion + personality in parallel
symanto analyze "Your text here" --lang en --json
```

## Configuration Commands

```bash
symanto config set --api-key KEY   # Save API key
symanto config show                # Show config (key masked)
symanto config clear               # Remove all config
```

## JSON Output Structure

All endpoints return arrays. First element `[0]` contains results.

### Sentiment
```json
[{ "id": "1", "predictions": [{ "prediction": "positive", "probability": 0.91 }] }]
```

### Emotion
```json
[{ "id": "1", "predictions": [{ "prediction": "joy", "probability": 0.87 }, ...] }]
```

### Ekman Emotion
```json
[{ "id": "1", "predictions": [{ "prediction": "anger", "probability": 0.76 }, ...] }]
```

### Language Detection
```json
[{ "id": "1", "detected_language": "en" }]
```

### Personality
```json
[{ "id": "1", "predictions": [{ "prediction": "Extrovert", "probability": 0.68 }, ...] }]
```

### Communication
```json
[{ "id": "1", "predictions": [{ "prediction": "Assertive", "probability": 0.72 }, ...] }]
```

### Topic Sentiment
```json
[{ "id": "1", "topics": [{ "topic": "battery", "sentiment": "positive", "score": 0.89 }] }]
```

### Analyze (all-in-one)
```json
{
  "sentiment": [...],
  "emotion": [...],
  "personality": [...]
}
```

## Scripting Pattern

```bash
# Extract dominant sentiment
symanto sentiment "Amazing product!" --json | node -e \
  "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
   const top=d[0].predictions.sort((a,b)=>b.probability-a.probability)[0];
   console.log(top.prediction, (top.probability*100).toFixed(1)+'%')"

# Pipe to jq
symanto emotion "I'm so happy today!" --json | jq '.[0].predictions | max_by(.probability)'
```

## Environment Variable

You can set the API key via environment instead of `config set`:

```bash
SYMANTO_API_KEY=your_key symanto sentiment "Hello"
```

(Requires the CLI to support env fallback — see src/config.js.)

## Error Handling

- `401` — Invalid or missing API key
- `422` — Invalid request format
- `429` — Rate limit exceeded
- Network errors are reported with full message

All errors exit with code `1`.

## Supported Languages

`en`, `de`, `es`, `fr`, `it`, `pt`, `nl`, `tr`, `ar` (and more depending on endpoint).
Default language is `en` for all commands that accept `--lang`.
