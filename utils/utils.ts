import { createWriteStream } from "fs";
import axios from "axios";

async function storeImageFromFile(url: string, path: string): Promise<void> {
  const file = await axios.get(url, {
    responseType: "stream",
  });

  file.data.pipe(createWriteStream(path));
}

export { storeImageFromFile };
