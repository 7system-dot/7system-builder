import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { default as BuilderRoute } from './builder';

export async function loader(args: LoaderFunctionArgs) {
  return json({ id: args.params.id });
}

export default BuilderRoute;
