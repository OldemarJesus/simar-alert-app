import fastifyJwt from "@fastify/jwt";
import 'dotenv/config';
import fastify from "fastify";
import { exit } from "process";
import { AlertRoutes } from "./routes/alertRoutes";
import { AuthRoutes } from "./routes/authRoutes";

const app = fastify()

const SECRET = process.env.SECRETS

if(!SECRET){
  console.error("Secret meesing")
  exit(1)
}

app.register(fastifyJwt, {
  secret: SECRET
})
app.register(AuthRoutes)
app.register(AlertRoutes)

app.listen({
  port: 3333
}).then(()=>{
  console.log("Server running on http://localhost:3333")
})