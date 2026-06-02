import { BskyAgent } from "@atproto/api";
import fs from "fs";

async function run() {
  const agent = new BskyAgent({ service: "https://bsky.social" });

  await agent.login({
    identifier: process.env.BSKY_USERNAME,
    password: process.env.BSKY_PASSWORD
  });

  // FEED EXACTO QUE ME DISTE
  const snakeskyFeed = "did:plc:jlyxq2frdkpnkwhzldvmjlrv/feed/aaaim53uagg4q";

  const res = await agent.app.bsky.feed.getFeed({
    feed: snakeskyFeed,
    limit: 1
  });

  if (!res.data.feed.length) {
    console.log("No hay posts en el feed SnakeSky.");
    return;
  }

  const item = res.data.feed[0];
  const post = item.post;
  const text = post.record.text || "";

  const match = text.match(/LENGTH\s*=\s*(\d+)/i);

  if (!match) {
    console.log("El último post no contiene LENGTH=XX.");
    return;
  }

  const length = parseInt(match[1], 10);

  const uri = post.uri;
  const rkey = uri.split("/").pop();
  const postUrl = `https://bsky.app/profile/${post.author.did}/post/${rkey}`;

  const data = {
    length,
    player: post.author.handle,
    post: postUrl,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync("snakesky.json", JSON.stringify(data, null, 2));
  console.log("🟩 snakesky.json actualizado:", data);
}

run();
