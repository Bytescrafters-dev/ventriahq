module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS config
  plugins: [require("tailwindcss-animate")],
};
