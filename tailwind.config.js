// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./js/**/*.{js,ts}", // <-- теперь сканируются ВСЕ .js в папке js
  ],
  safelist: [
    // hover
    "hover:bg-[var(--random-button-hover)]",
    "hover:bg-[var(--attractor-button-hover)]",
    "hover:bg-[var(--void-button-hover)]",
    // select/bg+border
    "bg-[var(--random-button-select)]",
    "border-[var(--random-button-select)]",
    "bg-[var(--attractor-button-select)]",
    "border-[var(--attractor-button-select)]",
    "bg-[var(--void-button-select)]",
    "border-[var(--void-button-select)]",
    // текст
    "text-[var(--color-black)]",
    "text-[var(--text-color)]",
  ],

  theme: {
    extend: {},
  },
  plugins: [],
};
