// index.js – PerfectSky Post Now bot

import { BskyAgent } from '@atproto/api';

const API_URL =
  'https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed?feed=' +
  encodeURIComponent('at://did:plc:jlyxq2frdkpnkwhzldvmjlrv/app.bsky.feed.generator/aaadxgnfze66k');

async function main() {
  try {
    console.log('PerfectSky Post Now bot starting...');

    // 1) Fetch trending feed
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('HTTP Error ' + response.status);

    const data = await response.json();
    if (!data.feed || data.feed.length === 0) {
      throw new Error('Feed returned empty');
    }

    const posts = data.feed;

    // 2) Analyze posts (same logic as your web app)
    const stats = analyze(posts);

    // 3) Build final text for Bluesky
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

  for (const item of posts) {
    const post = item.post;
    const text = post.record.text || '';

    totalChars += text.length;

    const words = text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;

    const hashtags = text.match(/#\w+/g) || [];
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

    if (item.reply) {
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
    avgHashtags: (totalHashtags / total).toFixed(1),
    imagePct: Math.round((withImage / total) * 100),
    videoPct: Math.round((withVideo / total) * 100),
    noMediaPct: Math.round((noMedia / total) * 100),
    linksPct: Math.round((withLinks / total) * 100),
    repliesPct: Math.round((replies / total) * 100),
    originalsPct: Math.round((originals / total) * 100),
    quotesPct: Math.round((quotes / total) * 100),
  };
}

// Build the final text exactly as we defined
function generatePerfectSkyPostNow(s) {
  const lines = [];

  // Title
  lines.push('PerfectSky Post Now');

  // Always show characters + words
  lines.push(`• ${s.avgChars} characters`);
  lines.push(`• ${s.avgWords} words`);

  // Media majority (>= 50%)
  if (s.imagePct >= 50) {
    lines.push('• Image: yes');
  }
  if (s.videoPct >= 50) {
    lines.push('• Video: yes');
  }
  if (s.noMediaPct >= 50) {
    lines.push('• No media');
  }
  if (s.linksPct >= 50) {
    lines.push('• Links: yes');
  }
  if (parseFloat(s.avgHashtags) >= 0.5) {
    lines.push('• Hashtags: yes');
  }

  // Dominant post type: replies / originals / quotes
  const types = [
    { label: 'Reply post', value: s.repliesPct },
    { label: 'Original post', value: s.originalsPct },
    { label: 'Quote post', value: s.quotesPct },
  ];

  types.sort((a, b) => b.value - a.value);
  const dominant = types[0];

  lines.push(`• ${dominant.label}`);

  return lines.join('\n');
}

async function postToBluesky(text) {
  const handle = process.env.BSKY_HANDLE;
  const appPassword = process.env.BSKY_APP_PASSWORD;

  if (!handle || !appPassword) {
    throw new Error('Missing BSKY_HANDLE or BSKY_APP_PASSWORD environment variables.');
  }

  const agent = new BskyAgent({ service: 'https
