import pkg from '@atproto/api';
const { BskyAgent } = pkg;

const username = process.env.BLUESKY_USERNAME;
const password = process.env.BLUESKY_APP_PASSWORD;

const agent = new BskyAgent({ service: 'https://bsky.social' });

async function runBot() {
  await agent.login({ identifier: username, password });

  const text = "PerfectSky Post — publicación automática ✨";

  await agent.post({
    text: text
  });

  console.log("Post publicado correctamente.");
}

runBot();
