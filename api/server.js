const jsonServer = require("json-server");
const { z } = require("zod");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const PORT = 8081;

const schemaPackageTypes = z.enum(["компрессия", "некомпрессия"]);

const schemaCreate = z
  .object({
    packsNumber: z.number().int().nonnegative(),
    packageType: schemaPackageTypes,
    isArchived: z.boolean(),
    description: z.string().optional(),
  })
  .strict();

const schemaUpdate = z
  .object({
    packsNumber: z.number().int().nonnegative().optional(),
    packageType: schemaPackageTypes.optional(),
    isArchived: z.boolean().optional(),
    description: z.string().optional(),
  })
  .strict();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/ping", (req, res) => {
  res.jsonp("pong");
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    const parseRes = schemaCreate.safeParse(req.body);
    if (!parseRes.success) {
      res.status(422).jsonp(parseRes.error);
      return;
    }
    req.body.createdAt = new Date().toISOString();
  }

  if (req.method === "PATCH") {
    const parseRes = schemaUpdate.safeParse(req.body);
    if (!parseRes.success) {
      res.status(422).jsonp(parseRes.error);
      return;
    }
  }
  // Continue to JSON Server router
  next();
});

// Use default router
server.use(router);
server.listen(PORT, () => {
  console.log(`JSON Server listening on port ${PORT}`);
});
