import fetch from "node-fetch";
import { minify } from "html-minifier";
import { JSDOM } from "jsdom";
import fs from "fs/promises";

let webPages = [
  {
    fileName: "1. Writing Well - Intro - Julian Shapiro",
    url: "https://www.julian.com/guide/write/intro"
  },
  {
    fileName: "2. Writing Well - Ideas - Julian Shapiro",
    url: "https://www.julian.com/guide/write/ideas"
  },
  {
    fileName: "3. Writing Well - First Draft - Julian Shapiro",
    url: "https://www.julian.com/guide/write/first-draft"
  },
  {
    fileName: "4. Writing Well - Rewriting - Julian Shapiro",
    url: "https://www.julian.com/guide/write/rewriting"
  },
  {
    fileName: "5. Writing Well - Style - Julian Shapiro",
    url: "https://www.julian.com/guide/write/style"
  },
  {
    fileName: "6. Writing Well - Practicing - Julian Shapiro",
    url: "https://www.julian.com/guide/write/practicing"
  }
];

async function main() {
  console.info("Begin pulling web pages...");

  for (let i = 0; i < webPages.length; i++) {
    console.log(`File #${(i + 1).toString()}`);

    const dom = await getDomForUrl(webPages[i].url);
    const win = dom.window;
    const doc = dom.window.document;

    // Remove all script and style tags
    Array.from(doc.querySelectorAll("script, style, dummy")).forEach(item =>
      item.remove()
    );

    // Replace relative urls with hardcoded url
    Array.from(doc.querySelectorAll("a"))
      .filter(anchor => anchor.href.startsWith(win.origin))
      .forEach(anchor => (anchor.href = anchor.href));

    // Remove links to style sheets
    Array.from(doc.querySelectorAll("link"))
      .filter(link => link.rel === "stylesheet")
      .forEach(link => link.remove());

    fs.writeFile(
      `./Documents/${webPages[i].fileName}.html`,
      minify(dom.serialize(), {
        removeComments: true,
        collapseWhitespace: true,
        removeEmptyElements: true
      })
    );
  }

  console.log("Finished.");
}

/**
 * Get the DOM for a url
 * @param {string} url The url string to fetch
 * @returns returns a JSDOM object
 */
async function getDomForUrl(url) {
  let response = await fetch(url).then(res => res.text());

  return new JSDOM(response, { url });
}

main().then();
