import fetch from "node-fetch";
import path, { resolve } from "path";
import fs from "fs";

let config = JSON.parse(fs.readFileSync(path.resolve("config.json"), "utf-8"));

let providers = config["proxy-providers"].map((v) => v?.url).filter((v) => v?.trim());
let proxies = [];

async function cek(url: string): Promise<"err" | Array<string>> {
  if (!url) resolve("err");
  return await fetch(url, { method: "get" })
    .then(async (e) => {
      let text = await e.text();
      if (text.includes("<") || text.includes("html")) return "err";
      else
        return text
          .split("\n")
          .filter((v) => v?.trim())
          .map((v) => v.trim());
    })
    .catch((e) => {
      return "err";
    });
}

(async () => {
  for await (let v of providers) {
    let list = await cek(v);
    if (list != "err") proxies.push(...list);
  }
  fs.writeFileSync("unchecked-list.txt", proxies.join("\n"), "utf-8")
})();
