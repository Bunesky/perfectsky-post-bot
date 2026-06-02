import { BskyAgent } from "@atproto/api";
import fs from "fs";

async function run() {
  try {
    console.log("🚀 SnakeSky updater START");

    const agent = new BskyAgent({
      service: "https://bsky.social"
    });

    await agent.login({
      identifier: process.env.SNAKESKY_USERNAME,
      password: process.env.SNAKESKY_PASSWORD
    });

    // 🔴 TU FEED GENERATOR
    const feedUri =
      "at://did:plc:jlyxq2frdkpnkwhzldvmjlrv/app.bsky.feed.generator/aaaim53uagg4q";

    const res = await agent.app.bsky.feed.getFeed({
      feed: feedUri,
      limit: 10
    });

    const items = res?.data?.feed ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      console.log("⚠️ Feed vacío");
      return;
    }

    const post = items[0]?.post;

    if (!post?.record?.text) {
      console.log("⚠️ Post sin texto");
      return;
    }

    const text = post.record.text;
    console.log("📝 POST:", text);

    const match = text.match(/LENGTH\s*[:=]?\s*(\d+)/i);

    if (!match) {
      console.log("⚠️ No LENGTH encontrado");
      return;
    }

    const length = parseInt(match[1], 10);

    const rkey = post.uri.split("/").pop();

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

    console.log("🟩 SUCCESS:", data);

  } catch (err) {
    console.error("❌ ERROR COMPLETO:");
    console.error(err);
    process.exit(1);
  }
}

run();
