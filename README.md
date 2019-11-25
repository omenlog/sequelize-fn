# sequelize-fn

[![Build Status](https://travis-ci.com/omenlogo/models-importer.svg?token=qhbienrBBMKjdQWQ2vXq&branch=master)](https://travis-ci.com/omenlogo/models-importer)
[![Coverage Status](https://coveralls.io/repos/github/omenlogo/models-importer/badge.svg?branch=master)](https://coveralls.io/github/omenlogo/models-importer?branch=master)

A simple package to setup sequelize in a very straightforward way.

## About

This library can be used to completely configure a sequelize, in a simple function call it create the instance import models and do other interesting things.

## Motivation

This library arises after identifying some deficiencies in the approach taked by `sequelize-cli` to automate the creation of sequelize instance and import the models over it.

When we use the `sequelize-cli` to generate our models, it generates an "index.js" file in the models folder which contains the logic necessary to create the sequelize instance and import the models.

One of the disadvantages of it's approach is that it restricts us to having only one instance of sequelize in our application, so if 2 or more are needed it would be necessary to do the entire process manually,with `sequelize-fn` would be 2 or more calls to function, which gives the user more flexibility.

Another disadvantage of the method used by the climate is that it does not make the flow of configuring the ORM compliable, so if this behavior is desired it is necessary to implement a mechanism by the user.

`sequelize-fn` as it is a function admits the composition in a much more natural way being able to implement the different processes of our application following a much more declarative approach, for example:

```js
const seqFn = require("sequelize-fn");
const setupSequelize = seqFn;
const initApp = compose(setupExpress, setupSequelize);
initApp(config);
```

Another improvement in the process of configuring sequelize, is that the cli provides us with an eager approach, so in case a lazy behavior is required it is necessary to implement manually.

`sequelize-fn` supports an eager approach but it can be configurable to behave lazily in case it is needed, just by passing the `lazy` property equal to `true` in the sequelize-fn configuration object it will return a function that when executed is that the instance will be created.

with the simple objective of wrapping in a simple function the steps that enerally were performed when sequelize is configured in one application.

Is considered that the most common operations when instantiating sequelize are:

- Create the instance.
- Import the models.
- Define relationships between the models.

At the same time sufficient flexibility is maintained in case you want to execute more operations over the instance so that they are not restricted to only these 3 steps

## Instalation

This is a [Node.js](http://nodejs.org) module available through the [npm registry](http://npmjs.com).

```sh
$ npm install sequelize-fn
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

- `lazy`: Boolean flag to indicate the lazy behavior of the function, using a lazy behavior the call to `seqFn` not return a sequelize instance, but a function that when executed is that the instance is created

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
