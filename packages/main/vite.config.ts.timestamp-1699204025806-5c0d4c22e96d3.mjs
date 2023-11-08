// vite.config.ts
import { defineConfig } from "file:///Users/jamiedev/git/floro-mono/node_modules/vite/dist/node/index.js";
import react from "file:///Users/jamiedev/git/floro-mono/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig(({ command, mode }) => {
  var _a;
  const cdnHost = ((_a = process.env) == null ? void 0 : _a.CDN_HOST) ?? "";
  return {
    mode: process.env.MODE,
    outDir: "dist",
    plugins: [react()],
    publicDir: "public",
    assetsInclude: [
      "../common-assets/assets/**/*.svg",
      "../common-assets/assets/images/**/*.svg",
      "../common-assets/assets/images/icons/**/*.svg",
      "../common-assets/assets/images/repo_icons/**/*.svg",
      "../common-assets/assets/images/rich_text_icons/**/*.svg",
      "../common-assets/assets/**/*.png",
      "../common-assets/assets/**/*.txt",
      "../common-assets/assets/**/*.ttf"
    ],
    server: {
      hmr: {
        clientPort: 7777,
        port: 7777
      }
    },
    experimental: {
      renderBuiltUrl: (filename, { hostId }) => {
        if (command == "build" && cdnHost != "") {
          return `${cdnHost}/${filename}`;
        }
        return { relative: true };
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFtaWVkZXYvZ2l0L2Zsb3JvLW1vbm8vcGFja2FnZXMvbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2phbWllZGV2L2dpdC9mbG9yby1tb25vL3BhY2thZ2VzL21haW4vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWllZGV2L2dpdC9mbG9yby1tb25vL3BhY2thZ2VzL21haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSk6IGFueSA9PiB7XG4gIGNvbnN0IGNkbkhvc3QgPSBwcm9jZXNzLmVudj8uQ0ROX0hPU1QgPz8gXCJcIjtcbiAgcmV0dXJuIHtcbiAgICBtb2RlOiBwcm9jZXNzLmVudi5NT0RFLFxuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxuICAgIGFzc2V0c0luY2x1ZGU6IFtcbiAgICAgICcuLi9jb21tb24tYXNzZXRzL2Fzc2V0cy8qKi8qLnN2ZycsXG4gICAgICAnLi4vY29tbW9uLWFzc2V0cy9hc3NldHMvaW1hZ2VzLyoqLyouc3ZnJyxcbiAgICAgICcuLi9jb21tb24tYXNzZXRzL2Fzc2V0cy9pbWFnZXMvaWNvbnMvKiovKi5zdmcnLFxuICAgICAgJy4uL2NvbW1vbi1hc3NldHMvYXNzZXRzL2ltYWdlcy9yZXBvX2ljb25zLyoqLyouc3ZnJyxcbiAgICAgICcuLi9jb21tb24tYXNzZXRzL2Fzc2V0cy9pbWFnZXMvcmljaF90ZXh0X2ljb25zLyoqLyouc3ZnJyxcbiAgICAgICcuLi9jb21tb24tYXNzZXRzL2Fzc2V0cy8qKi8qLnBuZycsXG4gICAgICAnLi4vY29tbW9uLWFzc2V0cy9hc3NldHMvKiovKi50eHQnLFxuICAgICAgJy4uL2NvbW1vbi1hc3NldHMvYXNzZXRzLyoqLyoudHRmJyxcbiAgICBdLFxuICAgIHNlcnZlcjoge1xuICAgICAgaG1yOiB7XG4gICAgICAgIGNsaWVudFBvcnQ6IDc3NzcsXG4gICAgICAgIHBvcnQ6IDc3NzcsXG4gICAgICB9XG4gICAgfSxcbiAgICBleHBlcmltZW50YWw6IHtcbiAgICAgIHJlbmRlckJ1aWx0VXJsOiAoZmlsZW5hbWU6IHN0cmluZywgeyBob3N0SWQgfSkgPT4ge1xuICAgICAgICBpZiAoY29tbWFuZCA9PSBcImJ1aWxkXCIgJiYgY2RuSG9zdCAhPSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIGAke2Nkbkhvc3R9LyR7ZmlsZW5hbWV9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyByZWxhdGl2ZTogdHJ1ZSB9O1xuICAgICAgfSxcbiAgICB9LFxuICB9XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXNULFNBQVMsb0JBQW9CO0FBQ25WLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFXO0FBSnhEO0FBS0UsUUFBTSxZQUFVLGFBQVEsUUFBUixtQkFBYSxhQUFZO0FBQ3pDLFNBQU87QUFBQSxJQUNMLE1BQU0sUUFBUSxJQUFJO0FBQUEsSUFDbEIsUUFBUTtBQUFBLElBQ1IsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLEtBQUs7QUFBQSxRQUNILFlBQVk7QUFBQSxRQUNaLE1BQU07QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osZ0JBQWdCLENBQUMsVUFBa0IsRUFBRSxPQUFPLE1BQU07QUFDaEQsWUFBSSxXQUFXLFdBQVcsV0FBVyxJQUFJO0FBQ3ZDLGlCQUFPLEdBQUcsT0FBTyxJQUFJLFFBQVE7QUFBQSxRQUMvQjtBQUNBLGVBQU8sRUFBRSxVQUFVLEtBQUs7QUFBQSxNQUMxQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
