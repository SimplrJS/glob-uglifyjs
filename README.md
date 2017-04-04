glob-uglifyjs
===========
Uglify JS files with glob pattern.


## Get started

For use a command line:
```sh
$ npm install glob-uglifyjs -g
```
For programmatic use:
```sh
$ npm install glob-uglifyjs
```

## Features
 - Uglify `js` files with [node-glob](https://github.com/isaacs/node-glob) pattern.
 - Remove source files (`js`) after uglify.


## Usage
```sh
$ glob-uglifyjs -h
```

| Argument                       | Type    | Default                     | Description                |
|--------------------------------|---------|-----------------------------|----------------------------|
|  -h, --help                    | boolean | false                       | Show help.                 | 
|  -p, --pattern <sup>[1]</sup>  | string  |                             | Files glob pattern.        | 
|  -v, --version                 | boolean | false                       | Show version number.       | 
|  -c, --config                  | string  | 'glob-uglifyjs.config.json' | Path to JSON config file.  | 

<sup>[1]</sup> - argument required.


## Config example
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


## Options
| Option                         | Type    | Default                     | Description                                                         |
|--------------------------------|---------|-----------------------------|---------------------------------------------------------------------|
|  UseMinExt                     | boolean | false                       | Use `min` extensions in output files.                               | 
|  MinifyOptions                 | object  |                             | UglifyJS options. [Read more.](https://github.com/mishoo/UglifyJS2) |
|  OutDir                        | string  | false                       | Redirect output structure to the directory.                         | 
|  RootDir                       | string  |                             | Specifies the root directory of input files.                        |
|  RemoveSource                  | boolean | false                       | Remove all source files specified by glob pattern.                  |
|  Debug                         | boolean | false                       | Show debug information.                                             |


## License
Released under the [PGL-3.0 license](LICENSE).
