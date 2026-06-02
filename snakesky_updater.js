const fs = require("fs");

async function run() {
  try {
    console.log("🚀 SnakeSky feed reader (CLEAN MODE)");

    const feedUrl =
      "https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed" +
      "?feed=did:plc:jlyxq2frdkpnkwhzldvmjlrv/feed/aaaim53uagg4q&limit=10";

    const res = await fetch(feedUrl);
    const data = await res.json();

    const items = data?.feed || [];

    if (!items.length) {
      console.log("⚠️ Feed vacío");
      return;
    }

    const post = items[0].post;
    const text = post?.record?.text || "";

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
    console.error("❌ ERROR:");
    console.error(err);
    process.exit(1);
  }
}

run();
