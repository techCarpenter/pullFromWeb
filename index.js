import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import fs from "fs/promises";

let webPages = [
	{
		fileName: "1. Intro - Writing Well - Julian Shapiro",
		url: "https://www.julian.com/guide/write/intro"
	},
	{
		fileName: "2. Ideas - Writing Well - Julian Shapiro",
		url: "https://www.julian.com/guide/write/ideas"
	},
	{
		fileName: "3. First Draft - Writing Well - Julian Shapiro",
		url: "https://www.julian.com/guide/write/first-draft"
	},
	{
		fileName: "4. Rewriting - Writing Well - Julian Shapiro",
		url: "https://www.julian.com/guide/write/rewriting"
	},
	{
		fileName: "5. Style - Writing Well - Julian Shapiro",
		url: "https://www.julian.com/guide/write/style"
	},
	{
		fileName: "6. Practicing - Writing Well - Julian Shapiro",
		url: "https://www.julian.com/guide/write/practicing"
	}
];

async function main() {
	for (let i = 0; i < webPages.length; i++) {
		const dom = await getDomForUrl(webPages[i].url);
		const win = dom.window;
		const doc = dom.window.document;

		// Remove all script and style tags
		Array.from(doc.querySelectorAll("script, style")).forEach(item =>
			item.remove()
		);

		// Replace relative urls with hardcoded url
		Array.from(doc.querySelectorAll("a"))
			.filter(anchor => anchor.href.startsWith(win.origin))
			.forEach(anchor => {
				anchor.href = anchor.href;
			});

		// Remove links to style sheets
		Array.from(doc.querySelectorAll("link"))
			.filter(link => link.rel === "stylesheet")
			.forEach(link => {
				link.remove();
			});

		fs.writeFile(`./Documents/${webPages[i].fileName}.html`, dom.serialize());
	}

	console.log("Files saved!");
}

/**
 * Get the DOM for a url
 * @param {string} url The url string to fetch
 * @returns returns a JSDOM object
 */
async function getDomForUrl(url) {
	let response = await fetch(url).then(res => res.text());

	return new JSDOM(response, {
		url
	});
}

main().then(() => {
	return;
});
