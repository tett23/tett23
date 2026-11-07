// Redirect pages for the URLs published under /tett23/ (ADR 0008).
// Run: deno test --allow-read .github/redirects

const dir = new URL("./", import.meta.url);

const PAGES: [path: string, target: string][] = [
  ["index.html", "https://tett23.github.io/"],
  ["nablaskk/index.html", "https://tett23.github.io/nablaskk/"],
  ["peg-hs/index.html", "https://tett23.github.io/peg-hs/"],
];

const check = (cond: unknown, msg: string) => {
  if (!cond) throw new Error(msg);
};

const read = (path: string) => Deno.readTextFile(new URL(path, dir));

const htmlFiles = async (url: URL, prefix = ""): Promise<string[]> => {
  const out: string[] = [];
  for await (const e of Deno.readDir(url)) {
    if (e.isDirectory) out.push(...await htmlFiles(new URL(`${e.name}/`, url), `${prefix}${e.name}/`));
    else if (e.name.endsWith(".html")) out.push(prefix + e.name);
  }
  return out;
};

Deno.test("exactly the published pages have redirects", async () => {
  const files = (await htmlFiles(dir)).sort();
  check(JSON.stringify(files) === JSON.stringify(PAGES.map(([p]) => p).sort()), `files: ${files}`);
});

for (const [path, target] of PAGES) {
  Deno.test(`${path} redirects to ${target}`, async () => {
    const html = await read(path);
    const esc = target.replaceAll(".", "\\.").replaceAll("/", "\\/");
    check(new RegExp(`<meta http-equiv="refresh" content="0; url=${esc}">`).test(html), "meta refresh");
    check(new RegExp(`<link rel="canonical" href="${esc}">`).test(html), "canonical");
    check(new RegExp(`<a href="${esc}">`).test(html), "link in the body");
    check(html.includes(`location.replace(${JSON.stringify(target)} + location.search + location.hash)`), "script");
    // The script runs before the refresh so that the fragment (#g=) is kept.
    check(html.indexOf("location.replace") < html.indexOf('http-equiv="refresh"'), "script before refresh");
  });
}

Deno.test("redirect pages load nothing from other origins", async () => {
  for (const [path] of PAGES) {
    const html = await read(path);
    check(!/<script[^>]*\ssrc=/i.test(html), `${path}: external script`);
    check(!/<link[^>]*rel="(?:stylesheet|preload)"/i.test(html), `${path}: stylesheet or preload`);
    check(!/url\(/i.test(html), `${path}: url() in CSS`);
  }
});
