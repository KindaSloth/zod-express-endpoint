# Intro

### Create fully inferred typesafe express endpoints using zod schemas

https://user-images.githubusercontent.com/55771765/217964766-edb63238-7079-442f-86ba-8ce94bf1382a.mp4

## How to Install

```
$ yarn add zod-express-endpoint

# or

$ npm i zod-express-endpoint
```

## Basic usage

```ts
import express, { json } from "express";
import { z } from "zod";
import { TypeSafeEndpoint } from "zod-express-endpoint";

const server = express();

server.use(json());

const endpoint = new TypeSafeEndpoint({ zodErrorMode: "always" });

server.post(
  "/api",
  endpoint.create(
    {
      bodySchema: z.object({ message: z.string() }),
      responseSchema: z.object({ message: z.string() }),
    },
    async (req, _res, send) => {
      const { message } = req.body;

      return send(200, { message });
    }
  )
);
```

## Options

```ts
const endpoint = new TypeSafeEndpoint({
  zodErrorMode: "always",
  customUnexpectedError: "Oh no",
});
```

| Syntax                | Type         | Required | Description                                                         |
| --------------------- | ------------ | -------- | ------------------------------------------------------------------- |
| zodErrorMode          | ZodErrorMode | true     | Endpoint will trigger zod errors in production, development or both |
| customUnexpectedError | String       | false    | Error Message when some unexpected error happens                    |

```ts
type ZodErrorMode = "production" | "development" | "always";
```

## Typing Body Params

```ts
import { TypeSafeEndpoint } from "zod-express-endpoint";

const endpoint = new TypeSafeEndpoint({ zodErrorMode: "always" });

const exampleEndpoint = endpoint.create(
  {
    bodySchema: z.object({ message: z.string() }),
    responseSchema: z.object({ message: z.string() }),
  },
  async (req, _res, send) => {
    const { message } = req.body;

    return send(200, { message });
  }
);
```

## Typing Path Params

```ts
import { TypeSafeEndpoint } from "zod-express-endpoint";

const endpoint = new TypeSafeEndpoint({ zodErrorMode: "always" });

const exampleEndpoint = endpoint.create(
  {
    paramsSchema: z.object({ message: z.string() }),
    responseSchema: z.object({ message: z.string() }),
  },
  async (req, _res, send) => {
    const { message } = req.params;

    return send(200, { message });
  }
);
```

## Typing Query Params

```ts
import { TypeSafeEndpoint } from "zod-express-endpoint";

const endpoint = new TypeSafeEndpoint({ zodErrorMode: "always" });

const exampleEndpoint = endpoint.create(
  {
    querySchema: z.object({ message: z.string() }),
    responseSchema: z.object({ message: z.string() }),
  },
  async (req, _res, send) => {
    const { message } = req.query;

    return send(200, { message });
  }
);
```

## Typing Endpoint Return

```ts
import { TypeSafeEndpoint } from "zod-express-endpoint";

const endpoint = new TypeSafeEndpoint({ zodErrorMode: "always" });

const exampleEndpoint = endpoint.create(
  {
    responseSchema: z.object({ message: z.string() }),
  },
  async (req, _res, send) => {
    return send(200, { message: "Hello there" });
  }
);
```

## Emitting Custom Errors

```ts
import { TypeSafeEndpoint, EndpointError } from "zod-express-endpoint";

const endpoint = new TypeSafeEndpoint({ zodErrorMode: "always" });

const exampleEndpoint = endpoint.create(
  {
    responseSchema: z.object({ message: z.string() }),
  },
  async (req, _res, send) => {
    return send(400, { error: 'Error' });
  }
);

# or

import { TypeSafeEndpoint, EndpointError } from "zod-express-endpoint";

const endpoint = new TypeSafeEndpoint({ zodErrorMode: "always" });

const exampleEndpoint = endpoint.create(
  {
    responseSchema: z.object({ message: z.string() }),
  },
  async (req, _res, send) => {
    throw new EndpointError("Error");
  }
);
```
