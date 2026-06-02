import { BskyAgent } from "@atproto/api";
import fs from "fs";

async function run() {
  const agent = new BskyAgent({ service: "https://bsky.social" });

  await agent.login({
    identifier: process.env.BSKY_USERNAME,
    password: process.env.BSKY_PASSWORD
  });

  // Buscar posts con el hashtag #snakesky
  const res = await agent.app.bsky.feed.searchPosts({
    q: "#snakesky",
    sort: "latest",
    limit: 1
  });

  if (!res.data.posts.length) {
    console.log("No hay posts con #snakesky.");
    return;
  }

  const post = res.data.posts[0];
  const text = post.record.text || "";

  const match = text.match(/LENGTH\s*=\s*(\d+)/i);

  if (!match) {
    console.log("El último post con #snakesky no contiene LENGTH=XX.");
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
