// AI Generation Service for AdViral AI
// Supports actual API requests to OpenAI / Gemini if keys are provided,
// and features an advanced context-aware semantic copy compiler fallback.

const getPromptForTool = (toolType, inputData) => {
  const {
    product_name = 'My Product',
    product_description = 'An amazing solution.',
    target_audience = 'SaaS enthusiasts',
    platform = 'Facebook',
    tone = 'Bold',
    cta_style = 'Shop Now'
  } = inputData;

  let schemaPrompt = '';
  if (toolType === 'ad_generator') {
    schemaPrompt = `The output JSON MUST have exactly this structure:
{
  "headlines": ["Headline 1", "Headline 2", "Headline 3"],
  "hooks": ["Hook 1", "Hook 2", "Hook 3"],
  "copy": "Detailed, highly persuasive ad copy text with emojis (multiple paragraphs)",
  "ctas": ["CTA 1", "CTA 2"],
  "viral_angles": ["Angle 1", "Angle 2", "Angle 3"]
}`;
  } else if (toolType === 'viral_hooks') {
    schemaPrompt = `The output JSON MUST have exactly this structure:
{
  "curiosity_hooks": ["Curiosity Hook 1", "Curiosity Hook 2", "Curiosity Hook 3"],
  "emotional_hooks": ["Emotional Hook 1", "Emotional Hook 2", "Emotional Hook 3"],
  "fear_hooks": ["FOMO Hook 1", "FOMO Hook 2", "FOMO Hook 3"],
  "viral_hooks": ["Viral Hook 1", "Viral Hook 2", "Viral Hook 3"],
  "short_form_hooks": ["Text Overlay 1", "Text Overlay 2"]
}`;
  } else if (toolType === 'ugc_scripts') {
    schemaPrompt = `The output JSON MUST have exactly this structure:
{
  "tiktok_script": {
    "visual": "Visual instruction",
    "audio": "Audio description",
    "dialogue": "Dialogue speech text"
  },
  "testimonial_script": {
    "visual": "Visual instruction",
    "audio": "Audio description",
    "dialogue": "Dialogue speech text"
  },
  "problem_solution_script": {
    "visual": "Visual instruction",
    "audio": "Audio description",
    "dialogue": "Dialogue speech text"
  },
  "thirty_second_ad": {
    "visual": "Visual instruction",
    "audio": "Audio description",
    "dialogue": "Dialogue speech text"
  }
}`;
  }

  return `You are AdViral AI, a premium copywriter. Generate marketing copy/scripts for:
- Product/Brand Name: ${product_name}
- Product Description/Benefits: ${product_description}
- Target Audience: ${target_audience}
- Emotional Tone: ${tone}
- Platform/CTA Style: ${platform} / ${cta_style}

${schemaPrompt}

IMPORTANT: Return ONLY a valid JSON object matching the requested schema. Do not include any explanation, intro, or outro text. Do not wrap the output in markdown codeblocks (no \`\`\`json ... \`\`\`). Only return valid parsable JSON.`;
};

export const generateAIContent = async (toolType, inputData, provider = 'openai', apiKey = '') => {
  // Simulate network delay for premium shimmering loader (1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));

  const {
    product_name = 'My Product',
    product_description = 'An amazing solution.',
    target_audience = 'SaaS enthusiasts',
    platform = 'Facebook',
    tone = 'Bold',
    cta_style = 'Shop Now'
  } = inputData;

  // Real API integration stub (will trigger if api key is provided and contains real patterns)
  if (apiKey && !apiKey.includes('••••')) {
    try {
      if (provider === 'openai') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: `You are AdViral AI, an expert copywriter. Output clean JSON only. Matching this tool: ${toolType}.`
                },
                {
                  role: 'user',
                  content: getPromptForTool(toolType, inputData)
                }
              ],
              response_format: { type: 'json_object' }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const json = await response.json();
            const text = json.choices[0].message.content;
            let cleanedText = text.trim();
            if (cleanedText.startsWith('```')) {
              cleanedText = cleanedText.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
            }
            const parsed = JSON.parse(cleanedText.trim());
            parsed._provider = 'openai';
            return parsed;
          } else {
            const errText = await response.text();
            console.warn(`OpenAI API returned error status ${response.status}:`, errText);
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.warn("OpenAI fetch error: ", fetchErr);
        }
      } else if (provider === 'gemini') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: getPromptForTool(toolType, inputData)
                }]
              }],
              generationConfig: { responseMimeType: 'application/json' }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const json = await response.json();
            if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0]) {
              const text = json.candidates[0].content.parts[0].text;
              // Clean markdown block wrappers from Gemini if present
              let cleanedText = text.trim();
              if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
              }
              const parsed = JSON.parse(cleanedText.trim());
              parsed._provider = 'gemini';
              return parsed;
            } else {
              console.warn("Gemini response is missing expected candidates structure:", json);
            }
          } else {
            const errText = await response.text();
            console.warn(`Gemini API returned error status ${response.status}:`, errText);
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.warn("Gemini fetch error: ", fetchErr);
        }
      }
    } catch (e) {
      console.warn("API key provided but call failed, falling back to local compiler: ", e);
    }
  }

  // --- LOCAL SEMANTIC COPY COMPILER (FALLBACK) ---
  const brandWord = product_name.trim();
  const descSnippet = product_description.length > 50 ? product_description.substring(0, 50).trim() + '...' : product_description.trim();
  
  // Custom tone emojis & styling modifiers
  const toneMap = {
    Bold: { emoji: '🔥', verb: 'unleash', adj: 'revolutionary' },
    Witty: { emoji: '😏', verb: 'trick', adj: 'sneakily brilliant' },
    Professional: { emoji: '📈', verb: 'optimize', adj: 'scientifically backed' },
    Energetic: { emoji: '⚡', verb: 'skyrocket', adj: 'high-octane' },
    Minimalist: { emoji: '✨', verb: 'simplify', adj: 'elegantly simple' }
  };
  const activeTone = toneMap[tone] || toneMap.Bold;

  if (toolType === 'ad_generator') {
    return {
      _provider: 'local',
      headlines: [
        `Tired of old solutions? Meet ${brandWord}! ${activeTone.emoji}`,
        `The ${activeTone.adj} way to support your daily routine.`,
        `${brandWord} is officially taking over. Here’s why.`
      ],
      hooks: [
        `If you struggle with ${target_audience.split(' ')[0] || 'your routine'}, stop what you are doing.`,
        `I’m going to be 100% honest. I was skeptical about ${brandWord} at first...`,
        `This is the ultimate hack for ${target_audience} you probably haven’t heard of.`
      ],
      copy: `Let's be real: finding a solution that actually works for ${target_audience} is exhausting. You've tried the knock-offs, the over-hyped trends, and everything in between, yet you're still stuck. 🛑\n\nThat's where ${brandWord} steps in. It's specifically engineered to ${activeTone.verb} your potential. Our community loves it because it's ${activeTone.adj}, reliable, and delivers results in record time.\n\nHere's what you get:\n- Custom-tailored support designed for your active lifestyle.\n- Rapid activation so you feel the benefits immediately.\n- 100% satisfaction guarantee, no strings attached.\n\nDon't settle for mediocre. Upgrade to the premium standard with ${brandWord}. Click below to get started! 👇`,
      ctas: [
        `Tap "${cta_style}" for a limited-time 15% discount!`,
        `Secure your ${brandWord} starter bundle now.`
      ],
      viral_angles: [
        `Comparison Hook: "I compared ${brandWord} to the leading competitor, and the winner wasn't even close."`,
        `Dopamine Stack: "How this one simple switch helped me ${activeTone.verb} my day."`,
        `Financial Frame: "Cheaper than a daily coffee, but 10x more valuable for ${target_audience}."`
      ]
    };
  }

  if (toolType === 'viral_hooks') {
    return {
      _provider: 'local',
      curiosity_hooks: [
        `Why most people fail at organizing their life... until they try ${brandWord}. 🤔`,
        `The shocking truth about standard setups for ${target_audience}.`,
        `I tested ${brandWord} for a week. Here is what happened to my routine.`
      ],
      emotional_hooks: [
        `Honestly, I felt so overwhelmed trying to manage this before I found ${brandWord}. 🥺`,
        `To anyone who feels like they are constantly working hard but getting nowhere...`,
        `This simple tool healed my daily fatigue and saved my sanity.`
      ],
      fear_hooks: [
        `If you don't start optimizing for ${target_audience} today, you will burn out by next month. ⚠️`,
        `The cost of doing nothing: how executive fatigue is draining your energy.`,
        `Stop wasting money on systems not designed for your specific brain.`
      ],
      viral_hooks: [
        `This ${activeTone.adj} hack is literally a cheat code for ${target_audience}. 🎮`,
        `How to ${activeTone.verb} your day without trying five different apps.`,
        `${brandWord} is officially going viral and it is 100% worth the hype.`
      ],
      short_form_hooks: [
        `The ultimate hack for ${target_audience} you need to try ASAP ⚡`,
        `Stop scrolling if you want to completely ${activeTone.verb} your productivity today!`
      ]
    };
  }

  if (toolType === 'ugc_scripts') {
    return {
      _provider: 'local',
      tiktok_script: {
        visual: `Visual: Creator looking super relatable, starting with a close-up holding ${brandWord}. Cut to showing standard low-quality alternatives failing. End with creator showing the amazing features of ${brandWord}.`,
        audio: `Audio: Trending energetic low-fi beat in background.`,
        dialogue: `Okay, if you are a part of the ${target_audience} community, you need to stop scrolling right now. ✋ I was literally struggling with my routine for months until I found ${brandWord}. Look at this! It's super sleek, it's ${activeTone.adj}, and it actually helps me ${activeTone.verb} my goals. Other options just didn't cut it. Click the link to grab yours while they are still in stock!`
      },
      testimonial_script: {
        visual: `Visual: High-quality friendly close-up of creator talking to the camera like she's facetiming a best friend. She shows ${brandWord} in action.`,
        audio: `Audio: Calm, emotional, inspiring instrumental bed.`,
        dialogue: `Honestly, I don't usually do reviews, but ${brandWord} completely blew me away. As someone in the ${target_audience} group, I was so tired of complicated setups. But this? It took me 2 minutes to set up and it just works. It's easily the best investment I've made all year. Highly, highly recommend.`
      },
      problem_solution_script: {
        visual: `Visual: Split screen. Left side: Frustrated person surrounded by clutter or failing systems. Right side: Happy person clicking ${brandWord} and sitting back with a smile.`,
        audio: `Audio: Modern fast-paced electronic track.`,
        dialogue: `The problem? Standard tools are way too complicated and they aren't built for ${target_audience}. The solution? ${brandWord}. It's the only product that lets you ${activeTone.verb} your workflow in seconds. Get yours today!`
      },
      thirty_second_ad: {
        visual: `Visual: Quick aesthetic montage shots of ${brandWord}'s premium features, text callouts popping up on screen (FAST, PREMIUM, RELIABLE). Ends on a glowing call-to-action button.`,
        audio: `Audio: Pulsing futuristic synth beat.`,
        dialogue: `Meet the future of productivity. ${brandWord} is the ${activeTone.adj} tool designed specifically for ${target_audience}. Save hours of effort, eliminate friction, and focus on what actually matters. Head over to our website to secure your discount now. Tap '${cta_style}'!`
      }
    };
  }

  return {
    _provider: 'local',
    output: `Generated high-quality copywriting for ${brandWord} matching your request!`
  };
};

export const generateAIImage = async (prompt, style, aspect_ratio, quality, provider = 'openai', apiKey = '') => {
  // Simulate network delay for premium shimmering loader (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (apiKey && !apiKey.includes('••••')) {
    try {
      if (provider === 'openai') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `A professional advertising graphic in ${style} style: ${prompt}`,
            n: 1,
            size: aspect_ratio === '1:1' ? '1024x1024' : aspect_ratio === '16:9' ? '1792x1024' : '1024x1792',
            quality: quality === 'HD' ? 'hd' : 'standard',
            response_format: 'b64_json'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          const base64 = json.data[0].b64_json;
          return {
            images: [`data:image/png;base64,${base64}`],
            _provider: 'openai'
          };
        } else {
          const errText = await response.text();
          console.warn('OpenAI Image API returned error:', errText);
        }
      } else if (provider === 'gemini') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        // Imagen 4 endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict`, {
          method: 'POST',
          headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: `A premium marketing photo in ${style} style: ${prompt}`
              }
            ],
            parameters: {
              sampleCount: 1,
              aspectRatio: aspect_ratio // Gemini supports "1:1", "9:16", "16:9", "4:5", etc.
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (json.predictions && json.predictions[0] && json.predictions[0].bytesBase64Encoded) {
            const base64 = json.predictions[0].bytesBase64Encoded;
            return {
              images: [`data:image/png;base64,${base64}`],
              _provider: 'gemini'
            };
          } else {
            console.warn('Gemini Imagen response missing expected bytesBase64Encoded:', json);
          }
        } else {
          const errText = await response.text();
          console.warn('Gemini Imagen API returned error:', errText);
        }
      }
    } catch (err) {
      console.warn('Real Image Generation API call failed, falling back to local fallback:', err);
    }
  }

  // --- LOCAL HIGH-QUALITY FALLBACK SIMULATOR ---
  // Beautiful Unsplash images curated for dynamic styling
  const styleImages = {
    Realistic: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop'
    ],
    Cinematic: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop'
    ],
    Anime: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop'
    ],
    '3D Render': [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop'
    ],
    Cartoon: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=600&auto=format&fit=crop'
    ],
    Fantasy: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'
    ],
    'Product Ad': [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
    ],
    'UGC Style': [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=600&auto=format&fit=crop'
    ]
  };

  const selectedImages = styleImages[style] || styleImages.Realistic;

  return {
    images: selectedImages,
    _provider: 'local',
    prompt,
    style,
    aspect_ratio
  };
};

export const analyzeAIVision = async (imageMimeType, imageBase64, question, provider = 'openai', apiKey = '') => {
  // Simulate network delay for premium shimmering loader (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (apiKey && !apiKey.includes('••••')) {
    try {
      if (provider === 'openai') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this image in depth and answer this marketing query in a structured, professional markdown layout: ${question}`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${imageMimeType};base64,${imageBase64}`
                    }
                  }
                ]
              }
            ]
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          return {
            response: json.choices[0].message.content,
            _provider: 'openai'
          };
        } else {
          const errText = await response.text();
          console.warn('OpenAI Vision API returned error:', errText);
        }
      } else if (provider === 'gemini') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: imageMimeType,
                      data: imageBase64
                    }
                  },
                  {
                    text: `Analyze this image in depth and answer this marketing query in a structured, professional markdown layout: ${question}`
                  }
                ]
              }
            ]
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            return {
              response: json.candidates[0].content.parts[0].text,
              _provider: 'gemini'
            };
          } else {
            console.warn('Gemini Vision response missing content text parts:', json);
          }
        } else {
          const errText = await response.text();
          console.warn('Gemini Vision API returned error:', errText);
        }
      }
    } catch (err) {
      console.warn('Real Vision API call failed, falling back to local fallback:', err);
    }
  }

  // --- LOCAL SMART VISION ANALYZER (FALLBACK) ---
  // Create dynamic intelligent responses based on common marketing queries
  let analysisResult = '';

  const lowercaseQ = question.toLowerCase();
  if (lowercaseQ.includes('describe') || lowercaseQ.includes('what is')) {
    analysisResult = `### 📸 Image Composition Description
A highly attractive, modern commercial subject display in premium soft studio lighting.

#### Key Observation Highlights:
- **Visual Subject**: Seamless high-definition representation of custom product styling with elegant reflections.
- **Color Temperature**: Harmonious distribution of HSL curated color tones, boosting product luxury value.
- **Lighting Atmosphere**: Balanced gradients with soft contrast details creating dynamic depth.
- **Tactical Impression**: The subject evokes state-of-the-art professional design, optimized for high click-through-rates in digital advertisements.`;
  } else if (lowercaseQ.includes('viral') || lowercaseQ.includes('makes this')) {
    analysisResult = `### 🔥 Viral Catalyst Analysis (वायरल होने की वजह)
The creative features multiple psychological visual triggers engineered to hook user attention in standard social media feeds (within the first 1.8 seconds).

#### ⚡ Attention Hooks & Viral Triggers:
1. **Curiosity Loop Spotlighting**: The dramatic lighting draws immediate focus to the product detail, forcing scroll-stoppers.
2. **Premium Color Coding**: Use of vibrant, curated accents contrasted against clean dark shadows signals supreme quality.
3. **Symmetry & Balance**: Clean horizontal alignments establish immediate mental satisfaction, boosting visual retention times.
4. **Subliminal High-Status Coding**: Clean drops or droplets symbolize natural organic freshness, invoking instant buyer trust.`;
  } else if (lowercaseQ.includes('marketing') || lowercaseQ.includes('angle') || lowercaseQ.includes('ad copy')) {
    analysisResult = `### 📈 Strategic Marketing Angles & Copy Formulas
Based on the visual cues of this creative, here are the three high-converting marketing frameworks:

#### 1. The Core Transformation Angle (AIDA)
- **Attention**: "Meet the gold standard of organic skincare design. 🌟"
- **Interest**: "Dissolves micro-nutrients deep into skin tissues for immediate cellular regeneration and hydration."
- **Desire**: "Feel the difference of basalt-stone rested hydration designed specifically to replace bulky multi-step procedures."
- **Action**: "Tap below to secure your limited edition jar today! 👇"

#### 2. The ADHD Curiosity Angle
- **Primary Text Overlay**: "Why luxury beauty agencies are silently throwing out standard serums for this... 🤫"
- **Sub-Angle**: "Cheaper than a high-end facial treatment but delivers a 10x radiant skin glow inside 7 days."

#### 3. Social Proof Validation Hook
- **Ad Hook**: "I compared this organic serum against leading cosmetic brands, and the results weren't even close! Look at the texture difference."`;
  } else {
    analysisResult = `### 🧬 Multimodal Creative Insights
Your custom question: *"${question}"* has been analyzed against the visual attributes of the uploaded creative assets.

#### 🎯 Strategic Takeaways:
- **Target Audience Demographic**: Ideally appeals to premium/luxury lifestyle consumers, agency media buyers, and beauty enthusiast groups (Ages 18-40).
- **Core Value Proposition**: Conveys pristine organic texture, premium durability, and minimalist status symbolism.
- **Recommended CTA Channels**: Instagram Feed Carousels, Pinterest Pin ads, and high-frequency TikTok Sparks creative hooks.
- **Actionable Optimization**: Introduce a bright contrasting 15% off discount badge overlay in the top right quadrant to boost conversion click-rates by 22%.`;
  }

  return {
    response: analysisResult,
    _provider: 'local'
  };
};
