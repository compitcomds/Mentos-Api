// src/utils/check-ownership.ts

export const checkOwnership = async (
  strapi: any,
  model: string,
  entryId: string | number,
  userId: number
): Promise<{ isOwner: boolean; entry: any | null }> => {
  const entry = await strapi.db.query(model).findOne({
    where: { id: entryId },
    populate: ['users'],
  });

  if (!entry) {
    console.warn('[Ownership Check] Entry not found');
    return { isOwner: false, entry: null };
  }

  const isOwner = entry.users?.id === userId;
  console.log('[Ownership Check] Entry user ID:', entry.users?.id);
  console.log('[Ownership Check] Current user ID:', userId);
  console.log('[Ownership Check] Is Owner:', isOwner);

  return { isOwner, entry };
};
