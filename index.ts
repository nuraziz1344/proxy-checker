import axios from "axios";
import { appendFileSync } from "fs";
import { SocksProxyAgent } from "socks-proxy-agent";

var checked = 0,
  valid = 0;
async function check(proxies) {
  const res = await Promise.all(
    proxies.map((proxy) => {
      const agent = new SocksProxyAgent(`socks5://${proxy}`, { timeout: 10000 });
      return axios
        .get("https://api.ipgeolocation.io/ipgeo?apiKey=2eb7741aa70b40bfab0eb7061f968d1e", { timeout: 10000, httpsAgent: agent })
        .then((e) => e.status < 400 && proxy)
        .catch(() => null);
    })
  ).then((e) => e.filter((v) => !!v));
  if (res.length > 0) {
    valid += res.length
    appendFileSync("socks5.txt", res.join("\n") + "\n");
  }
}

async function main() {
  const sources = [
    "https://raw.githubusercontent.com/prxchk/proxy-list/main/socks5.txt",
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
    "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt",
    "https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5.txt",
    "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5.txt",
    "https://raw.githubusercontent.com/JIH4DHoss4in/PROXY-List/master/socks5.txt",
  ];

  for (let source of sources) {
    const proxies = await axios
      .get(source)
      .then((e) => e.data && e.data?.split("\n")?.filter((v) => v?.trim() && /((\d{1,3}((\.)(\d{1,3})){3})\:(\d{1,5}))/.test(v)))
      .then((e) => e.map((v) => v.match(/((\d{1,3}((\.)(\d{1,3})){3})\:(\d{1,5}))/)[0]))
      .catch((e) => {
        console.error(e);
        return null;
      });

    if (proxies.length <= 100) {
      await check(proxies);
    } else {
      const chunk_total = proxies.length / 100;
      for (let i = 0; i < chunk_total; i++) {
        const chunk = proxies.slice(i * 100, 100 + i * 100);
        await check(chunk);
      }
    }
    checked += proxies.length;
    console.log("checked: %s proxies | valid: %s", checked, valid);
  }
}

main();
