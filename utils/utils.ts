import { createWriteStream } from "fs";
import axios from "axios";

async function storeImageFromFile(path: string, url: string): Promise<void> {
  const file = await axios.get(url, {
    responseType: "stream",
  });

  file.data.pipe(createWriteStream(path));
}

export { storeImageFromFile };
