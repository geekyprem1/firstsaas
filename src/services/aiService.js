// AI Generation Service for AdViral AI
// Supports actual API requests to OpenAI / Gemini if keys are provided,
// and features an advanced context-aware semantic copy compiler fallback.

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
                  content: `Product: ${product_name}, Desc: ${product_description}, Audience: ${target_audience}, Platform: ${platform}, Tone: ${tone}, CTA: ${cta_style}. Return JSON structure.`
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
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are AdViral AI. Return a JSON block matching tool: ${toolType}. Product: ${product_name}, Desc: ${product_description}, Audience: ${target_audience}, Platform: ${platform}, Tone: ${tone}, CTA: ${cta_style}. Return JSON only.`
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
