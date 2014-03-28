# angular-bootstrap-media [![Build Status](https://secure.travis-ci.org/daemon1981/angular-bootstrap-media.png)](https://travis-ci.org/daemon1981/angular-bootstrap-media)

## Description

Bootstrap Media with social interactivity

## Dependencies

This repository contains a set of native AngularJS directives based on Bootstrap's markup and CSS. As a result no dependency on jQuery or Bootstrap's JavaScript is required. The only required dependencies are:

AngularJS (minimal version 1.0.8)
Bootstrap CSS (tested with version 3.0.3). This version of the library (0.10.0) works only with Bootstrap CSS in version 3.x. 0.8.0 is the last version of this library that supports Bootstrap CSS in version 2.3.x.

## Installation

```
bower install angular-bootstrap-media
```

## Contributing to the project

### Development
#### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM (should come with)
* Install global dev dependencies: `npm install -g grunt-cli`
* Install local dev dependencies: `npm install`

#### Build
* Build the project: `grunt`

#### TDD
* Run test: `grunt test-watch`
 
This will start Karma server and will continuously watch files in the project, executing tests upon every change.

## Use

```
<link href="bootstrap.min.css" rel="stylesheet">
...
<script src="angular.min.js"></script>
<script src="bootstrap.min.js"></script>
```

### Projects using angular-bootstrap-media

 - [Workbook](https://github.com/eleven-labs/Workbook)
