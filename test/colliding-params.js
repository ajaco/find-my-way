"use strict";

const t = require("tap");
const test = t.test;
const FindMyWay = require("../");

test("colliding params", (t) => {
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: true,
    defaultRoute: (req, res) => {
      t.fail("Should not be defaultRoute");
    },
  });

  t.plan(5);

  findMyWay.on("GET", "/foo/:id", (req, res, params) => {
    t.equal(params.id, "123");
  });

  findMyWay.on("GET", "/foo/:color/:id", (req, res, params) => {
    t.equal(params.color, "red");
    t.equal(params.id, "123");
  });

  // This route prevents 'color' param in the above route to be set if its value is 'red' - like in the lookups below
  // If you comment out this route-registration, the test will pass.
  findMyWay.on("GET", "/foo/red", (req, res, params) => {
    t.threw("should not be here");
  });

  // Demonstration route with another root to illustrate that the params work fine if you don't have a 'colliding' route like /bar/blue
  findMyWay.on("GET", "/bar/:color/:id", (req, res, params) => {
    t.equal(params.id, "123");
    t.equal(params.color, "blue");
  });

  findMyWay.lookup({ method: "GET", url: "/foo/123", headers: {} }); // Works
  findMyWay.lookup({ method: "GET", url: "/foo/red/123", headers: {} }); // color param is undefined

  findMyWay.lookup({ method: "GET", url: "/bar/blue/123", headers: {} }); // works
});
