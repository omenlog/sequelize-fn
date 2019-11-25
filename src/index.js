const fs = require("fs");
const Sequelize = require("sequelize");
const pipe = require("crocks/helpers/pipe");
const getPropOr = require("crocks/helpers/getPropOr");
const IO = require("crocks/IO");
const getProp = require("crocks/Maybe/getProp");
const path = require("path");
const either = require("crocks/pointfree/either");
const map = require("crocks/pointfree/map");
const filter = require("crocks/pointfree/filter");
const tap = require("crocks/helpers/tap");
const run = require("crocks/pointfree/run");
const tryCatch = require("crocks/Result/tryCatch");
const converge = require("crocks/combinators/converge");
const isTruthy = require("crocks/predicates/isTruthy");
const values = require("ramda/src/values");
const curry = require("crocks/helpers/curry");
const identity = require("ramda/src/identity");
const forEach = require("ramda/src/forEach");

const error = message => () => {
  throw new Error(message);
};

// getSequelizeOptions :: Object a => a -> a
const getSequelizeOptions = getPropOr({}, "options");

// getSequelizeUri :: Object a => a -> String
const getSequelizeUri = pipe(
  getProp("dataBaseUri"),
  either(error("Sequelize Uri Missing"), identity)
);

// createSequelizeInstance :: Object a , Sequelize s => (String,a) -> s
const createSequelizeInstance = (dataBaseUri, options) =>
  new Sequelize(dataBaseUri, options);

// initSequelize :: Object a , Sequelize s => a -> s|
const initSequelize = converge(
  createSequelizeInstance,
  getSequelizeUri,
  getSequelizeOptions
);

const associate = curry((sequelize, models) => {
  forEach(
    model => model.associate && model.associate(sequelize.models),
    models
  );
});

const runAssociations = tap(sequelize =>
  pipe(getProp("models"), map(values), map(associate(sequelize)))(sequelize)
);

// readModelsFiles :: String -> IO(Result e [String])
const readModelsFiles = location =>
  IO.of(() => tryCatch(() => fs.readdirSync(location))());

// getModelsDir :: Object a =>  a -> String
const getModelsDir = pipe(
  getProp("modelsDir"),
  either(error("Invalid Models Configuration"), identity)
);

// mapIO :: (a -> b) -> IO(a) -> (a -> b)
const mapIO = fn => crocksIO => crocksIO.map(ioFn => pipe(ioFn, fn));

// buildModelsPaths :: String -> [String] -> [String]
const buildModelsPaths = modelsDir =>
  map(modelName => path.join(modelsDir, modelName));

// processFileOf :: String -> (IO(Result([String])) -> [String])
const processFileOf = modelsDir =>
  mapIO(
    either(
      error("Error Reading models"),
      pipe(filterFiles, buildModelsPaths(modelsDir))
    )
  );

// filterFiles :: [String] -> [String]
const filterFiles = filter(fileName => fileName.slice(-3) === ".js");

// getModelsDefinition :: String -> IO ([String])
const getModelsDefinitions = modelsDir =>
  pipe(readModelsFiles, processFileOf(modelsDir))(modelsDir);

// getModels :: Object -> IO([String])
const getModels = pipe(getModelsDir, getModelsDefinitions);

// importModels :: Seq s => (s, IO([String])) -> IO(s)
const importDefinitions = (sequelize, modelsDefinitions) =>
  modelsDefinitions.map(fn => () => {
    forEach(model => sequelize.import(model), fn());
    return sequelize;
  });

const importModels = converge(importDefinitions, initSequelize, getModels);
const setupAfterHook = (fn = identity) => mapIO(tap(fn));
const finish = config => seqIO => (isTruthy(config.lazy) ? seqIO : seqIO());

// importer :: Object a, Sequelize s => (a, (s -> s)) -> IO(s) | s
const importer = (config, fn) =>
  pipe(
    importModels,
    runAssociations,
    setupAfterHook(fn),
    run,
    finish(config)
  )(config);

module.exports = importer;
module.exports.runAssociations = runAssociations;
