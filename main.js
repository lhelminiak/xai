import 'dotenv/config'
import { xai } from '@ai-sdk/xai'
import { generateText } from 'ai'
import { fileURLToPath } from 'url'

const defaultImageUrl =
  'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/815796/cleaned_3334265.jpg'
const __filename = fileURLToPath(import.meta.url)

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
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928739/cleaned_3294180.jpg',
    note: 'This image is unmistakably the new ultra-realistic photogrammetry 3D because every building surface—roofs and all vertical façades alike—displays continuous, high-resolution oblique aerial photo textures with real-world details such as individual windows, doors, brick patterns, air-conditioning units, signage, roof vents, and even peeling paint or discoloration, with zero visible extrusion seams or flat gray procedural sides that characterize the old style.\n\nCars are rendered as genuine photographic captures rather than simple models: they show accurate colors, realistic reflections on windshields, proper shadows underneath the vehicles, visible wheels/tires, and varying body styles (e.g., the row of parked cars along the bottom street and the red truck near the center-left all look like real oblique photos, not low-poly blobs).\n\nTrees and vegetation have full volumetric photogrammetry with natural branching, individual leaf clusters, and consistent lighting/texture from all angles (notice the large trees in the residential area top-left and center), while roof edges blend seamlessly into walls without the telltale hard 90° cut-off line of classic extruded 3D, and the overall scene has perfectly uniform sun angle and shadow direction across every surface, proving it is stitched from the same oblique photo set rather than a vertical satellite roof texture draped over a block model.'
  },
  {
    label: '1',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928733/cleaned_3294240.jpg',
    note: 'This image is the new ultra-realistic photogrammetry 3D because every building surface shows seamless, continuous oblique aerial photo textures that wrap perfectly from roof to walls with real-world facade details—visible windows, brick patterns, doors, loading docks, signage, HVAC units, and even individual panel seams on the large white warehouse (left and bottom)—with zero hard extrusion seams or procedural flat sides.\n\nCars are rendered as genuine photographic captures with accurate colors, visible windshields, wheels, reflections, realistic under-vehicle shadows, and varied body styles (especially evident in the parking lot with the yellow taxi, red car, blue SUVs, and white vans), rather than low-poly blobs or billboards.\n\nTrees exhibit full volumetric photogrammetry with natural branching, dense leaf clusters, and consistent oblique lighting/shadows matching the buildings (see the large green trees scattered throughout), while the entire scene has perfectly uniform sun angle and shadow direction across all surfaces, confirming it is stitched from the same high-resolution oblique photo set rather than a single draped vertical satellite texture over extruded blocks.'
  },
  {
    label: '1',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/927972/cleaned_3296049.jpg',
    note: `This image is the new ultra-realistic photogrammetry 3D because every visible building façade displays continuous oblique aerial photo textures that seamlessly wrap from roof to walls, showing real-world details such as individual windows, loading docks, brick patterns, signage (e.g., the "Solid Rock Community Church" building top-right and the strip-mall stores lower-center with visible storefronts, awnings, and doors), HVAC units, roof vents, and even minor weathering/discoloration, with absolutely no hard extrusion seams or procedural flat/gray sides.
    
Cars throughout the parking lots are rendered as genuine photographic captures with accurate colors, visible windshields/reflections, wheels, proper under-vehicle shadows, and realistic oblique distortion (particularly clear in the clustered vehicles near the bottom-center stores and scattered trucks/semis), rather than simplified low-poly models or billboards.
    
Trees and vegetation show full volumetric photogrammetry with natural branching, dense individual leaf clusters, and consistent oblique lighting/shadows that perfectly match the buildings and ground (evident in the clusters around the church and along the roads), while the entire scene—including the large cleared dirt lot in the center—has uniform sun angle, shadow direction, and high-resolution photo texture continuity across all surfaces, confirming it is built from a stitched oblique photogrammetry mesh rather than a single draped vertical satellite image over extruded blocks.`
  },
  {
    label: '1',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/822178/cleaned_3327489.jpg',
    note: `This image is the new ultra-realistic photogrammetry 3D because every visible surface—including the dozens of parked RVs/trailers scattered across the large gravel lot—displays seamless, continuous oblique aerial photo textures with real-world details such as individual windows, doors, awnings, vents, stripes, decals, and even dirt/weathering patterns on their sides and roofs, with zero hard extrusion seams or procedural flat coloring.
    
Cars and trucks (especially the row of parked vehicles along the left edge and scattered throughout the lot) are rendered as genuine photographic captures showing accurate colors, windshields, wheels, realistic reflections, proper under-vehicle shadows, and varied models/orientations, rather than low-poly blobs or billboards.
    
Trees exhibit full volumetric photogrammetry with dense, natural leaf clusters, individual branching, and consistent oblique lighting/shadows that perfectly match the vehicles and ground (clearly visible in the clusters around the lot perimeter and near the roads), while the entire scene has uniform sun angle, high-resolution photo continuity, and subtle terrain elevation modeling, confirming it is stitched from the same oblique photogrammetry set rather than a draped vertical satellite texture over simple extruded models.`
  },
  {
    label: '1',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928080/cleaned_3295967.jpg',
    note: `This image is the new ultra-realistic photogrammetry 3D because the massive warehouse roof shows continuous oblique photographic texture with real-world details like individual skylights, vents, dirt patches of dirt/gravel, discoloration, and even small debris, while the long visible blue façade has seamless matching texture including garage doors, panel lines, and subtle weathering that wraps perfectly without any hard 90° extrusion seams or procedural flat coloring.
    
Vehicles, including the red fire truck, blue pickup, and scattered cars/trucks in the parking lots, are rendered as genuine high-resolution oblique photos with accurate colors, visible windows/windshields, wheels, realistic reflections, and proper under-vehicle shadows that align with the oblique camera angle, rather than appearing as simplified models or billboards.
    
Trees display full volumetric photogrammetry with dense, natural leaf clusters, individual branching, and consistent oblique lighting/shadows that perfectly match the buildings and pavement (especially visible in the clusters along the roads and parking areas), while the entire scene maintains uniform sun angle, high-fidelity photo continuity, and subtle ground details like tire marks and grass patches, confirming it is built from a stitched oblique photogrammetry mesh rather than the old draped vertical satellite texture over extruded blocks.`
  },
  {
    label: '1',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928720/cleaned_3294339.jpg',
    note: `This is Category 1 (New ultra-realistic photogrammetry 3D) despite the large, somewhat blocky white warehouse. The key is in the details: notice the ground surfaces (pavement, grass) have high-fidelity photo textures that blend naturally, not just flat colors. The cars in the parking lot, while small, show realistic soft shadows and varied shapes consistent with aerial photography, not rigid low-poly models. The roof edges, while straight, lack the harsh artificial "razor-sharp" cut of the old extrusion method. The overall scene lighting is soft and consistent, typical of the modern mesh, rather than the harsh contrast of the old style.`
  },
  {
    label: '1',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928083/cleaned_3295907.jpg',
    note: `This is Category 1 (New ultra-realistic photogrammetry 3D), even though the white warehouse walls appear relatively uniform. The critical evidence: the parking lot pavement shows natural photographic texture with realistic weathering and tire marks, not flat gray. Cars have soft, natural shadows that blend into the ground, not harsh black cutouts. The overall scene has the subtle depth and atmospheric perspective of aerial photography. While building sides may appear plain due to the actual warehouse having white metal siding, they still show subtle lighting gradients from the photogrammetry mesh, not the perfectly flat procedural colors of old 3D.`
  },
//   {
//     label: '1',
//     imageUrl:
//       'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/952020/cleaned_3339469.jpg',
//     note: 'Detailed aerial photo integration; natural blending of textures without blockiness; perspective shows true height and depth.'
//   },
//   {
//     label: '1',
//     imageUrl:
//       'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928035/cleaned_3311295.jpg',
//     note: 'New photogrammetry with detailed textures everywhere; realistic perspective and no artifacts.'
//   },
  {
    label: '1',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/928162/cleaned_3295791.jpg',
    note: `This image is the new ultra-realistic photogrammetry 3D because the massive central white-roofed warehouse displays seamless oblique aerial photo textures across every surface—roofs show individual seams, patches, vents, and staining while the visible vertical sides and loading dock areas have continuous real-world details including doors, structural supports, and even minor discoloration—with no hard extrusion seams or procedural flat coloring anywhere.
    
Trucks and trailers (especially the long rows of semis docked at the loading bays on both sides) are rendered as genuine high-resolution photographic captures with accurate branding/logos, varied colors, realistic reflections on metal surfaces, proper wheel/tire details, and authentic under-vehicle shadows that follow the oblique angle perfectly, rather than appearing as low-poly models or billboards.
    
The entire scene exhibits perfectly uniform oblique lighting and shadow direction across all elements (note how shadows from trucks, light poles, and small structures align consistently with the sun angle visible on the roofs), while smaller details like scattered debris, tire marks on pavement, and distant industrial tanks all retain photographic fidelity and depth, confirming construction from a single stitched photogrammetry mesh rather than the old method of draping one vertical satellite image over basic extruded shapes.`
  },
  {
    label: '2',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/822910/cleaned_3296360.jpg',
    note: `This image is classic/old-style 3D because the massive central warehouse has a sharp, high-resolution overhead satellite texture on the roof (mostly white) roof showing individual vents, panels, and skylights, but the vertical sides are completely plain procedural beige/brown with zero real facade details—no windows, doors, signage, brick patterns, or texture continuity—creating a blatant hard 90° seam where the roof texture abruptly ends and the flat extruded wall color begins.
    
Cars are rendered as simple low-poly models or billboards rather than photographic captures: the rows of vehicles in the parking lot on the right appear as solid-colored blobs (red, white, black, etc.) with overly harsh uniform shadows, no visible windshields/reflections, no under-car shadows, and obvious foreshortening distortion without realistic oblique photo detail.
    
Roof-to-wall transitions everywhere show the telltale extrusion artifact of the old system (sharp edges, mismatched lighting between high-sun-angle roof texture and artificially shaded plain sides), while trees/vegetation are either absent or reduced to basic billboard sprites, and the overall scene lacks the seamless, uniform oblique photographic lighting that characterizes the new photogrammetry mesh.`
  },
  {
    label: '2',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/821844/cleaned_3316221.jpg',
    note: `This image is classic/old-style 3D because the large dark-roofed warehouse (top-left) and the white-roofed buildings (lower half) have high-resolution overhead satellite textures on their roofs showing clear details like vents and seams, but the vertical sides are rendered as completely plain, untextured procedural gray/beige with no windows, doors, signage, or facade details whatsoever, creating obvious hard 90° extrusion seams where the roof texture cuts off abruptly.
    
Cars are simple low-detail models or billboards with solid colors, harsh uniform shadows, heavy foreshortening distortion, and no realistic photographic elements like visible windshields, wheels, reflections, or proper under-vehicle shadows (evident in the white vehicles scattered in parking lots and on roads).
    
Trees appear as basic billboard sprites or low-poly blobs that face the camera but lack volumetric detail or individual branching, while the overall lighting is inconsistent—roofs show high-sun-angle satellite capture with minimal shadows, but sides are artificially darkened without matching the roof's light direction—confirming the old draped-texture extrusion method rather than seamless oblique photogrammetry.`
  },
  {
    label: '2',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/822139/cleaned_3313871.jpg',
    note: `This image is classic/old-style 3D because the large circular grain silos/storage tanks have highly detailed overhead satellite textures on their conical roofs (clearly showing metal panel seams, central vents, and radial supports), but the vertical cylindrical sides are rendered as completely plain procedural gray/blue with only basic gradient shading and zero real-world facade details like rivets, weathering, doors, or texture continuity, resulting in sharp, unnatural 90° extrusion seams where the roof texture abruptly ends.
    
The center-pivot irrigation system (the long arm radiating from the central silo) is a simplistic low-poly 3D model with blocky segments and uniform coloring rather than photographic detail, while any vehicles or equipment appear as basic colored blobs with harsh, non-realistic shadows and no visible wheels, windows, or oblique photo capture.
    
Lighting is blatantly inconsistent in the classic extrusion style: the roof textures show a high-sun-angle satellite pass with bright, even illumination and minimal shadows, while the sides are artificially darkened with a different apparent light direction and no matching environmental reflections or ambient occlusion, confirming the old method of draping a single vertical satellite image over basic extruded shapes rather than a fully photogrammetric oblique mesh.`
  },
  {
    label: '2',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/822041/cleaned_3314665.jpg',
    note: `This image is classic/old-style 3D because the large dark-roofed barns and outbuildings (especially the cluster in the lower center with the blue circular silo) have sharp, high-resolution overhead satellite textures on the roofs showing clear panel lines, vents, and weathering, but the vertical sides are rendered as completely plain procedural black/gray with no windows, doors, siding details, or texture continuity, producing unmistakable hard 90° extrusion seams where the roof texture stops dead and the flat wall color begins.
    
Trees and vegetation are rendered as simple billboard sprites or low-poly blobs that always face the camera but lack any volumetric structure, individual branches, or realistic leaf clusters (most visible along the railroad/track on the left and scattered throughout the fields), while any vehicles or equipment appear as basic solid-colored models with harsh, uniform shadows and no photographic detail.
    
Lighting is classically inconsistent: roofs display bright, high-sun-angle satellite capture with almost no shadows on-roof shadows, while the extruded sides are artificially shaded with a mismatched lower sun direction and no ambient occlusion or environmental reflections, confirming the old draped-texture-over-extrusion technique rather than the seamless oblique photogrammetry of the new system.`
  },
  {
    label: '2',
    imageUrl:
      'https://industrialiq.s3.us-east-1.amazonaws.com/property_satellite_images/815965/cleaned_3331701.jpg',
    note: `This image is classic/old-style 3D because the red-roofed building (top-center and the scattered trailers/RVs show high-resolution overhead satellite textures on their roofs with visible panel lines, vents, and weathering details, but the visible vertical sides are rendered as completely plain procedural colors (solid red, white, or gray) with zero real facade texture, windows, doors, or signage, creating sharp 90° extrusion seams where the roof texture abruptly ends.
    
Parked vehicles, especially the long row of semi-trucks and RVs along the right side and near the top, appear as simplistic low-poly 3D models or billboards with blocky shapes, uniform coloring, harsh non-realistic shadows, and heavy perspective foreshortening without any photographic detail like visible windshields, wheels, reflections, or under-vehicle shadows.
    
The heart-shaped pond itself uses a basic flat water texture with no realistic wave patterns or reflections, while surrounding terrain and smaller structures exhibit the classic mismatched lighting—bright high-sun-angle roof illumination versus artificially shaded plain sides—confirming the old draped satellite texture over basic extruded models rather than the seamless oblique photogrammetry of the new system.`
  }
]

/**
 * Analyze a Google Earth / Google Maps screenshot, with optional few-shot
 * classification using labeled reference images.
 *
 * @param {string} imageUrl - URL of the target screenshot to classify.
 * @param {ReferenceExample[]} [referenceExamples=DEFAULT_REFERENCE_EXAMPLES] - Optional
 *   labeled reference images that will be shown to the model before the target image.
 * @param {boolean} [withReasoning=false] - If true, include detailed reasoning in the response.
 */
export async function analyzeGoogleEarthScreenshot (
  imageUrl,
  referenceExamples = DEFAULT_REFERENCE_EXAMPLES,
  withReasoning = false
) {
  const hasReferences =
    Array.isArray(referenceExamples) && referenceExamples.length > 0

  let systemPrompt, exampleUserText, exampleAssistantFormat, finalUserText

  if (withReasoning) {
    systemPrompt = `You are an expert at identifying Google Earth / Google Maps view modes.
  
  You must assign screenshots to **exactly one** of these three categories:
  
  1. New ultra-realistic photogrammetry 3D (the new photorealistic mesh that started rolling out ~2022–2025, looks like real oblique aerial photos stitched together on all surfaces, extremely detailed, no hard roof edges, real photo textures on building sides, realistic cars/trees/vegetation, looks almost like a drone photo)
  
  2. Classic/old-style 3D (extruded buildings with only a single overhead satellite/photo texture on the roof, usually gray/plain/auto-colored sides, simple tree billboards for trees, blockier look, existed from ~2006 to ~2023 in most places)
  
  3. Pure 2D satellite / flat mode (perfectly top-down view, no tilt possible or horizon visible, buildings appear completely flat with only roofs visible, no building sides or height)
  
  Evaluate the **overall scene**, focusing on the majority of visible elements (buildings, vegetation, ground, cars). Do not classify based on a single building or small area.

  For your **final answer**, respond with the number (1, 2, or 3) on the first line, followed by your detailed reasoning explaining why it matches that category, with specific visual evidence from the image (refer to particular buildings, cars, trees, roof edges, shadows, texture quality, perspective, etc.).
  
  When deciding between 1 and 2, use these strict rules and bias toward 1:

  - **CRITICAL:** Large industrial buildings (warehouses) in Category 1 (New 3D) can still look blocky because they are simple box shapes. **Do not classify as 2 just because a building is a box.**
  - Look closely at the **sides of the buildings**. In Category 1, even simple walls have subtle photo-texture variations, weathering, or soft lighting gradients from the photogrammetry mesh. In Category 2, walls are perfectly uniform single colors (computer-generated gray/white) with unnatural hard edges.
  - Look at **trees and cars**. In Category 1, trees have volume and irregular shapes (3D blobs). In Category 2, they are flat 2D cutouts (billboards) or perfect spheres.
  - **If the scene looks like a real photo taken from a drone or plane, it is 1.**
  - **If the scene looks like a video game from 2010 (sharp geometry, low-res textures), it is 2.**
  
  Do not say "kinda new" or "in between" — you must pick exactly one of the three categories.`

    exampleUserText = 'Classify this Google Earth / Google Maps screenshot:'

    exampleAssistantFormat = (label, labelDescription, note) => {
      const detailedReasoning = `This matches category ${label} (${labelDescription}) because: ${
        note || 'of the overall photorealistic quality and detailed textures.'
      }`
      return `${label}\n${detailedReasoning}`
    }

    finalUserText =
      'Now classify this new Google Earth / Google Maps screenshot:'
  } else {
    systemPrompt = `You are an expert at identifying Google Earth / Google Maps view modes.
  
  You must assign screenshots to **exactly one** of these three categories:
  
  1. New ultra-realistic photogrammetry 3D (the new photorealistic mesh that started rolling out ~2022–2025, looks like real oblique aerial photos stitched together on all surfaces, extremely detailed, no hard roof edges, real photo textures on building sides, realistic cars/trees/vegetation, looks almost like a drone photo)
  
  2. Classic/old-style 3D (extruded buildings with only a single overhead satellite/photo texture on the roof, usually gray/plain/auto-colored sides, simple tree billboards for trees, blockier look, existed from ~2006 to ~2023 in most places)
  
  3. Pure 2D satellite / flat mode (perfectly top-down view, no tilt possible or horizon visible, buildings appear completely flat with only roofs visible, no building sides or height)
  
  Evaluate the **overall scene**, focusing on the majority of visible elements (buildings, vegetation, ground, cars). Do not classify based on a single building or small area.

  For your **final answer**, respond with only the number (1, 2, or 3).
  
  When deciding between 1 and 2, use these strict rules and bias toward 1:

  - **CRITICAL:** Large industrial buildings (warehouses) in Category 1 (New 3D) can still look blocky because they are simple box shapes. **Do not classify as 2 just because a building is a box.**
  - Look closely at the **sides of the buildings**. In Category 1, even simple walls have subtle photo-texture variations, weathering, or soft lighting gradients from the photogrammetry mesh. In Category 2, walls are perfectly uniform single colors (computer-generated gray/white) with unnatural hard edges.
  - Look at **trees and cars**. In Category 1, trees have volume and irregular shapes (3D blobs). In Category 2, they are flat 2D cutouts (billboards) or perfect spheres.
  - **If the scene looks like a real photo taken from a drone or plane, it is 1.**
  - **If the scene looks like a video game from 2010 (sharp geometry, low-res textures), it is 2.**
  
  Never add extra text or commentary of any kind, only the number. You must still choose exactly one of the three categories (no "in between").`

    exampleUserText = 'Classify this Google Earth / Google Maps screenshot:'

    exampleAssistantFormat = label => label

    finalUserText =
      'Now classify this new Google Earth / Google Maps screenshot:'
  }

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ]

  if (hasReferences) {
    for (const example of referenceExamples) {
      if (!example || !example.imageUrl || !example.label) continue

      const label = String(example.label)

      const labelDescription =
        label === '1'
          ? 'New ultra-realistic photogrammetry 3D'
          : label === '2'
          ? 'Classic / old-style 3D'
          : label === '3'
          ? 'Pure 2D satellite / flat mode'
          : 'Unknown type'

      const userContent = [
        {
          type: 'text',
          text: exampleUserText
        },
        {
          type: 'image',
          image: new URL(example.imageUrl)
        }
      ]

      messages.push({
        role: 'user',
        content: userContent
      })

      const assistantContent = withReasoning
        ? exampleAssistantFormat(label, labelDescription, example.note)
        : exampleAssistantFormat(label)

      messages.push({
        role: 'assistant',
        content: assistantContent
      })
    }
  }

  const finalUserContent = [
    {
      type: 'text',
      text: hasReferences
        ? finalUserText
        : 'Analyze this Google Earth / Google Maps screenshot and tell me which of the three view types it is.'
    },
    {
      type: 'image',
      image: new URL(imageUrl)
    }
  ]

  messages.push({
    role: 'user',
    content: finalUserContent
  })

//   console.log(
//     'Sending messages to model:',
//     JSON.stringify(
//       messages,
//       (key, value) => (value instanceof URL ? value.toString() : value),
//       2
//     )
//   )

  const result = await generateText({
    model: xai('grok-4-1-fast-reasoning'),
    messages,
    temperature: 0,
  })

  return result
}

if (process.argv[1] === __filename) {
  const [, , cliImageUrl, cliWithReasoning] = process.argv
  const targetImageUrl = cliImageUrl ?? defaultImageUrl
//   const useReasoning = cliWithReasoning === 'true'
 const useReasoning = true;
 
  const result = await analyzeGoogleEarthScreenshot(
    targetImageUrl,
    DEFAULT_REFERENCE_EXAMPLES,
    useReasoning
  )
  console.log(result.text)
}
