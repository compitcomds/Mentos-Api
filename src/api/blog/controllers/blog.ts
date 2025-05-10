import { factories } from "@strapi/strapi";
import { checkOwnership } from "../../../utils/check-ownership";

export default factories.createCoreController(
  "api::blog.blog",
  ({ strapi }) => ({
    // async create(ctx) {
    //   const user = ctx.state.user;
    //   if (!user) {
    //     return ctx.unauthorized("You must be logged in to create a blog post");
    //   }

    //   ctx.request.body.data.users = user.id;

    //   return await (this as any).super.create(ctx); // ✅ Correct in Strapi v5
    // },

    async create(ctx) {
      try {
        const user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized("You must be logged in to create a Blog");
        }

        const { data, files } = ctx.request.body || {};

        if (!data) {
          return ctx.badRequest("Missing data");
        }

        let parsedData;
        if (typeof data === "string") {
          try {
            parsedData = JSON.parse(data);
          } catch (error) {
            return ctx.badRequest("Invalid JSON format in data");
          }
        } else {
          parsedData = data;
        }
        const requiredFields = ["key"];
        const missingFields = requiredFields.filter(
          (field) => !parsedData[field]
        );
        if (missingFields.length > 0) {
          return ctx.badRequest(
            `Missing required fields: ${missingFields.join(", ")}`
          );
        }

        // Attach the authenticated user
        parsedData.users = user.id;

        // Optionally auto-publish (uncomment if needed)
        // parsedData.publishedAt = new Date();

        const createdEntry = await strapi.service("api::blog.blog").create({
          data: parsedData,
          files,
        });

        return ctx.created({ data: createdEntry });
      } catch (error) {
        strapi.log.error("Error creating blog", error);
        return ctx.internalServerError(
          "Something went wrong while creating the blog"
        );
      }
    },
    async update(ctx) {
      const user = ctx.state.user;
      const id = ctx.params.id;

      const { isOwner, entry: blog } = await checkOwnership(
        strapi,
        "api::blog.blog",
        id,
        user.id
      );
      if (!blog) {
        return ctx.notFound("Blog post not found");
      }
      if (!isOwner) {
        return ctx.unauthorized("You're not allowed to update this blog post");
      }

      const updatedBlog = await strapi.entityService.update(
        "api::blog.blog",
        id,
        {
          data: ctx.request.body.data,
        }
      );

      return ctx.send({
        message: "Blog post updated successfully",
        data: updatedBlog,
      });
    },

    async delete(ctx) {
      const user = ctx.state.user;
      const id = ctx.params.id;

      const { isOwner, entry: blog } = await checkOwnership(
        strapi,
        "api::blog.blog",
        id,
        user.id
      );
      if (!blog) {
        return ctx.notFound("Blog post not found");
      }
      if (!isOwner) {
        return ctx.unauthorized("You're not allowed to delete this blog post");
      }

      await strapi.entityService.delete("api::blog.blog", id);

      ctx.body = { message: "Blog post deleted successfully" };
    },

async find(ctx: any) {
  const { key, page, pageSize, fields, populate, filters } = ctx.query;

  // 1. Validate API key
  if (!key) {
    return ctx.badRequest("Key is required");
  }

  if (key !== "yna_24") {
    return ctx.unauthorized("Invalid key");
  }

  // 2. Prepare filters
  const mergedFilters = typeof filters === "object" && filters !== null ? filters : {};

  // 3. Determine whether to apply pagination
  const shouldPaginate = page && pageSize;
  const limit = shouldPaginate ? parseInt(pageSize, 10) : undefined;
  const pageNumber = shouldPaginate ? parseInt(page, 10) : undefined;
  const start = shouldPaginate ? (pageNumber - 1) * limit : undefined;

  // 4. Fetch blogs (with or without pagination)
  const queryOptions: any = {
    filters: mergedFilters,
    fields,
    populate,
  };

  if (shouldPaginate) {
    queryOptions.start = start;
    queryOptions.limit = limit;
  }

  const [blogs, total] = await Promise.all([
    strapi.entityService.findMany("api::blog.blog", queryOptions),
    strapi.entityService.count("api::blog.blog", {
      filters: mergedFilters,
    }),
  ]);

  // 5. Return response
  const response: any = {
    data: blogs,
  };

  if (shouldPaginate) {
    response.meta = {
      pagination: {
        page: pageNumber,
        pageSize: limit,
        pageCount: Math.ceil(total / limit),
        total,
      },
    };
  }

  return response;
},


    async findOne(ctx) {
      const { key } = ctx.query;

      if (!key) {
        return ctx.badRequest("Key is required");
      }

      const blogs = await strapi.entityService.findMany("api::blog.blog", {
        filters: { key },
        populate: [
          "tag",
          "authors",
          "categories",
          "seo_blog",
          "seo_blog.openGraph",
          "image",
          "seo_blog.metaImage",
          "seo_blog.openGraph.ogImage",
        ],
        limit: 1,
      });

      if (!blogs || blogs.length === 0) {
        return ctx.notFound("Blog not found");
      }

      return blogs[0];
    },
  })
);
