import { BskyAgent } from "@atproto/api";
import fs from "fs";

async function run() {
  try {
    const agent = new BskyAgent({
      service: "https://bsky.social"
    });

    await agent.login({
      identifier: process.env.SNAKESKY_USERNAME,
      password: process.env.SNAKESKY_PASSWORD
    });

    const snakeskyFeed =
      "did:plc:jlyxq2frdkpnkwhzldvmjlrv/feed/aaaim53uagg4q";

    const res = await agent.app.bsky.feed.getFeed({
      feed: snakeskyFeed,
      limit: 10
    });

    const items = res.data.feed || [];

    if (!items.length) {
      console.log("No hay posts en el feed #snakesky.");
      return;
    }

    // ordenar por fecha por seguridad
    const sorted = items.sort((a, b) => {
      return new Date(b.post.indexedAt || 0) - new Date(a.post.indexedAt || 0);
    });

    const post = sorted[0].post;
    const text = post.record?.text || "";

    // 🔥 FIX IMPORTANTE: acepta : o =
    const match = text.match(
      /(?:Snake\s*length|LENGTH)\s*[:=]?\s*(\d+)/i
    );

    if (!match) {
      console.log("El post no contiene LENGTH válido:", text);
      return;
    }

    const length = parseInt(match[1], 10);

    const uri = post.uri;
    const rkey = uri.split("/").pop();

    const postUrl =
      `https://bsky.app/profile/${post.author.handle}/post/${rkey}`;

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

    console.log("🟩 snakesky.json actualizado:", data);

  } catch (err) {
    console.error("❌ ERROR EN WORKFLOW:", err);
    process.exit(1);
  }
}

run();
