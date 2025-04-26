/**
 * categorie controller
 */

// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::categorie.categorie');


import { factories } from '@strapi/strapi';
import { checkOwnership } from '../../../utils/check-ownership';

export default factories.createCoreController('api::categorie.categorie', ({ strapi }) => ({
    async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a categorie');
    }
    ctx.request.body.data.user = user.id;
    return await super.create(ctx);
  },
    async update(ctx) {
    const user = ctx.state.user;
    const id = ctx.params.id;
    const { isOwner, entry: blog } = await checkOwnership(strapi, 'api::categorie.categorie', id, user.id);
    if (!blog) {
      return ctx.notFound('categorie not found');
    }
    if (!isOwner) {
      return ctx.unauthorized("You're not allowed to update this categorie");
    }
    const updatedBlog = await strapi.db.query('api::categorie.categorie').update({
      where: { id },
      data: ctx.request.body.data,
    });
    return ctx.send({
      message: 'Categorie updated successfully',
      data: updatedBlog,
    });
  },  
    async delete(ctx) {
    const user = ctx.state.user;
    const id = ctx.params.id;
    const { isOwner, entry: blog } = await checkOwnership(strapi, 'api::categorie.categorie', id, user.id);
    if (!blog) {
      return ctx.notFound('categorie not found');
    }
    if (!isOwner) {
      return ctx.unauthorized("You're not allowed to delete this categorie");
    }
    await strapi.db.query('api::categorie.categorie').delete({
      where: { id },
    });
    return ctx.send({ message: 'Categorie deleted successfully' }, 200);
  }
}));
