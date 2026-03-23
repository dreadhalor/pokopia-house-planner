import { router, publicProcedure } from '../trpc';
import { itemSearchSchema, itemBySlugSchema } from '@/lib/schemas/items';
import {
  items,
  getItemBySlug,
  getItemImagePath,
  ITEM_CATEGORIES,
  ITEM_TAGS,
} from '@/data';

export const itemsRouter = router({
  search: publicProcedure.input(itemSearchSchema).query(({ input }) => {
    let results = [...items];

    if (input.query) {
      const q = input.query.toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }

    if (input.category) {
      results = results.filter((item) => item.category === input.category);
    }

    if (input.tag) {
      results = results.filter((item) => item.tag === input.tag);
    }

    return results.map((item) => ({
      ...item,
      image: getItemImagePath(item),
    }));
  }),

  getBySlug: publicProcedure.input(itemBySlugSchema).query(({ input }) => {
    const item = getItemBySlug(input.slug);
    if (!item) return null;
    return {
      ...item,
      image: getItemImagePath(item),
    };
  }),

  categories: publicProcedure.query(() => {
    return ITEM_CATEGORIES.map((cat) => ({
      name: cat,
      count: items.filter((i) => i.category === cat).length,
    }));
  }),

  tags: publicProcedure.query(() => {
    return ITEM_TAGS.map((tag) => ({
      name: tag,
      count: items.filter((i) => i.tag === tag).length,
    }));
  }),
});
