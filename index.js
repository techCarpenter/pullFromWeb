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

for (let i = 0; i < webPages.length; i++) {
	let response = await fetch(webPages[i].url).then(res => res.text());

	const dom = new JSDOM(response, {
		url: webPages[i].url
	});

	let sudoDom = dom.window.document;

	Array.from(sudoDom.querySelectorAll("script, dummy, style")).forEach(item =>
		item.remove()
	);

	fs.writeFile(`./Documents/${webPages[i].fileName}.html`, dom.serialize());
}

console.log("Files saved!");
