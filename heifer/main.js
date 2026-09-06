import { moo } from "./moo.js"
import { say } from "cowsay"

let NAME = "Esat"

console.log(say( { text: moo(NAME) } ));
