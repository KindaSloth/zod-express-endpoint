import { Request, Response } from "express";
import { ZodSchema, z } from "zod";

import { HttpStatusCodes } from "./types";
import { EndpointError } from "./utils";

type Error = { error: string };

type Data<T> = T & { error?: never };

type SendData<T> = Data<T> | Error;

type SendResponse<T> = { status: HttpStatusCodes; data: T };

type ZodErrorMode = "production" | "development" | "always";

type Options = {
  zodErrorMode: ZodErrorMode;
  customUnexpectedError?: string;
};

export class TypeSafeEndpoint {
  private zodErrorMode: ZodErrorMode = "always";
  private customUnexpectedError?: string;

  constructor(options: Options) {
    this.zodErrorMode = options.zodErrorMode;
    this.customUnexpectedError = options.customUnexpectedError;
  }

  private isError<T>(x: SendData<T>): x is Error {
    return "error" in x;
  }

  private send<T>() {
    return (status: HttpStatusCodes, data: SendData<T>) => ({
      status,
      data,
    });
  }

  private emitZodErrorsBoolean(): boolean {
    if (this.zodErrorMode === "always") return true;

    if (
      this.zodErrorMode === "development" &&
      process.env.NODE_ENV === "development"
    )
      return true;

    if (
      this.zodErrorMode === "production" &&
      process.env.NODE_ENV === "production"
    )
      return true;

    return false;
  }

  create<
    ResponseSchema extends ZodSchema,
    Params extends ZodSchema = never,
    Body extends ZodSchema = never,
    Query extends ZodSchema = never
  >(
    schemas: {
      paramsSchema?: Params;
      bodySchema?: Body;
      querySchema?: Query;
      responseSchema: ResponseSchema;
    },
    cb: (
      req: Request<z.infer<Params>, any, z.infer<Body>, z.infer<Query>>,
      res: Response,
      send: (
        status: HttpStatusCodes,
        data: SendData<z.infer<ResponseSchema>>
      ) => SendResponse<z.infer<ResponseSchema>> | SendResponse<Error>
    ) => Promise<SendResponse<z.infer<ResponseSchema>> | SendResponse<Error>>
  ) {
    return async (req: Request, res: Response) => {
      try {
        const { paramsSchema, bodySchema, querySchema, responseSchema } =
          schemas;

        if (paramsSchema) {
          const validateParams = paramsSchema.safeParse(req.params);

          if (
            validateParams.success === false &&
            !this.emitZodErrorsBoolean()
          ) {
            console.error("Zod Request Error", { error: validateParams.error });
          }

          if (validateParams.success === false && this.emitZodErrorsBoolean()) {
            return res.status(400).json({ error: validateParams.error });
          }
        }

        if (bodySchema) {
          const validateBody = bodySchema.safeParse(req.body);

          if (validateBody.success === false && !this.emitZodErrorsBoolean()) {
            console.error("Zod Request Error", { error: validateBody.error });
          }

          if (validateBody.success === false && this.emitZodErrorsBoolean()) {
            return res.status(400).json({ error: validateBody.error });
          }
        }

        if (querySchema) {
          const validateQuery = querySchema.safeParse(req.query);

          if (validateQuery.success === false && !this.emitZodErrorsBoolean()) {
            console.error("Zod Request Error", { error: validateQuery.error });
          }

          if (validateQuery.success === false && this.emitZodErrorsBoolean()) {
            return res.status(400).json({ error: validateQuery.error });
          }
        }

        const result = await cb(req, res, this.send<z.infer<ResponseSchema>>());

        const resSchema = z
          .object({ status: z.number(), data: z.object({ error: z.string() }) })
          .or(z.object({ status: z.number(), data: responseSchema }));

        const responseValidator = resSchema.safeParse(result);

        if (
          responseValidator.success === false &&
          !this.emitZodErrorsBoolean()
        ) {
          console.error("Zod Response Error", {
            error: responseValidator.error,
          });
        }

        if (
          responseValidator.success === false &&
          this.emitZodErrorsBoolean()
        ) {
          return res.status(400).json({ error: responseValidator.error });
        }

        if (this.isError(result.data)) {
          return res.status(result.status).json({ error: result.data.error });
        }

        return res.status(result.status).json(result.data);
      } catch (err) {
        if (err instanceof EndpointError) {
          return res.status(400).json({ error: err.message });
        }

        console.error(err);

        return res
          .status(400)
          .json({ error: this.customUnexpectedError || "Unexpected Error" });
      }
    };
  }
}
