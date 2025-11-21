import path from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';

import { analyzeGoogleEarthScreenshot, DEFAULT_REFERENCE_EXAMPLES } from './main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_FAILURES_TO_SHOW = 20;

const DATASETS = [
  {
    id: '2d',
    label: '2d_images',
    csv: '2d_images.csv',
    expected: new Set(['2', '3']),
  },
  {
    id: '3d',
    label: '3d_images',
    csv: '3d_images.csv',
    expected: new Set(['1']),
  },
];

const CONFIG = Object.freeze({
  maxImages: parseImageLimit(process.argv.slice(2)),
});

function parsePrediction(text) {
  if (!text) {
    return null;
  }

  const firstLine = text.trim().split(/\r?\n/)[0] ?? '';
  const match = firstLine.match(/\b([1-3])\b/);
  return match ? match[1] : null;
}

async function evaluateDataset(dataset, maxImages = Infinity) {
  const { label, csv, expected } = dataset;
  const urls = await loadUrlsFromCsv(csv);

  if (urls.length === 0) {
    console.warn(`[warn] No URLs found in ${csv}`);
  }

  const safeMax = Number.isFinite(maxImages) ? maxImages : Infinity;
  const results = [];
  let processed = 0;

  for (const url of urls) {
    if (processed >= safeMax) {
      break;
    }

    const fileName = extractNameFromUrl(url);
    const imageUrl = url;

    let text = '';
    let prediction = null;
    let error = null;

    try {
      const response = await analyzeGoogleEarthScreenshot(
        imageUrl,
        DEFAULT_REFERENCE_EXAMPLES,
      );
      text = response?.text ?? '';
      prediction = parsePrediction(text);
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
    }

    const isCorrect = !error && prediction !== null && expected.has(prediction);

    results.push({
      dataset: label,
      fileName,
      prediction,
      isCorrect,
      error,
    });

    if (error) {
      console.error(`[error] ${label}/${fileName}: ${error.message}`);
    } else {
      const status = isCorrect ? '✓' : '✗';
      console.log(
        `[${status}] ${label}/${fileName} -> ${prediction ?? 'N/A'}`
      );
    }

    processed += 1;
  }

  return { results, processed };
}

function summarize(results) {
  const total = results.length;
  const correct = results.filter((r) => r.isCorrect).length;
  const incorrect = total - correct;
  const accuracy = total ? ((correct / total) * 100).toFixed(2) : '0.00';

  console.log('\n=== Overall Summary ===');
  console.log(`Total images: ${total}`);
  console.log(`Correct: ${correct}`);
  console.log(`Incorrect: ${incorrect}`);
  console.log(`Accuracy: ${accuracy}%`);

  console.log('\nPer dataset:');
  const perDataset = results.reduce((acc, result) => {
    if (!acc[result.dataset]) {
      acc[result.dataset] = { total: 0, correct: 0 };
    }
    acc[result.dataset].total += 1;
    if (result.isCorrect) {
      acc[result.dataset].correct += 1;
    }
    return acc;
  }, {});

  for (const [dataset, stats] of Object.entries(perDataset)) {
    const datasetAccuracy = stats.total
      ? ((stats.correct / stats.total) * 100).toFixed(2)
      : '0.00';
    console.log(
      `- ${dataset}: ${stats.correct}/${stats.total} correct (${datasetAccuracy}%)`
    );
  }

  const failures = results.filter((r) => !r.isCorrect);
  if (failures.length) {
    console.log('\nIncorrect predictions:');
    failures.slice(0, MAX_FAILURES_TO_SHOW).forEach((failure) => {
      const errorMsg = failure.error
        ? ` (error: ${failure.error.message ?? failure.error})`
        : '';
      console.log(
        `- ${failure.dataset}/${failure.fileName}: predicted ${failure.prediction ?? 'N/A'}${errorMsg}`
      );
    });
    if (failures.length > MAX_FAILURES_TO_SHOW) {
      console.log(`...and ${failures.length - MAX_FAILURES_TO_SHOW} more`);
    }
  }
}

async function main() {
  const aggregateResults = [];
  let remaining = CONFIG.maxImages;

  if (Number.isFinite(remaining)) {
    console.log(`[info] Limiting evaluation to ${remaining} images total.`);
  }

  for (const dataset of DATASETS) {
    if (remaining <= 0) {
      break;
    }

    const { results: datasetResults, processed } = await evaluateDataset(dataset, remaining);
    aggregateResults.push(...datasetResults);

    if (Number.isFinite(remaining)) {
      remaining -= processed;
    }
  }

  if (aggregateResults.length === 0) {
    console.log('No images were evaluated. Check your limit or dataset folders.');
    return;
  }

  summarize(aggregateResults);
}

main().catch((error) => {
  console.error('Evaluation failed:', error);
  process.exit(1);
});

function parseImageLimit(argv) {
  const cliValue = extractLimitFromArgs(argv);
  const envValue = process.env.EVAL_IMAGE_LIMIT;
  const limitInput = cliValue ?? envValue ?? null;

  if (limitInput === null || limitInput === undefined || limitInput === '') {
    return Infinity;
  }

  const limit = Number.parseInt(limitInput, 10);

  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error(
      `Invalid image limit "${limitInput}". Please provide a positive integer.`
    );
  }

  return limit;
}

function extractLimitFromArgs(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--limit' || arg === '-n') {
      const value = argv[i + 1];
      if (value === undefined) {
        throw new Error('Missing value after --limit/-n flag.');
      }
      return value;
    }

    if (arg.startsWith('--limit=')) {
      return arg.slice('--limit='.length);
    }
  }

  return null;
}

async function loadUrlsFromCsv(csvRelativePath) {
  const csvPath = path.join(__dirname, csvRelativePath);
  const raw = await readFile(csvPath, 'utf8');

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const dataLines =
    lines[0].toLowerCase().replace(/"/g, '') === 'url' ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      let value = line;
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      return value.trim();
    })
    .filter((value) => value.length > 0);
}

function extractNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? url;
  } catch {
    return url;
  }
}

