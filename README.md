# sequelize-fn

[![Build Status](https://travis-ci.com/omenlogo/sequelize-fn.svg?branch=master)](https://travis-ci.com/omenlogo/sequelize-fn)
[![Coverage Status](https://coveralls.io/repos/github/omenlogo/sequelize-fn/badge.svg?branch=master)](https://coveralls.io/github/omenlogo/sequelize-fn?branch=master)

A simple package to setup `sequelize` in a very straightforward way.

## About

This library can be used to completely configure `sequelize` in a simple function call, on this call its created the instance, models are imported and other things can be done.

## Motivation

This library arises after identifying some deficiencies in the approach taked by `sequelize-cli` to automate the creation of sequelize instance and import the models over it.

When we use the `sequelize-cli` to generate our models, it generates an `index.js` file in the `models` folder which contains the logic necessary to create the sequelize instance and import the models.

One of the disadvantages of it's approach is that it restricts us to having only one instance of sequelize in our application, so if 2 or more are needed it would be necessary to do the entire process manually,with `sequelize-fn` to do this it would only takes be 2 function calls, which gives the user more flexibility.

> If the application need N sequelize instance `sequelize-fn` can be use N times with differents configurations.

Another disadvantage of the method used by `sequelize-cli` is that it does not make the flow of configuring the ORM composable, so if this behavior is desired it is necessary to implement some mechanism by the user to achieve the composability.

`sequelize-fn` as it is a function admits the composition in a much more natural way being able to implement the different processes of our application following a much more declarative approach, for example:

```js
const seqFn = require("sequelize-fn");

const setupSequelize = seqFn;
const setupExpress = sequelize => {
  // logic to bind sequelize inside of some express application
};

const initApp = compose(setupExpress, setupSequelize);

initApp(config);
```

Another improvement in the process of configuring sequelize, is that the cli provides us with an eager approach, so in case a lazy behavior is required it is necessary to implement manually.

`sequelize-fn` supports an eager approach but it can be configurable to behave lazily in case it is needed, just by passing the `lazy` property equal to `true` in the sequelize-fn configuration object it will return a function that when executed is that the instance will be created.

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

// this a fully configured sequelize instance ready to be used
const sequelize = seqFn(config);
```

> `dataBaseUri` and `modelsDir` are mandatory in the config object, if not the library will throw and error.

## Configuration

- `dataBaseUri`:
  String used to establish connection with the database , it must be in the following format `dialect://user:pass@host:[port]/database`.

- `modelsDir`: Absolute path for directory where models are located.

- `options`: Options object used as argument in sequelize constructor you can consult the full sequelize [documentation](https://sequelize.org/v5/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor).

- `lazy`: Boolean flag to indicate the lazy behavior of the function, when this it's `true` the call to `seqFn` not return a sequelize instance, but a function that when executed is that the flow for setup sequelize run.

## Executing hook function before return sequelize instance

If a new operation is needed on the sequelize instance, we can pass as second argument of our `sequelize-fn` function, that argument is a callback that receives the instance created as the first parameter, inside of it we can make many kind of thins over the instance.

Example defining relationships between imported models:

```js
const seqFn = require("sequelize-fn");

const config = {
  dataBaseUri: "mysql://user:pass@host/test",
  modelsDir: "/app/models"
};

const bindAssociations = sequelize => {
  const { Players, Teams } = sequelize.models;

  Players.belongsTo(Teams, {
    foreignKey: {
      name: "teamId",
      allowNull: false
    }
  });
};

const sequelize = seqFn(config, bindAssociations);
```

> Note how the sequelize instance is not returned  in the `bindAssociations` function, it's returned automatically.
