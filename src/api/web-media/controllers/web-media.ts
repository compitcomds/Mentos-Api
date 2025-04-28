/**
 * web-media controller
 */

import { factories } from '@strapi/strapi'
import { checkOwnership } from '../../../utils/check-ownership';

// export default factories.createCoreController('api::web-media.web-media');


export default factories.createCoreController('api::web-media.web-media', ({ strapi }) => ({
    async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a media');
    }
    ctx.request.body.data.user = user.id;
    return await super.create(ctx);
  },
    async update(ctx) {
    const user = ctx.state.user;
    const id = ctx.params.id;
    const { isOwner, entry: webMedia } = await checkOwnership(strapi, 'api::web-media.web-media', id, user.id);
    if (!webMedia) {
      return ctx.notFound('media not found');
    }
    if (!isOwner) {
      return ctx.unauthorized("You're not allowed to update this media");
    }
    const updatedwebMedia = await strapi.db.query('api::web-media.web-media').update({
      where: { id },
      data: ctx.request.body.data,
    });
    return ctx.send({
      message: 'media updated successfully',
      data: updatedwebMedia,
    });
  },  
    async delete(ctx) {
    const user = ctx.state.user;
    const id = ctx.params.id;
    const { isOwner, entry: webMedia } = await checkOwnership(strapi, 'api::web-media.web-media', id, user.id);
    if (!webMedia) {
      return ctx.notFound('media not found');
    }
    if (!isOwner) {
      return ctx.unauthorized("You're not allowed to delete this media");
    }
    await strapi.db.query('api::web-media.web-media').delete({
      where: { id },
    });
    return ctx.send({ message: 'media deleted successfully' }, 200);
  },

  async find(ctx) {
    const { key } = ctx.query;

    if (!key) {
      return ctx.badRequest('Key is required');
    }

    const webMedias = await strapi.entityService.findMany('api::web-media.web-media', {
      filters: { key },
      populate: ['media'],

    });

    return webMedias;
  },
  // Find one webMedia by key
  async findOne(ctx) {
    const { key } = ctx.query;

    if (!key) {
      return ctx.badRequest('Key is required');
    }

    const webMedia = await strapi.entityService.findMany('api::web-media.web-media', {
      filters: { key },
      populate: ['media'],
      limit: 1,
    });

    if (!webMedia || webMedia.length === 0) {
      return ctx.notFound('webMedia not found');
    }

    return webMedia[0]; // Return the first matching blog
  }
}));
