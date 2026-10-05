/**
 * Slug generator utility
 * Converts any product name or arbitrary text into a URL-friendly slug.
 */

/**
 * Converts a string into a URL-friendly slug.
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // normalize unicode (e.g., accents)
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid characters
    .replace(/[\s_]+/g, "-") // replace spaces and underscores with hyphen
    .replace(/-+/g, "-") // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
};

/**
 * Generates a unique slug by checking against a Mongoose model.
 * If a conflict is found, it appends an incrementing counter or random suffix.
 *
 * @param {string} text - Base name to slugify
 * @param {import('mongoose').Model} Model - Mongoose model to query against
 * @param {string|null} [currentId=null] - Current document ID to exclude from conflict check
 * @returns {Promise<string>} Unique slug
 */
export const generateUniqueSlug = async (text, Model, currentId = null) => {
  const baseSlug = slugify(text) || "product";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentId) {
      query._id = { $ne: currentId };
    }

    const existing = await Model.findOne(query).select("_id").lean();
    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

export default slugify;
