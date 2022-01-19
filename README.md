# pullFromWeb

## Get Started

Install all dependencies

```shell
npm install
```

Then update the `./webPages.js` export to include your urls.

Once you've updated and saved that file, run the script to pull the html page. The script will also strip `script` and `style` tags, as well a `link` tags with `rel="stylesheet"`.

```shell
npm run start
```

Output files will be placed in a directory called `Documents/`
