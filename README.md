glob-uglifyjs
===========
Uglify JS files with glob pattern.


## Installation
```sh
$ npm install glob-uglifyjs
```


## Features
 - Uglify `js` files with [node-glob](https://github.com/isaacs/node-glob) pattern.
 - Remove source files after uglify.


## Command line

### Usage
```sh
$ glob-uglifyjs -h
```

### Arguments
| Argument                       | Type    | Default                     | Description                |
|--------------------------------|---------|-----------------------------|----------------------------|
|  -h, --help                    | boolean | `false`                     | Show help.                 | 
|  -p, --pattern <sup>[*]</sup>  | string  |                             | Files glob pattern.        | 
|  -v, --version                 | boolean | `false`                     | Show version number.       | 
|  -c, --config                  | string  | `glob-uglifyjs.config.json` | Path to JSON config file.  | 

<sup>[*]</sup> - argument required.


## Config

### Example
```json
{
    "pattern": "/**/*",
    "options": {
        "UseMinExt": false,
        "MinifyOptions": {},
        "OutDir": "dist-min",
        "RootDir": "dist",
        "RemoveSource": false,
        "Debug": false
    }
}
```

### Properties

| Property                | Type                | Description            |
|-------------------------|---------------------|------------------------|
|  pattern<sup>[*]</sup>  | string              | Files glob pattern.    |
|  options                | [Options](#options) | glob-uglifyjs options. |

<sup>[*]</sup> - property required.

### Options
| Option          | Type               | Default         | Description                                                                        |
|-----------------|--------------------|-----------------|------------------------------------------------------------------------------------|
|  UseMinExt      | `boolean`            | `true`          | Use `min` extensions in output files.                                              | 
|  MinifyOptions  | `Object`             | `{}`            | UglifyJS minify options. [Read more](https://github.com/mishoo/UglifyJS2).         |
|  OutDir         | `string`             | ` `             | Redirect output structure to the directory.                                        |
|  RootDir        | `string`             | ` `             | Specifies the root directory of input files.                                       |
|  RemoveSource   | `boolean`            | `false`         | Remove all source files specified by glob pattern.                                 |
|  Debug          | `boolean`            | `false`         | Show errors details information.                                                   |
|  exclude        | `string` \| `string[]` | `undefined`     | Add a pattern or an array of glob patterns to exclude matches. Read more in [node-glob options](https://github.com/isaacs/node-glob#options) `ignore`. |
|  Cwd            | `string`             | `process.cwd()` | Current working directory.                                                         |


## License
Released under the [MIT license](LICENSE).
