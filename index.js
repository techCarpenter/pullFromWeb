import fetch from "node-fetch";
import { minify } from "html-minifier";
import { JSDOM } from "jsdom";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import webPages from "./webPages.js";

async function main() {
  try {
    // Create 'Documents' directory if doesn't exist
    if (!existsSync("./Documents")) {
      await mkdir("Documents");
    }

    console.info("Begin pulling web pages...");

    const webPageArray = webPages.map(item => {
      if (typeof item === "string") {
        return {
          url: item,
          fileName: undefined
        };
      }
      return item;
    });

    for (let i = 0; i < webPageArray.length; i++) {
      // Write progress at beginning of each loop
      console.log(`Writing file ${(i + 1).toString()}/${webPageArray.length}`);

      const minifyOpts = {
          removeComments: true,
          collapseWhitespace: true,
          removeEmptyElements: true
        },
        dom = await getDomForUrl(webPageArray[i].url);

      if (typeof dom === "object") {
        const win = dom.window,
          doc = dom.window.document;

        let fileName = `./Documents/${getSafeFileName(
          webPageArray[i].fileName || doc.title
        )}.html`;

        // Remove all script tags
        Array.from(doc.querySelectorAll("script, iframe")).forEach(item =>
          item.remove()
        );

        // Replace relative urls with hardcoded url
        Array.from(doc.querySelectorAll("*"))
          .filter(
            docItem =>
              // @ts-ignore
              (docItem.href !== undefined &&
                // @ts-ignore
                docItem.href.startsWith(win.origin)) ||
              // @ts-ignore
              (docItem.src !== undefined && docItem.src.startsWith(win.origin))
          )
          .forEach(docItem => {
            // @ts-ignore
            if (docItem.href !== undefined) docItem.href = docItem.href;
            // @ts-ignore
            if (docItem.src !== undefined) docItem.src = docItem.src;
          });

        // Replace relative images with hardcoded url
        Array.from(doc.querySelectorAll("img"))
          .filter(img => img.src.startsWith(win.origin))
          .forEach(img => (img.src = img.src));

        await writeFile(fileName, minify(dom.serialize(), minifyOpts));
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    console.log("Finished.");
  }
}

/**
 * Get the DOM for a url
 * @param {string} url The url string to fetch
 * @returns {Promise<JSDOM | boolean>} returns a JSDOM object if url fetches, otherwise returns `false`
 */
async function getDomForUrl(url) {
  try {
    let response = await fetch(url).then(res => {
      if (res.status === 404) {
        throw new Error("404 Not Found");
      }
      return res.text();
    });
    return new JSDOM(response, { url });
  } catch (error) {
    console.log();
    console.warn(`Error fetching '${url}'`);
    console.warn(error.message);
    console.log();
    return false;
  }
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
  return str
    .replace(/\s*?[&|\/\\#,+()$~%.'":*?<>{}\s]\s*/g, separator)
    .replace(new RegExp(`(${separator})+`, "g"), separator);
}

// Execute script
main().then();
