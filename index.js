const { Server } = require("http");
const serve = require("serve-handler");
const router = require("find-my-way")();

const { Bridge } = require("./bridge");

const bridge = new Bridge();

const saveListen = Server.prototype.listen;
Server.prototype.listen = function listen(...args) {
  this.on("listening", function listening() {
    bridge.port = this.address().port;
  });
  saveListen.apply(this, args);
};

module.exports = ({routes = {}}) => {
  try {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }

    router.on("GET", "/static/*", (req, res) => {
      req.url = req.url.replace("/static", "");
      return serve(req, res, { public: "static" });
    });

    Object.keys(routes).map(path => {
      const route = routes[path];
      router.on("GET", path, (req, res, params) => {
        const page = require(`./.next/serverless/pages${
          typeof route === "string" ? route : route.page
        }`);
        const qs = Object.keys(params)
          .map(key => `${key}=${params[key]}`)
          .join("&");
        const sep = req.url.indexOf("?") > -1 ? "&" : "?";
        req.url = `${req.url}${sep}${qs}`;
        page.render(req, res);
      });
    });

    const server = new Server((req, res) => {
      router.lookup(req, res);
    });

    server.listen(3000, () => console.log("Listening on http://localhost:3000"));
  } catch (error) {
    console.error(error);
    bridge.userError = error;
  }

  return {
    server,
    handler: bridge.launcher
  }
}
