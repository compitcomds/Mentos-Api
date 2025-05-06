/**
 * web-media controller
 */

import { factories } from '@strapi/strapi'
import { checkOwnership } from '../../../utils/check-ownership';

// export default factories.createCoreController('api::web-media.web-media');


export default factories.createCoreController('api::web-media.web-media', ({ strapi }) => ({
    async create(ctx) {
        try {
          const user = ctx.state.user;
          if (!user) {
            return ctx.unauthorized('You must be logged in to create a media');
          }
      
          const { data, files } = ctx.request.body || {};
      
          if (!data) {
            return ctx.badRequest('Missing data');
          }
      
          let parsedData;
          if (typeof data === 'string') {
            try {
              parsedData = JSON.parse(data);
            } catch (error) {
              return ctx.badRequest('Invalid JSON format in data');
            }
          } else {
            parsedData = data;
          }
      
          // Basic field validation (optional, but good practice)
          const requiredFields = ['name', 'alt', 'key'];
          const missingFields = requiredFields.filter((field) => !parsedData[field]);
          if (missingFields.length > 0) {
            return ctx.badRequest(`Missing required fields: ${missingFields.join(', ')}`);
          }
      
          // Attach the authenticated user
          parsedData.users = user.id;
      
          // Optionally auto-publish (uncomment if needed)
          // parsedData.publishedAt = new Date();
      
          const createdEntry = await strapi.service('api::web-media.web-media').create({
            data: parsedData,
            files,
          });
      
          return ctx.created({ data: createdEntry });
        } catch (error) {
          strapi.log.error('Error creating web-media:', error);
          return ctx.internalServerError('Something went wrong while creating the media');
        }
      }
                  
,      
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
  
    // Extract and validate filters from the query
    const filtersFromQuery = ctx.query.filters;
    const otherQueryParams = { ...ctx.query };
    delete otherQueryParams.filters;
    delete otherQueryParams.key;
  
    const mergedFilters = {
      ...(typeof filtersFromQuery === 'object' && filtersFromQuery !== null ? filtersFromQuery : {}),
      key,
    };
  
    const webMedias = await strapi.entityService.findMany('api::web-media.web-media', {
      filters: mergedFilters,
      populate: ['media', 'tags'],
      ...otherQueryParams, // supports pagination, sort, etc.
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
