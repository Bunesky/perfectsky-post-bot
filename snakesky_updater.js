import fs from "fs";

async function run() {
  try {
    console.log("🚀 SnakeSky updater (simple mode)");

    const feedId = "did:plc:jlyxq2frdkpnkwhzldvmjlrv/feed/aaaim53uagg4q";

    const url =
      "https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed" +
      `?feed=${encodeURIComponent(feedId)}&limit=10`;

    const res = await fetch(url);
    const data = await res.json();

    const items = data?.feed || [];

    if (!items.length) {
      console.log("⚠️ No posts found");
      return;
    }

    // último post
    const post = items[0].post;
    const text = post?.record?.text || "";

    console.log("📝 Post:", text);

    // acepta LENGTH=7 o LENGTH:7
    const match = text.match(/LENGTH\s*[:=]?\s*(\d+)/i);

    if (!match) {
      console.log("⚠️ No LENGTH found");
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

    fs.writeFileSync("snakesky.json", JSON.stringify(data, null, 2));

    console.log("🟩 UPDATED:", data);

  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

run();
