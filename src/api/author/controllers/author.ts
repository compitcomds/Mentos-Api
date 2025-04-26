/**
 * author controller
 */
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
  }
  
}));
