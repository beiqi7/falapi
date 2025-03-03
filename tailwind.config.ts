// 导入 Tailwind CSS 配置类型
const { type Config } = require('tailwindcss')

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
      },
      container: {
        center: true,
        padding: '2rem',
      },
    },
  },
  plugins: [],
}

export default config