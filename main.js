import 'dotenv/config';
import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { fileURLToPath } from 'url';

const defaultImageUrl = 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/815884/cleaned_3333453.jpg';
const __filename = fileURLToPath(import.meta.url);

/**
 * @typedef {Object} ReferenceExample
 * @property {'1' | '2' | '3'} label - Correct class label for the reference image.
 * @property {string} imageUrl - URL of the reference screenshot.
 * @property {string} [note] - Optional extra context about why this is a good example.
 */

/**
 * Default labeled reference examples used for few-shot classification.
 * Filled with real examples from your 3D and 2D datasets.
 */
export const DEFAULT_REFERENCE_EXAMPLES = [
  {
    label: '1',
    imageUrl: 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928739/cleaned_3294180.jpg',
    note: 'New ultra-realistic photogrammetry 3D',
  },
  {
    label: '1',
    imageUrl: 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928733/cleaned_3294240.jpg',
    note: 'New ultra-realistic photogrammetry 3D',
  },
  {
    label: '2',
    imageUrl: 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/822910/cleaned_3296360.jpg',
    note: 'Classic/old-style 3D',
  },
  {
    label: '2',
    imageUrl: 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/821844/cleaned_3316221.jpg',
    note: 'Classic/old-style 3D',
  },
  {
    label: '1',
    imageUrl: 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/927972/cleaned_3296049.jpg',
    note: 'New ultra-realistic photogrammetry 3D',
  },
  {
    label: '2',
    imageUrl: 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/822139/cleaned_3313871.jpg',
    note: 'Classic/old-style 3D',
  },
  {
    label: '2',
    imageUrl: 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/822041/cleaned_3314665.jpg',
    note: 'Classic/old-style 3D',
  },
  {
    label: '2',
    imageUrl: 'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/815965/cleaned_3331701.jpg',
    note: 'Classic/old-style 3D',
  },
];

/**
 * Analyze a Google Earth / Google Maps screenshot, with optional few-shot
 * classification using labeled reference images.
 *
 * @param {string} imageUrl - URL of the target screenshot to classify.
 * @param {ReferenceExample[]} [referenceExamples=DEFAULT_REFERENCE_EXAMPLES] - Optional
 *   labeled reference images that will be shown to the model before the target image.
 * @param {boolean} [withReasoning=false] - If true, include detailed reasoning in the response.
 */
export async function analyzeGoogleEarthScreenshot(
  imageUrl,
  referenceExamples = DEFAULT_REFERENCE_EXAMPLES,
  withReasoning = false,
) {
  const userContent = [];

  const hasReferences = Array.isArray(referenceExamples) && referenceExamples.length > 0;

  let systemPrompt, transitionText, zeroShotText;

  if (withReasoning) {
    systemPrompt = `You are an expert at identifying Google Earth / Google Maps view modes.

You will sometimes be given **labeled reference examples** first. Each labeled example includes:
- The correct answer in the text, e.g. "Labeled example (answer = 1 – New ultra-realistic photogrammetry 3D)."
- An image that matches that label.

Treat these labeled examples as ground-truth demonstrations of the three categories.
Then you will see a final, unlabeled "new" screenshot that you must classify.

You must assign the final screenshot to **exactly one** of these three categories:

1. New ultra-realistic photogrammetry 3D (the new photorealistic mesh that started rolling out ~2022–2025, looks like real oblique aerial photos stitched together on all surfaces, extremely detailed, no hard roof edges, real photo textures on building sides, realistic cars/trees/vegetation, looks almost like a drone photo)

2. Classic/old-style 3D (extruded buildings with only a single overhead satellite/photo texture on the roof, usually gray/plain/auto-colored sides, simple tree billboards for trees, blockier look, existed from ~2006 to ~2023 in most places)

3. Pure 2D satellite / flat mode (perfectly top-down view, no tilt possible or horizon visible, buildings appear completely flat with only roofs visible, no building sides or height)

For your **final answer**, respond with the number (1, 2, or 3) on the first line, followed by your detailed reasoning explaining why it matches that category, with specific visual evidence from the image (refer to particular buildings, cars, trees, roof edges, shadows, texture quality, perspective, etc.).

Be extremely strict: only call it #1 if it genuinely has full photogrammetry textures on roofs AND sides with no visible extrusion artifacts or flat gray sides. Do not say "kinda new" or "in between" — it must be clearly one of the three.`;

    transitionText = 'Now classify the following new Google Earth / Google Maps screenshot. Respond with the number (1, 2, or 3) on the first line, then explain your reasoning with specific visual evidence.';

    zeroShotText = 'Analyze this Google Earth / Google Maps screenshot and tell me which of the three view types it is. Respond with the number (1, 2, or 3) on the first line, then explain your reasoning with specific visual evidence.';
  } else {
    systemPrompt = `You are an expert at identifying Google Earth / Google Maps view modes.

You will sometimes be given **labeled reference examples** first. Each labeled example includes:
- The correct answer in the text, e.g. "Labeled example (answer = 1 – New ultra-realistic photogrammetry 3D)."
- An image that matches that label.

Treat these labeled examples as ground-truth demonstrations of the three categories.
Then you will see a final, unlabeled "new" screenshot that you must classify.

You must assign the final screenshot to **exactly one** of these three categories:

1. New ultra-realistic photogrammetry 3D (the new photorealistic mesh that started rolling out ~2022–2025, looks like real oblique aerial photos stitched together on all surfaces, extremely detailed, no hard roof edges, real photo textures on building sides, realistic cars/trees/vegetation, looks almost like a drone photo)

2. Classic/old-style 3D (extruded buildings with only a single overhead satellite/photo texture on the roof, usually gray/plain/auto-colored sides, simple tree billboards for trees, blockier look, existed from ~2006 to ~2023 in most places)

3. Pure 2D satellite / flat mode (perfectly top-down view, no tilt possible or horizon visible, buildings appear completely flat with only roofs visible, no building sides or height)

For your **final answer**, respond with only the number (1, 2, or 3).

Be extremely strict: only call it #1 if it genuinely has full photogrammetry textures on roofs AND sides with no visible extrusion artifacts or flat gray sides. Do not say "kinda new" or "in between" — it must be clearly one of the three. Never add extra text or commentary of any kind, only the number.`;

    transitionText = 'Now classify the following new Google Earth / Google Maps screenshot. Respond with only the number (1, 2, or 3).';

    zeroShotText = 'Analyze this Google Earth / Google Maps screenshot and tell me which of the three view types it is. Respond with only the number (1, 2, or 3).';
  }

  if (hasReferences) {
    for (const example of referenceExamples) {
      if (!example || !example.imageUrl || !example.label) continue;

      const label = String(example.label);

      const labelDescription =
        label === '1'
          ? 'New ultra-realistic photogrammetry 3D'
          : label === '2'
            ? 'Classic / old-style 3D'
            : label === '3'
              ? 'Pure 2D satellite / flat mode'
              : 'Unknown type';

      const noteSuffix = example.note ? ` ${example.note}` : '';

      userContent.push({
        type: 'text',
        text: `Labeled example (answer = ${label} – ${labelDescription}).${noteSuffix}`,
      });

      userContent.push({
        type: 'image',
        image: new URL(example.imageUrl),
      });
    }

    // Transition from labeled examples to the target image.
    userContent.push({
      type: 'text',
      text: transitionText,
    });
  } else {
    // Zero-shot fallback – keep the original simple instruction.
    userContent.push({
      type: 'text',
      text: zeroShotText,
    });
  }

  // Always append the target image last, after any labeled examples.
  userContent.push({
    type: 'image',
    image: new URL(imageUrl),
  });

  const result = await generateText({
    model: xai('grok-4-1-fast-reasoning'),
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userContent,
      },
    ],
  });

  return result;
}

if (process.argv[1] === __filename) {
  const [, , cliImageUrl, cliWithReasoning] = process.argv;
  const targetImageUrl = cliImageUrl ?? defaultImageUrl;
  const useReasoning = cliWithReasoning === 'true';
  const result = await analyzeGoogleEarthScreenshot(targetImageUrl, DEFAULT_REFERENCE_EXAMPLES, useReasoning);
  console.log(result.text);
}