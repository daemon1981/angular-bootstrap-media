# angular-bootstrap-media [![Build Status](https://secure.travis-ci.org/daemon1981/angular-bootstrap-media.png)](https://travis-ci.org/daemon1981/angular-bootstrap-media)

## Description

Bootstrap Media with social interactivity

## Dependencies

This repository contains a set of native AngularJS directives based on Bootstrap's markup and CSS. As a result no dependency on jQuery or Bootstrap's JavaScript is required. The only required dependencies are:

AngularJS (minimal version 1.0.8)
Bootstrap CSS (tested with version 3.0.3). This version of the library (0.10.0) works only with Bootstrap CSS in version 3.x. 0.8.0 is the last version of this library that supports Bootstrap CSS in version 2.3.x.

## Installation

```bash
$ bower install angular-bootstrap-media
```

## Use

### Include in your header

```html
<link type="text/css" href="bootstrap.min.css"   rel="stylesheet">
<link type="text/css" href="bootstrap-theme.css" rel="stylesheet"/>
...
<script type="text/javascript" src="angular.min.js"></script>
<script type="text/javascript" src="ui-bootstrap-tpls-0.10.0.min.js"></script>
<script type="text/javascript" src="angular-bootstrap-media.js"></script>
```

### Include module in your angular module

```javascript
angular.module('myModule', ['angular-bootstrap-media']);
```

### Implementing in template

```html
<media
    media="media"
    service="service"
    max-last-comments="10">
</media>
```

See [demo](https://github.com/daemon1981/angular-bootstrap-media/tree/master/demo/index.html) to see how to implements "angular-bootstrap-media".

## Contributing to the project

### Development
#### Prepare your environment
* Install [Node.js > 0.10](http://nodejs.org/) and NPM (should come with)
* Install global dev dependencies: `npm install -g grunt-cli`
* Install local dev dependencies: `npm install`

#### Build
* Build the project: `grunt`

#### TDD
* Run test: `grunt test-watch`
 
This will start Karma server and will continuously watch files in the project, executing tests upon every change.

### Recommanded node js lib to provide media object

 - [Mongoose Rattle Plugin](https://github.com/daemon1981/mongoose-rattle-plugin)

### Projects using angular-bootstrap-media

 - [Workbook](https://github.com/eleven-labs/Workbook)
