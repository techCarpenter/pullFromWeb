import fetch from "node-fetch";
import { minify } from "html-minifier";
import { JSDOM } from "jsdom";
import { writeFile } from "fs/promises";

let webPages = [
  {
    // fileName: "Beating the averages - Paul Graham",
    url: "http://paulgraham.com/avg.html"
  },
  {
    //fileName: "1. Writing Well - Intro - Julian Shapiro",
    url: "https://www.julian.com/guide/write/intro"
  },
  {
    //fileName: "2. Writing Well - Ideas - Julian Shapiro",
    url: "https://www.julian.com/guide/write/ideas"
  },
  {
    //fileName: "3. Writing Well - First Draft - Julian Shapiro",
    url: "https://www.julian.com/guide/write/first-draft"
  },
  {
    //fileName: "4. Writing Well - Rewriting - Julian Shapiro",
    url: "https://www.julian.com/guide/write/rewriting"
  },
  {
    //fileName: "5. Writing Well - Style - Julian Shapiro",
    url: "https://www.julian.com/guide/write/style"
  },
  {
    //fileName: "6. Writing Well - Practicing - Julian Shapiro",
    url: "https://www.julian.com/guide/write/practicing"
  }
];

async function main() {
  console.info("Begin pulling web pages...");
  try {
    for (let i = 0; i < webPages.length; i++) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(
        `Writing file ${(i + 1).toString()}/${webPages.length}${
          i === webPages.length - 1 ? "\n" : ""
        }`
      );

      const minifyOpts = {
          removeComments: true,
          collapseWhitespace: true,
          removeEmptyElements: true
        },
        dom = await getDomForUrl(webPages[i].url),
        win = dom.window,
        doc = dom.window.document;

      let docTitle = getSafeFileName(doc.title);
      let fileName = `./Documents/${webPages[i].fileName || docTitle}.html`;

      console.log("filename: ", fileName);

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

      await writeFile(fileName, minify(dom.serialize(), minifyOpts));
    }
  } catch (error) {
    console.error(error);
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

/**
 * Get a safe file name from a string
 * @param {string} str String to convert to file name
 * @param {boolean} allLower Convert string to all lowercase, default `true`
 * @param {string} separator String to replace invalid characters, default "-"
 * @returns String formatted as a safe file name
 */
function getSafeFileName(str, allLower = true, separator = "-") {
  str.trim();

  if (allLower) {
    str = str.toLowerCase();
  }

  return str.replace(/\s*?[ &\/\\#,+()$~%.'":*?<>{}]\s*/g, separator);
}

// Execute script
main().then();
