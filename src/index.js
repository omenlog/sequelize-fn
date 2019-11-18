const fs = require("fs");
const Sequelize = require("sequelize");
const pipe = require("crocks/helpers/pipe");
const getPathOr = require("crocks/helpers/getPathOr");
const IO = require("crocks/IO");
const getPath = require("crocks/Maybe/getPath");
const path = require("path");
const either = require("crocks/pointfree/either");
const map = require("crocks/pointfree/map");
const run = require("crocks/pointfree/run");
const tryCatch = require("crocks/Result/tryCatch");
const converge = require("crocks/combinators/converge");
const identity = require("ramda/src/identity");
const forEach = require("ramda/src/forEach");
const isDefined = require("crocks/predicates/isDefined");

const error = message => e => {
  console.log(message);
  console.log("\n");
  isDefined(e) && console.log(e);
  process.exit(0);
};

// getSequelizeOptions :: Object a => a -> a
const getSequelizeOptions = getPathOr({}, ["sequelize", "options"]);

// getSequelizeUri :: Object a => a -> String
const getSequelizeUri = pipe(
  getPath(["sequelize", "dataBaseUri"]),
  either(error("Sequelize Uri Missing"), identity)
);

// createSequelizeInstance :: Object a , Sequelize s => (String,a) -> s
const createSequelizeInstance = (dataBaseUri, options = {}) =>
  new Sequelize(dataBaseUri, options);

// initSequelize :: Object a , Sequelize s => a -> s|
const initSequelize = converge(
  createSequelizeInstance,
  getSequelizeUri,
  getSequelizeOptions
);

// readModelsFiles :: String -> IO([String])
const readModelsFiles = location =>
  IO.of(() => tryCatch(() => fs.readdirSync(location))());

// getModelsDir :: Object a =>  a -> String
const getModelsDir = pipe(
  getPath(["sequelize", "modelsDir"]),
  either(error("Invalid Models Configuration"), identity)
);

// buildModelsPaths :: String -> [String] -> [String]
const buildModelsPaths = modelsDir =>
  map(modelName => path.join(modelsDir, modelName));

// getModelsDefinition :: String -> IO ([String])
const getModelsDefinitions = modelsDir =>
  pipe(
    readModelsFiles,
    map(fn =>
      pipe(
        fn,
        either(error("Error Reading models"), buildModelsPaths(modelsDir))
      )
    )
  )(modelsDir);

// getModels :: Object -> IO([String])
const getModels = pipe(getModelsDir, getModelsDefinitions);

// importModels :: Seq s => (s, IO([String])) -> IO(s)
const importModels = (sequelize, modelsDefinitions) =>
  modelsDefinitions.map(fn => () => {
    forEach(model => sequelize.import(model), fn());
    return sequelize;
  });

// importer :: Object a, Sequelize s => (a, (s -> s)) -> IO(s) | s
const importer = (config, afterFn = identity) =>
  pipe(
    converge(importModels, initSequelize, getModels),
    map(fn => pipe(fn, afterFn)),
    run,
    seqIO => (config.sequelize.lazy === true ? seqIO : seqIO())
  )(config);


module.exports = importer;