// vite.config.ts
import { defineConfig } from "file:///Users/jamiedev/git/floro-mono/node_modules/vite/dist/node/index.js";
import react from "file:///Users/jamiedev/git/floro-mono/node_modules/@vitejs/plugin-react/dist/index.mjs";
function JSONHmr() {
  return {
    name: "json-hmr",
    enforce: "post",
    // HMR
    handleHotUpdate({ file, server }) {
      if (file.includes("text") && file.endsWith(".json")) {
        console.log("reloading json file...");
        server.ws.send({
          type: "full-reload",
          path: "*"
        });
      }
    }
  };
}
var vite_config_default = defineConfig(({ command, mode }) => {
  var _a;
  const cdnHost = ((_a = process.env) == null ? void 0 : _a.CDN_HOST) ?? "";
  return {
    mode: process.env.MODE,
    outDir: "dist",
    plugins: [react(), JSONHmr()],
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFtaWVkZXYvZ2l0L2Zsb3JvLW1vbm8vcGFja2FnZXMvbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2phbWllZGV2L2dpdC9mbG9yby1tb25vL3BhY2thZ2VzL21haW4vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWllZGV2L2dpdC9mbG9yby1tb25vL3BhY2thZ2VzL21haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG5mdW5jdGlvbiBKU09OSG1yKCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdqc29uLWhtcicsXG4gICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgIC8vIEhNUlxuICAgIGhhbmRsZUhvdFVwZGF0ZSh7IGZpbGUsIHNlcnZlciB9KSB7XG4gICAgICBpZiAoZmlsZS5pbmNsdWRlcyhcInRleHRcIikgJiYgZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICBjb25zb2xlLmxvZygncmVsb2FkaW5nIGpzb24gZmlsZS4uLicpO1xuXG4gICAgICAgIHNlcnZlci53cy5zZW5kKHtcbiAgICAgICAgICB0eXBlOiAnZnVsbC1yZWxvYWQnLFxuICAgICAgICAgIHBhdGg6ICcqJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICB9XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KTogYW55ID0+IHtcbiAgY29uc3QgY2RuSG9zdCA9IHByb2Nlc3MuZW52Py5DRE5fSE9TVCA/PyBcIlwiO1xuICByZXR1cm4ge1xuICAgIG1vZGU6IHByb2Nlc3MuZW52Lk1PREUsXG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgcGx1Z2luczogW3JlYWN0KCksIEpTT05IbXIoKV0sXG4gICAgcHVibGljRGlyOiAncHVibGljJyxcbiAgICBhc3NldHNJbmNsdWRlOiBbXG4gICAgICAnLi4vY29tbW9uLWFzc2V0cy9hc3NldHMvKiovKi5zdmcnLFxuICAgICAgJy4uL2NvbW1vbi1hc3NldHMvYXNzZXRzL2ltYWdlcy8qKi8qLnN2ZycsXG4gICAgICAnLi4vY29tbW9uLWFzc2V0cy9hc3NldHMvaW1hZ2VzL2ljb25zLyoqLyouc3ZnJyxcbiAgICAgICcuLi9jb21tb24tYXNzZXRzL2Fzc2V0cy9pbWFnZXMvcmVwb19pY29ucy8qKi8qLnN2ZycsXG4gICAgICAnLi4vY29tbW9uLWFzc2V0cy9hc3NldHMvaW1hZ2VzL3JpY2hfdGV4dF9pY29ucy8qKi8qLnN2ZycsXG4gICAgICAnLi4vY29tbW9uLWFzc2V0cy9hc3NldHMvKiovKi5wbmcnLFxuICAgICAgJy4uL2NvbW1vbi1hc3NldHMvYXNzZXRzLyoqLyoudHh0JyxcbiAgICAgICcuLi9jb21tb24tYXNzZXRzL2Fzc2V0cy8qKi8qLnR0ZicsXG4gICAgXSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhtcjoge1xuICAgICAgICBjbGllbnRQb3J0OiA3Nzc3LFxuICAgICAgICBwb3J0OiA3Nzc3LFxuICAgICAgfVxuICAgIH0sXG4gICAgZXhwZXJpbWVudGFsOiB7XG4gICAgICByZW5kZXJCdWlsdFVybDogKGZpbGVuYW1lOiBzdHJpbmcsIHsgaG9zdElkIH0pID0+IHtcbiAgICAgICAgaWYgKGNvbW1hbmQgPT0gXCJidWlsZFwiICYmIGNkbkhvc3QgIT0gXCJcIikge1xuICAgICAgICAgIHJldHVybiBgJHtjZG5Ib3N0fS8ke2ZpbGVuYW1lfWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgcmVsYXRpdmU6IHRydWUgfTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVCxTQUFTLG9CQUFvQjtBQUNuVixPQUFPLFdBQVc7QUFFbEIsU0FBUyxVQUFVO0FBQ2pCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQTtBQUFBLElBRVQsZ0JBQWdCLEVBQUUsTUFBTSxPQUFPLEdBQUc7QUFDaEMsVUFBSSxLQUFLLFNBQVMsTUFBTSxLQUFLLEtBQUssU0FBUyxPQUFPLEdBQUc7QUFDbkQsZ0JBQVEsSUFBSSx3QkFBd0I7QUFFcEMsZUFBTyxHQUFHLEtBQUs7QUFBQSxVQUNiLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUdBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQVc7QUF0QnhEO0FBdUJFLFFBQU0sWUFBVSxhQUFRLFFBQVIsbUJBQWEsYUFBWTtBQUN6QyxTQUFPO0FBQUEsSUFDTCxNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ2xCLFFBQVE7QUFBQSxJQUNSLFNBQVMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQUEsSUFDNUIsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sS0FBSztBQUFBLFFBQ0gsWUFBWTtBQUFBLFFBQ1osTUFBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixnQkFBZ0IsQ0FBQyxVQUFrQixFQUFFLE9BQU8sTUFBTTtBQUNoRCxZQUFJLFdBQVcsV0FBVyxXQUFXLElBQUk7QUFDdkMsaUJBQU8sR0FBRyxPQUFPLElBQUksUUFBUTtBQUFBLFFBQy9CO0FBQ0EsZUFBTyxFQUFFLFVBQVUsS0FBSztBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
