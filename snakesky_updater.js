import fs from "fs";
import { BskyAgent } from "@atproto/api";

async function run() {
  try {
    console.log("🚀 SnakeSky START");

    // Cliente Bluesky
    const agent = new BskyAgent({
      service: "https://bsky.social"
    });

    // Login con secretos del repo
    await agent.login({
      identifier: process.env.SNAKESKY_USERNAME,
      password: process.env.SNAKESKY_PASSWORD
    });

    // 🔴 TU FEED GENERATOR (SnakeSky)
    const feedUri =
      "at://did:plc:jlyxq2frdkpnkwhzldvmjlrv/app.bsky.feed.generator/aaaim53uagg4q";

    // Leer feed
    const res = await agent.app.bsky.feed.getFeed({
      feed: feedUri,
      limit: 10
    });

    const items = res?.data?.feed ?? [];

    if (!items.length) {
      console.log("⚠️ Feed vacío");
      return;
    }

    // Ordenar por fecha (último real primero)
    const sorted = items.sort(
      (a, b) =>
        new Date(b.post.indexedAt || 0) -
        new Date(a.post.indexedAt || 0)
    );

    const post = sorted[0]?.post;

    if (!post?.record?.text) {
      console.log("⚠️ Post sin texto");
      return;
    }

    const text = post.record.text;

    console.log("📝 POST:", text);

    // Extraer número (LENGTH=7, LENGTH:7, etc)
    const match = text.match(/(\d+)/);

    if (!match) {
      console.log("⚠️ No se encontró número en el post");
      return;
    }

    const length = parseInt(match[1], 10);

    const rkey = post.uri.split("/").pop();

    const postUrl =
      `https://bsky.app/profile/${post.author.handle}/post/${rkey}`;

    // JSON que usa el juego
    const data = {
      length,
      player: post.author.handle,
      post: postUrl,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      "snakesky.json",
      JSON.stringify(data, null, 2)
    );

    console.log("🟩 SUCCESS:", data);

  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

run();
