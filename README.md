# next-lambda
Serve next.js apps with AWS lambda

Based on @now/now-node-Bridge

Set `target: "serverless"` and deploy.

Usage:

```js
const nextLambda = require("next-lambda");

module.exports = nextLambda({
  routes: {
    "/": "/index",
    "/blog/:name": "/blog"
  }
});
```
