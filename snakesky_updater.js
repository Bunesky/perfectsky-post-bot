import fs from "fs";
import { BskyAgent } from "@atproto/api";

const agent = new BskyAgent({ service: "https://bsky.social" });

async function updateSnakeSky() {
  try {
    // 1. Login del bot (usa las mismas credenciales que ya usas)
    await agent.login({
      identifier: process.env.BSKY_USERNAME,
      password: process.env.BSKY_PASSWORD
    });

    // 2. Buscar el último post con #snakesky
    const res = await agent.app.bsky.feed.searchPosts({
      q: "#snakesky",
      limit: 1
    });

    if (!res?.data?.posts?.length) {
      console.log("No hay posts con #snakesky");
      return;
    }

    const post = res.data.posts[0];
    const text = post.record.text;

    // 3. Extraer la longitud
    const match = text.match(/(?:Snake\s+length|LENGTH):\s*(\d+)/i);
    const length = match ? parseInt(match[1], 10) : 0;

    // 4. Construir URL del post
    const rkey = post.uri.split("/").pop();
    const url = `https://bsky.app/profile/${post.author.handle}/post/${rkey}`;

    // 5. Crear objeto final
    const data = {
      length,
      player: post.author.handle,
      post: url
    };

    // 6. Guardar en snakesky.json
    fs.writeFileSync("snakesky.json", JSON.stringify(data, null, 2));

    console.log("snakesky.json actualizado:", data);

  } catch (err) {
    console.error("Error actualizando snakesky.json:", err);
  }
}

updateSnakeSky();
