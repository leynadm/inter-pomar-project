import { type SchemaTypeDefinition } from 'sanity'
import { player } from "./player";
import { match } from "./match";
import { article } from "./article";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [player, match, article],
}
