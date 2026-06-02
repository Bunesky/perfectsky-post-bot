const fs = require("fs");
const { BskyAgent } = require("@atproto/api");

async function run() {
  try {
    console.log("🚀 SnakeSky START");

    const agent = new BskyAgent({
      service: "https://bsky.social"
    });

    await agent.login({
      identifier: process.env.SNAKESKY_USERNAME,
      password: process.env.SNAKESKY_PASSWORD
    });

    // 🔴 FEED GENERATOR (FORMATO CORRECTO)
    const feedUri =
      "at://did:plc:jlyxq2frdkpnkwhzldvmjlrv/app.bsky.feed.generator/aaaim53uagg4q";

    const res = await agent.app.bsky.feed.getFeed({
      feed: feedUri,
      limit: 10
    });

    const items = res?.data?.feed;

    if (!Array.isArray(items) || items.length === 0) {
      console.log("⚠️ Feed vacío o inválido");
      return;
    }

    // 🟢 SOLO EL ÚLTIMO POST
    const post = items[0]?.post;

    if (!post) {
      console.log("⚠️ Post no existe");
      return;
    }

    const text = post.record?.text;

    if (!text) {
      console.log("⚠️ Post sin texto");
      return;
    }

    console.log("📝 POST:", text);

    // 🟢 EXTRAER NÚMERO (tu formato real)
    const match = text.match(/(\d+)/);

    if (!match) {
      console.log("⚠️ No se encontró número en el post");
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
    console.error("❌ ERROR REAL:");
    console.error(err);
    process.exit(1);
  }
}

run();
