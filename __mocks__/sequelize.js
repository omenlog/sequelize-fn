"use strict";

const sequelize = function() {
  return { import: jest.fn() };
};

module.exports = sequelize;
