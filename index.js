// index.js – PerfectSky Post Now bot

import { BskyAgent } from '@atproto/api';

async function main() {
  try {
    console.log('PerfectSky Post Now bot starting...');

    // 1) Fetch trending feed (API PUBLICA)
    const feedURL =
      'https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed?feed=' +
      encodeURIComponent('at://did:plc:jlyxq2frdkpnkwhzldvmjlrv/app.bsky.feed.generator/aaadxgnfze66k');

    const res = await fetch(feedURL);
    if (!res.ok) throw new Error('HTTP Error ' + res.status);

    const data = await res.json();
    if (!data.feed || data.feed.length === 0) {
      throw new Error('Feed returned empty');
    }

    // IMPORTANTE: getFeed devuelve item.post YA COMPLETO
    const posts = data.feed.map(item => item.post);

    // 2) Analyze posts
    const stats = analyze(posts);

    // 3) Build final text
    const text = generatePerfectSkyPostNow(stats);

    console.log('Post to publish:\n', text);

    // 4) Publish to Bluesky
    await postToBluesky(text);

    console.log('PerfectSky Post Now published successfully.');
  } catch (err) {
    console.error('Error in bot:', err);
    process.exit(1);
  }
}

function analyze(posts) {
  let totalChars = 0;
  let totalWords = 0;
  let totalHashtags = 0;

  let withImage = 0;
  let withVideo = 0;
  let noMedia = 0;
  let withLinks = 0;

  let replies = 0;
  let originals = 0;
  let quotes = 0;

  for (const post of posts) {
    const text = post.record.text || '';

    totalChars += text.length;

    const words = text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;

    const hashtags = text.match(/#[a-zA-Z][a-zA-Z0-9_]+/g) || [];
    totalHashtags += hashtags.length;

    const embedType = post.embed?.$type || '';

    if (embedType.includes('images')) withImage++;
    else if (embedType.includes('video')) withVideo++;
    else noMedia++;

    const hasLink =
      text.includes('http://') ||
      text.includes('https://') ||
      embedType.includes('external');

    if (hasLink) withLinks++;

    if (post.reply) {
      replies++;
    } else if (embedType.includes('record')) {
      quotes++;
    } else {
      originals++;
    }
  }

  const total = posts.length;

  return {
    total,
    avgChars: Math.round(totalChars / total),
    avgWords: Math.round(totalWords / total),
    avgHashtags: (totalHashtags / total).toFixed(2),
    imagePct: Math.round((withImage / total) * 100),
    videoPct: Math.round((withVideo / total) * 100),
    noMediaPct: Math.round((noMedia / total) * 100),
    linksPct: Math.round((withLinks / total) * 100),
    repliesPct: Math.round((replies / total) * 100),
    originalsPct: Math.round((originals / total) * 100),
    quotesPct: Math.round((quotes / total) * 100),
  };
}

function generatePerfectSkyPostNow(s) {
  const lines = [];

  // Nuevo encabezado
  lines.push('Current Trending Feed Pattern:');
  lines.push(`• ${s.avgChars} characters`);
  lines.push(`• ${s.avgWords} words`);

  // Mayorías (imagen, video, link, no media)
  if (s.imagePct >= 50) lines.push('• Majority with images');
  if (s.videoPct >= 50) lines.push('• Majority with videos');
  if (s.linksPct >= 50) lines.push('• Majority with links');
  if (s.noMediaPct >= 50) lines.push('• Majority without media');

  // Hashtags solo si hay MUCHÍSIMOS
  if (parseFloat(s.avgHashtags) >= 50) {
    lines.push('• Heavy hashtag usage');
  }

  // Tipo de post dominante
  const types = [
    { label: 'Reply', value: s.repliesPct },
    { label: 'Quote', value: s.quotesPct },
    { label: 'Original', value: s.originalsPct }
  ];

  types.sort((a, b) => b.value - a.value);
  const dominant = types[0];

  // Solo mostrar si NO es original
  if (dominant.label !== 'Original') {
    lines.push(`• ${dominant.label}`);
  }

  return lines.join('\n');
}


async function postToBluesky(text) {
  const handle = process.env.BSKY_HANDLE;
  const appPassword = process.env.BSKY_APP_PASSWORD;

  if (!handle || !appPassword) {
    throw new Error('Missing BSKY_HANDLE or BSKY_APP_PASSWORD environment variables.');
  }

  const agent = new BskyAgent({ service: 'https://bsky.social' });

  await agent.login({
    identifier: handle,
    password: appPassword,
  });

  await agent.post({
    text,
    createdAt: new Date().toISOString(),
  });
}

main();
