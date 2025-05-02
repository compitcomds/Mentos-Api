

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        uploadPath: env('UPLOADS_PATH', '/mnt/data/uploads'),
      },
    },
  },
  seo: {
          enabled: true,
  },
});
