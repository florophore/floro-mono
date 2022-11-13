// vite.config.ts
import { defineConfig } from "file:///Users/jamiedev/git/floro-mono/node_modules/vite/dist/node/index.js";
import react from "file:///Users/jamiedev/git/floro-mono/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  return {
    mode: process.env.MODE,
    outDir: "dist",
    plugins: [react()],
    assetsInclude: [
      "../common-assets/assets/**/*.svg",
      "../common-assets/assets/**/*.png",
      "../common-assets/assets/**/*.txt",
      "../common-assets/assets/**/*.ttf"
    ],
    server: {
      hmr: {
        clientPort: 7777,
        port: 7777
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFtaWVkZXYvZ2l0L2Zsb3JvLW1vbm8vcGFja2FnZXMvbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2phbWllZGV2L2dpdC9mbG9yby1tb25vL3BhY2thZ2VzL21haW4vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWllZGV2L2dpdC9mbG9yby1tb25vL3BhY2thZ2VzL21haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSk6IGFueSA9PiB7XG4gIHJldHVybiB7XG4gICAgbW9kZTogcHJvY2Vzcy5lbnYuTU9ERSxcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgYXNzZXRzSW5jbHVkZTogW1xuICAgICAgJy4uL2NvbW1vbi1hc3NldHMvYXNzZXRzLyoqLyouc3ZnJyxcbiAgICAgICcuLi9jb21tb24tYXNzZXRzL2Fzc2V0cy8qKi8qLnBuZycsXG4gICAgICAnLi4vY29tbW9uLWFzc2V0cy9hc3NldHMvKiovKi50eHQnLFxuICAgICAgJy4uL2NvbW1vbi1hc3NldHMvYXNzZXRzLyoqLyoudHRmJyxcbiAgICBdLFxuICAgIHNlcnZlcjoge1xuICAgICAgaG1yOiB7XG4gICAgICAgIGNsaWVudFBvcnQ6IDc3NzcsXG4gICAgICAgIHBvcnQ6IDc3NzcsXG4gICAgICB9XG4gICAgfVxuICB9XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXNULFNBQVMsb0JBQTZCO0FBQzVWLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBVztBQUM3QyxTQUFPO0FBQUEsSUFDTCxNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ2xCLFFBQVE7QUFBQSxJQUNSLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixlQUFlO0FBQUEsTUFDYjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLEtBQUs7QUFBQSxRQUNILFlBQVk7QUFBQSxRQUNaLE1BQU07QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
