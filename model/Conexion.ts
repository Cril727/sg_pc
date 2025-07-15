import { Client } from "../dependencies/depnedencies.ts"

export const con = await new Client().connect({
  hostname: "localhost",
  username: "root",
  db: "lab",
  password: "",
  port:3307
})
