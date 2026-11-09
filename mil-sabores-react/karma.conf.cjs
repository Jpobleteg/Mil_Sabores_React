/* =========================================================
   Configuración de Karma (ejecutor de pruebas) + Jasmine (framework).

   · Karma abre Chrome sin interfaz (ChromeHeadless) y ejecuta las
     pruebas *.spec.js / *.spec.jsx de la carpeta src/test.
   · Webpack + Babel transforman JSX y módulos ES antes de enviarlos
     al navegador (Karma no entiende JSX por sí solo).
   · babel-plugin-istanbul instrumenta el código de src/ para medir
     la cobertura; karma-coverage genera el informe en /coverage.

   Ejecutar:  npm test          (una vez, con cobertura)
              npm run test:watch (modo observador)
   ========================================================= */
const path = require("path");

module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "webpack"],

    files: [
      { pattern: "src/test/**/*.spec.@(js|jsx)", watched: false },
      /* Imágenes de /public disponibles para los componentes durante las pruebas */
      { pattern: "public/img/**/*", watched: false, included: false, served: true }
    ],
    proxies: { "/img/": "/base/public/img/" },

    preprocessors: { "src/test/**/*.spec.@(js|jsx)": ["webpack"] },

    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      resolve: { extensions: [".js", ".jsx"] },
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                babelrc: false,
                configFile: false,
                presets: [
                  ["@babel/preset-env", { targets: { chrome: "100" } }],
                  ["@babel/preset-react", { runtime: "automatic" }]
                ],
                plugins: [
                  /* Mide cobertura solo del código de la app, no de las pruebas */
                  ["istanbul", { include: ["src/**"], exclude: ["src/test/**", "src/main.jsx"] }]
                ]
              }
            }
          },
          /* Las hojas de estilo no se necesitan en las pruebas */
          { test: /\.css$/, use: "null-loader" }
        ]
      }
    },

    reporters: ["spec", "coverage"],

    specReporter: { suppressSkipped: true, showSpecTiming: true },

    coverageReporter: {
      dir: path.join(__dirname, "coverage"),
      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
        { type: "json-summary", subdir: ".", file: "coverage-summary.json" },
        { type: "lcovonly", subdir: ".", file: "lcov.info" }
      ]
    },

    browsers: ["ChromeHeadlessSinSandbox"],
    customLaunchers: {
      ChromeHeadlessSinSandbox: { base: "ChromeHeadless", flags: ["--no-sandbox", "--disable-gpu"] }
    },

    client: { jasmine: { random: false }, clearContext: false },
    singleRun: true,
    browserNoActivityTimeout: 60000
  });
};
