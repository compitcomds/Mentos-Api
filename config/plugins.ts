

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        uploadPath: env('UPLOADS_PATH'),
      },
    },
  },
  seo: {
          enabled: true,
  },
});
