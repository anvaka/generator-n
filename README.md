# Node.js minimalistic package generator

This is a generator for [Yeoman](http://yeoman.io). Unlike many other generators
this one will not include bunch of frameworks, config files and folders. Running
`yo n` will generate really simple folder structure:


```
README.md
LICENSE
index.js
package.json
```

In fact it will delegate generation work to `npm init` itself, and then will do
smart initializations, based on your package.json. This includes:

* Initialize GitHub project for your package
* Create proper `LICENSE` file based on your package.json
* Include test dependency based on your `scripts/test` of package.json
* Make initial commit to GitHub

## Trivia
Typing `yo n` is two times shorter than `npm init`

## Install

Before you can use this generator, make sure you have both Yeoman and generator-n
installed:

```
npm install -g generator-n yo
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
