import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function AlertRoutes(app: FastifyInstance){
  // validate session
  app.addHook("preHandler", (req)=>{
    return req.jwtVerify()
  })

  app.get("/alerts",async (request, reply) => {
    return await prisma.alerts.findMany({
      select: {
        id: true,
        description: true,
        target_date: true
      }
    })
  })

}