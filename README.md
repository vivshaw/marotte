# marotte
#### A CLI utility to statically prerender your dynamic front-end apps, using Puppeteer &amp; Express

![Splash](https://i.imgur.com/iMDz6PO.png)

Borne out of annoyance with the overkill of using full SSR for small projects, and the difficulty of getting framework-specific static prerendering tools working the way I wanted, marotte is a Puppeteer-based, framework-agnostic CLI app to statically prerender a front-end app. Since it's a CLI app, one can easily add 'marotte render' to their npm build script & have it run whenever you build.

## Usage
Global install:
```
npm i -g marotte
marotte init
marotte render
```

Local install:
```
npm i -D marotte
{add marotte to your build scripts}
```

## Commands
### render
This command statically prerenders your application by firing up an Express instance to host it, crawling it with Puppeteer, and writing the html content of the pages it finds to disk at the appropriate path.

```
> marotte render --help

Usage: render|r [options]

Statically prerender the application

Options:

  -w, --workingdir [dir]  Working directory for project [processs.cwd()]
  -d, --dist [dir]        Distribution subdirectory for project [./dist]
  -p, --port [port]       Port to host Express on [4000]
  -h, --help              output usage information
```

### init
This command will walk you through setting up a config file.
