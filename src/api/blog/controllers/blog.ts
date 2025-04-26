import { factories } from '@strapi/strapi';
import { checkOwnership } from '../../../utils/check-ownership';

export default factories.createCoreController('api::blog.blog', ({ strapi }) => ({
    async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a blog post');
    }
    ctx.request.body.data.user = user.id;
    return await super.create(ctx);
  },
    async update(ctx) {
    const user = ctx.state.user;
    const id = ctx.params.id;
    const { isOwner, entry: blog } = await checkOwnership(strapi, 'api::blog.blog', id, user.id);
    if (!blog) {
      return ctx.notFound('Blog post not found');
    }
    if (!isOwner) {
      return ctx.unauthorized("You're not allowed to update this blog post");
    }
    const updatedBlog = await strapi.db.query('api::blog.blog').update({
      where: { id },
      data: ctx.request.body.data,
    });
    return ctx.send({
      message: 'Blog post updated successfully',
      data: updatedBlog,
    });
  },  
    async delete(ctx) {
    const user = ctx.state.user;
    const id = ctx.params.id;
    const { isOwner, entry: blog } = await checkOwnership(strapi, 'api::blog.blog', id, user.id);
    if (!blog) {
      return ctx.notFound('Blog post not found');
    }
    if (!isOwner) {
      return ctx.unauthorized("You're not allowed to delete this blog post");
    }
    await strapi.db.query('api::blog.blog').delete({
      where: { id },
    });
    return ctx.send({ message: 'Blog post deleted successfully' }, 200);
  },

  async find(ctx) {
    const { key } = ctx.query;

    if (!key) {
      return ctx.badRequest('Key is required');
    }

    const blogs = await strapi.entityService.findMany('api::blog.blog', {
      filters: { key },
      populate: ['tag', 'authors', 'categories', 'seo_blog'],
    });

    return blogs;
  },

  // Find one blog by key
  async findOne(ctx) {
    const { key } = ctx.query;

    if (!key) {
      return ctx.badRequest('Key is required');
    }

    const blog = await strapi.entityService.findMany('api::blog.blog', {
      filters: { key },
      populate: ['tag', 'users', 'authors', 'categories', 'seo_blog'],
      limit: 1,
    });

    if (!blog || blog.length === 0) {
      return ctx.notFound('Blog not found');
    }

    return blog[0]; // Return the first matching blog
  }
}));
