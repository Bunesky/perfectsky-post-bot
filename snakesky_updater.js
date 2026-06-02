import { BskyAgent } from "@atproto/api";
import fs from "fs";

async function run() {
  try {
    console.log("🚀 Starting SnakeSky updater...");

    const agent = new BskyAgent({
      service: "https://bsky.social"
    });

    await agent.login({
      identifier: process.env.SNAKESKY_USERNAME,
      password: process.env.SNAKESKY_PASSWORD
    });

    console.log("✅ Logged in");

    const snakeskyFeed =
      "did:plc:jlyxq2frdkpnkwhzldvmjlrv/feed/aaaim53uagg4q";

    const res = await agent.app.bsky.feed.getFeed({
      feed: snakeskyFeed,
      limit: 10
    });

    const items = res?.data?.feed ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      console.log("⚠️ No posts found in feed");
      return;
    }

    const post = items[0]?.post;

    if (!post) {
      console.log("⚠️ No valid post object");
      return;
    }

    const text = post.record?.text ?? "";

    console.log("📝 Post text:", text);

    const match = text.match(
      /(?:Snake\s*length|LENGTH)\s*[:=]?\s*(\d+)/i
    );

    if (!match) {
      console.log("⚠️ No LENGTH found in post");
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

    console.log("🟩 SUCCESS:", data);

  } catch (err) {
    console.error("❌ WORKFLOW ERROR:");
    console.error(err);
    process.exit(1);
  }
}

run();
