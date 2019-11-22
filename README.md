# sequelize-fn

[![Build Status](https://travis-ci.com/omenlogo/models-importer.svg?token=qhbienrBBMKjdQWQ2vXq&branch=master)](https://travis-ci.com/omenlogo/models-importer)
[![Coverage Status](https://coveralls.io/repos/github/omenlogo/models-importer/badge.svg?branch=master)](https://coveralls.io/github/omenlogo/models-importer?branch=master)

A simple package to setup sequelize in a very straightforward way.

## About

This library can be used to completely configure a sequelize, in a simple function call it create the instance import models and do other interesting things.

## Motivation

This library arises with the simple objective of wrapping in a simple function the steps that enerally were performed when sequelize is configured in one application.

Is considered that the most common operations when instantiating sequelize are:

- Create the instance.
- Import the models.
- Define relationships between the models.

At the same time sufficient flexibility is maintained in case you want to execute more operations over the instance so that they are not restricted to only these 3 steps

## Instalation

This is a [Node.js](http://nodejs.org) module available through the [npm registry](http://npmjs.com).

```sh
$ npm install seqfn
```

## Usage

```js
const seqFn = require("sequelize-fn");
const config = {
  dataBaseUri: "mysql://user:pass@host/test",
  modelsDir: "/app/models"
};

// this a fully configured sequelize instance
const sequelize = seqFn(config);
```

`dataBaseUri` and `modelsDir` must be present in the config object, if not the library will throw and error.

## Configurarion

- `dataBaseUri`:
  String used to establish connection with the database , it must be in the following format `dialect://user:pass@host:[port]/dataBase`

- `modelsDir`: Absolute path for directory when models are declared

- `options`: Options object used as argument in sequelize constructor you can consult the full sequelize [documentation](https://sequelize.org/v5/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor)

- lazy: Boolean flag to indicate the lazy behavior of the function, using a lazy behavior the call to `seqFn` not return a sequelize instance, but a function that when executed is that the instance is created

## Executing hook function before return sequelize instance

If a new operation is needed on the sequelize instance, we can pass as second argument of our factory function, a function that receives the instance created as the first parameter, inside of it we can make many kind of thins over the instance.

Example defining relationships between imported models:

```js
const seqFn = require("sequelize-fn");

const config = {
  dataBaseUri: "mysql://user:pass@host/test",
  modelsDir: "/app/models"
};

const relations = sequelize => {
  const { Players, Teams } = sequelize.models;

  Players.belongsTo(Teams, {
    foreignKey: {
      name: "teamId",
      allowNull: false
    }
  });
};

const sequelize = seqFn(config, relations);
```

> Note how the sequelize instance is not returned, in the anterior example, it's returned automatically.
