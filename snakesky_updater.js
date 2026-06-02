import { BskyAgent } from "@atproto/api";
import fs from "fs";

async function run() {
  try {
    const agent = new BskyAgent({
      service: "https://bsky.social"
    });

    await agent.login({
      identifier: process.env.BSKY_USERNAME,
      password: process.env.BSKY_PASSWORD
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

    const post = items[0].post;
    const text = post.record?.text || "";

    const match = text.match(
      /(?:Snake\s*length|LENGTH)\s*:\s*(\d+)/i
    );

    if (!match) {
      console.log("El post no contiene LENGTH.");
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
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

run();
