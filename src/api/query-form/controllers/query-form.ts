import { factories } from '@strapi/strapi';
import _ from 'lodash';

export default factories.createCoreController('api::query-form.query-form', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user || !user.key) {
      return ctx.unauthorized('Authentication with valid user key is required');
    }

    const { filters: filtersFromQuery, ...otherQueryParams } = ctx.query;
    const mergedFilters = {
      ...(typeof filtersFromQuery === 'object' && filtersFromQuery !== null ? filtersFromQuery : {}),
      key: user.key,
    };

    const entries = await strapi.entityService.findMany('api::query-form.query-form', {
      filters: mergedFilters,
      populate: '*',
      ...otherQueryParams,
    });

    // Remove `createdBy` and `updatedBy` from each entry
    const sanitized = entries.map(entry => _.omit(entry, ['createdBy', 'updatedBy']));

    return this.transformResponse(sanitized);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user || !user.key) {
      return ctx.unauthorized('Authentication with valid user key is required');
    }

    const entries = await strapi.entityService.findMany('api::query-form.query-form', {
      filters: { key: user.key },
      populate: '*',
      limit: 1,
    });

    if (!entries?.[0]) {
      return ctx.notFound('Query Form not found');
    }

    const sanitized = _.omit(entries[0], ['createdBy', 'updatedBy']);
    return this.transformResponse(sanitized);
  },
}));
