import { SITE_URL } from './content/site';
import { PUBLIC_ROUTES } from './content/routes';

export default function sitemap() {
  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    changeFrequency,
    priority,
  }));
}
