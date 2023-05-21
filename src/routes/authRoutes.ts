import { FastifyInstance } from "fastify";
import { z } from "zod";
import { Hash } from "../lib/hash";
import { prisma } from "../lib/prisma";

export async function AuthRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    try {
      // validate body request
      const bodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(6).max(13),
        name: z.string(),
      });

      const { email, password, name } = bodySchema.parse(request.body);

      // validate that the account does not exist
      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (user) {
        return reply.status(400).send({ message: "User already exists" });
      }

      // register user
      await prisma.user.create({
        data: {
          email,
          password: Hash(password),
          name,
        },
      });

      user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return reply.status(500).send({ message: "Something goes wrong." });
      }

      const token = app.jwt.sign(
        {
          email,
          name,
        },
        {
          sub: user.id,
          expiresIn: "1 day",
        }
      );

      return reply.status(201).send({ token });
    } catch (error) {
      return reply.status(400).send({ error });
    }
  });

  app.get("/login", async (request, reply) => {
    try {
      // validate body
      const bodySchema = z.object({
        email: z.string().email(),
        password: z.string(),
      });

      const {email, password} = bodySchema.parse(request.body);

      // verify that user exist

      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email
        }
      })

      if(user.password !== Hash(password)){
        return reply.status(401).send({
          message: "User account not found."
        })
      }

      const token = app.jwt.sign(
        {
          email,
          name,
        },
        {
          sub: user.id,
          expiresIn: "1 day",
        }
      );

      return reply.status(201).send({ token });
    } catch (error) {
      return reply.status(400).send({ error });
    }
  });
}
