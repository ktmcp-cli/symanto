#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import {
  getConfig,
  setConfig,
  getAllConfig,
  clearConfig,
  isConfigured,
} from './config.js';
import {
  analyzeSentiment,
  analyzeEmotion,
  analyzeEkmanEmotion,
  detectLanguage,
  analyzePersonality,
  analyzeCommunication,
  analyzeTopicSentiment,
} from './api.js';

const program = new Command();

// ─── Helpers ────────────────────────────────────────────────────────────────

function requireApiKey() {
  if (!isConfigured()) {
    console.error(
      chalk.red('Error: API key not set. Run: symanto config set --api-key YOUR_KEY')
    );
    process.exit(1);
  }
}

function outputJSON(data) {
  console.log(JSON.stringify(data, null, 2));
}

function bar(value, max = 1, width = 20) {
  const filled = Math.round((value / max) * width);
  return (
    chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled))
  );
}

function pct(value) {
  return chalk.bold((value * 100).toFixed(1) + '%');
}

function printSentiment(data) {
  const item = data[0];
  if (!item || !item.predictions) {
    console.log(chalk.yellow('No sentiment data returned.'));
    return;
  }
  console.log(chalk.bold.cyan('\nSentiment Analysis'));
  console.log(chalk.gray('─'.repeat(40)));
  for (const pred of item.predictions) {
    const color = pred.prediction === 'positive' ? chalk.green : chalk.red;
    console.log(
      `  ${color(pred.prediction.padEnd(10))}  ${bar(pred.probability)} ${pct(pred.probability)}`
    );
  }
  const top = item.predictions.reduce((a, b) =>
    a.probability > b.probability ? a : b
  );
  const topColor = top.prediction === 'positive' ? chalk.green : chalk.red;
  console.log(
    chalk.gray('\n  Verdict: ') + topColor.bold(top.prediction.toUpperCase())
  );
}

function printEmotion(data) {
  const item = data[0];
  if (!item || !item.predictions) {
    console.log(chalk.yellow('No emotion data returned.'));
    return;
  }
  const emotionColors = {
    joy: chalk.yellow,
    anger: chalk.red,
    sadness: chalk.blue,
    fear: chalk.magenta,
    surprise: chalk.cyan,
    disgust: chalk.green,
    love: chalk.magentaBright,
    thankfulness: chalk.greenBright,
    noEmotion: chalk.gray,
  };
  console.log(chalk.bold.cyan('\nEmotion Analysis'));
  console.log(chalk.gray('─'.repeat(40)));
  const sorted = [...item.predictions].sort((a, b) => b.probability - a.probability);
  for (const pred of sorted) {
    const color = emotionColors[pred.prediction] || chalk.white;
    console.log(
      `  ${color(pred.prediction.padEnd(14))}  ${bar(pred.probability)} ${pct(pred.probability)}`
    );
  }
  const top = sorted[0];
  const topColor = emotionColors[top.prediction] || chalk.white;
  console.log(
    chalk.gray('\n  Dominant emotion: ') + topColor.bold(top.prediction)
  );
}

function printEkmanEmotion(data) {
  const item = data[0];
  if (!item || !item.predictions) {
    console.log(chalk.yellow('No Ekman emotion data returned.'));
    return;
  }
  const ekmanColors = {
    anger: chalk.red,
    disgust: chalk.green,
    fear: chalk.magenta,
    joy: chalk.yellow,
    sadness: chalk.blue,
    surprise: chalk.cyan,
    neutral: chalk.gray,
  };
  console.log(chalk.bold.cyan('\nEkman Emotion Analysis'));
  console.log(chalk.gray('─'.repeat(40)));
  const sorted = [...item.predictions].sort((a, b) => b.probability - a.probability);
  for (const pred of sorted) {
    const color = ekmanColors[pred.prediction] || chalk.white;
    console.log(
      `  ${color(pred.prediction.padEnd(10))}  ${bar(pred.probability)} ${pct(pred.probability)}`
    );
  }
  const top = sorted[0];
  const topColor = ekmanColors[top.prediction] || chalk.white;
  console.log(
    chalk.gray('\n  Dominant: ') + topColor.bold(top.prediction)
  );
}

function printLanguage(data) {
  const item = data[0];
  if (!item) {
    console.log(chalk.yellow('No language data returned.'));
    return;
  }
  console.log(chalk.bold.cyan('\nLanguage Detection'));
  console.log(chalk.gray('─'.repeat(40)));
  const detected = item.detected_language || item.language || item.prediction || JSON.stringify(item);
  console.log(`  Detected language: ${chalk.bold.green(detected)}`);
}

function printPersonality(data) {
  const item = data[0];
  if (!item || !item.predictions) {
    console.log(chalk.yellow('No personality data returned.'));
    return;
  }
  console.log(chalk.bold.cyan('\nPersonality Traits'));
  console.log(chalk.gray('─'.repeat(40)));
  const traitColors = {
    Introvert: chalk.blue,
    Extrovert: chalk.yellow,
    Intuitive: chalk.magenta,
    Sensing: chalk.green,
    Thinking: chalk.cyan,
    Feeling: chalk.red,
    Judging: chalk.blue,
    Perceiving: chalk.yellow,
  };
  const sorted = [...item.predictions].sort((a, b) => b.probability - a.probability);
  for (const pred of sorted) {
    const color = traitColors[pred.prediction] || chalk.white;
    console.log(
      `  ${color(pred.prediction.padEnd(12))}  ${bar(pred.probability)} ${pct(pred.probability)}`
    );
  }
}

function printCommunication(data) {
  const item = data[0];
  if (!item || !item.predictions) {
    console.log(chalk.yellow('No communication data returned.'));
    return;
  }
  console.log(chalk.bold.cyan('\nCommunication & Tonality'));
  console.log(chalk.gray('─'.repeat(40)));
  const sorted = [...item.predictions].sort((a, b) => b.probability - a.probability);
  for (const pred of sorted) {
    console.log(
      `  ${chalk.white(pred.prediction.padEnd(18))}  ${bar(pred.probability)} ${pct(pred.probability)}`
    );
  }
  const top = sorted[0];
  console.log(
    chalk.gray('\n  Style: ') + chalk.bold.cyan(top.prediction)
  );
}

function printTopicSentiment(data) {
  const item = data[0];
  if (!item) {
    console.log(chalk.yellow('No topic-sentiment data returned.'));
    return;
  }
  console.log(chalk.bold.cyan('\nTopic Sentiment Analysis'));
  console.log(chalk.gray('─'.repeat(40)));
  const topics = item.topics || item.predictions || [];
  if (topics.length === 0) {
    console.log(chalk.gray('  No topics detected.'));
    return;
  }
  for (const topic of topics) {
    const sentColor =
      topic.sentiment === 'positive'
        ? chalk.green
        : topic.sentiment === 'negative'
        ? chalk.red
        : chalk.gray;
    const label = topic.topic || topic.category || topic.label || '(unknown)';
    const sent = topic.sentiment || topic.prediction || '';
    const score =
      topic.score != null ? ` ${pct(topic.score)}` : '';
    console.log(`  ${chalk.white(label.padEnd(20))} ${sentColor(sent)}${score}`);
  }
}

// ─── Program ─────────────────────────────────────────────────────────────────

program
  .name('symanto')
  .description('Symanto Psycholinguistic Text Analytics CLI')
  .version('1.0.0');

// ── config ───────────────────────────────────────────────────────────────────

const configCmd = program.command('config').description('Manage API configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'Symanto API key')
  .action((opts) => {
    if (opts.apiKey) {
      setConfig('apiKey', opts.apiKey);
      console.log(chalk.green('API key saved successfully.'));
    } else {
      console.log(chalk.yellow('No values provided. Use --api-key KEY'));
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const cfg = getAllConfig();
    if (Object.keys(cfg).length === 0) {
      console.log(chalk.yellow('No configuration set.'));
      return;
    }
    console.log(chalk.bold.cyan('\nCurrent Configuration'));
    console.log(chalk.gray('─'.repeat(40)));
    for (const [k, v] of Object.entries(cfg)) {
      const display = k === 'apiKey' ? chalk.gray('****' + String(v).slice(-4)) : v;
      console.log(`  ${chalk.bold(k)}: ${display}`);
    }
  });

configCmd
  .command('clear')
  .description('Clear all configuration')
  .action(() => {
    clearConfig();
    console.log(chalk.green('Configuration cleared.'));
  });

// ── sentiment ─────────────────────────────────────────────────────────────────

program
  .command('sentiment <text>')
  .description('Analyze sentiment (positive/negative)')
  .option('--lang <language>', 'Language code', 'en')
  .option('--json', 'Output raw JSON')
  .action(async (text, opts) => {
    requireApiKey();
    const spinner = ora('Analyzing sentiment...').start();
    try {
      const result = await analyzeSentiment(text, opts.lang);
      spinner.stop();
      if (opts.json) return outputJSON(result);
      printSentiment(result);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

// ── emotion ───────────────────────────────────────────────────────────────────

program
  .command('emotion <text>')
  .description('Analyze emotions in text')
  .option('--lang <language>', 'Language code', 'en')
  .option('--json', 'Output raw JSON')
  .action(async (text, opts) => {
    requireApiKey();
    const spinner = ora('Analyzing emotions...').start();
    try {
      const result = await analyzeEmotion(text, opts.lang);
      spinner.stop();
      if (opts.json) return outputJSON(result);
      printEmotion(result);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

// ── ekman ─────────────────────────────────────────────────────────────────────

program
  .command('ekman <text>')
  .description('Ekman emotion analysis (anger, disgust, fear, joy, sadness, surprise)')
  .option('--lang <language>', 'Language code', 'en')
  .option('--json', 'Output raw JSON')
  .action(async (text, opts) => {
    requireApiKey();
    const spinner = ora('Running Ekman emotion analysis...').start();
    try {
      const result = await analyzeEkmanEmotion(text, opts.lang);
      spinner.stop();
      if (opts.json) return outputJSON(result);
      printEkmanEmotion(result);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

// ── personality ───────────────────────────────────────────────────────────────

program
  .command('personality <text>')
  .description('Analyze personality traits (MBTI-like)')
  .option('--lang <language>', 'Language code', 'en')
  .option('--json', 'Output raw JSON')
  .action(async (text, opts) => {
    requireApiKey();
    const spinner = ora('Analyzing personality traits...').start();
    try {
      const result = await analyzePersonality(text, opts.lang);
      spinner.stop();
      if (opts.json) return outputJSON(result);
      printPersonality(result);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

// ── communication ─────────────────────────────────────────────────────────────

program
  .command('communication <text>')
  .description('Analyze communication style and tonality')
  .option('--lang <language>', 'Language code', 'en')
  .option('--json', 'Output raw JSON')
  .action(async (text, opts) => {
    requireApiKey();
    const spinner = ora('Analyzing communication style...').start();
    try {
      const result = await analyzeCommunication(text, opts.lang);
      spinner.stop();
      if (opts.json) return outputJSON(result);
      printCommunication(result);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

// ── language ──────────────────────────────────────────────────────────────────

program
  .command('language <text>')
  .description('Detect the language of text')
  .option('--json', 'Output raw JSON')
  .action(async (text, opts) => {
    requireApiKey();
    const spinner = ora('Detecting language...').start();
    try {
      const result = await detectLanguage(text);
      spinner.stop();
      if (opts.json) return outputJSON(result);
      printLanguage(result);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

// ── topic-sentiment ───────────────────────────────────────────────────────────

program
  .command('topic-sentiment <text>')
  .description('Analyze topics and their associated sentiments')
  .option('--lang <language>', 'Language code', 'en')
  .option('--json', 'Output raw JSON')
  .action(async (text, opts) => {
    requireApiKey();
    const spinner = ora('Analyzing topics and sentiments...').start();
    try {
      const result = await analyzeTopicSentiment(text, opts.lang);
      spinner.stop();
      if (opts.json) return outputJSON(result);
      printTopicSentiment(result);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

// ── analyze (all-in-one) ──────────────────────────────────────────────────────

program
  .command('analyze <text>')
  .description('Run sentiment, emotion, and personality analysis all at once')
  .option('--lang <language>', 'Language code', 'en')
  .option('--json', 'Output raw JSON')
  .action(async (text, opts) => {
    requireApiKey();
    const spinner = ora('Running full analysis...').start();
    try {
      const [sentiment, emotion, personality] = await Promise.all([
        analyzeSentiment(text, opts.lang),
        analyzeEmotion(text, opts.lang),
        analyzePersonality(text, opts.lang),
      ]);
      spinner.stop();
      if (opts.json) {
        return outputJSON({ sentiment, emotion, personality });
      }
      console.log(chalk.bold.magenta('\nFull Text Analysis'));
      console.log(chalk.gray('═'.repeat(40)));
      printSentiment(sentiment);
      printEmotion(emotion);
      printPersonality(personality);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.parse(process.argv);
