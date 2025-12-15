/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#007ACC',
				'bg-primary': '#1E1E1E',
				'bg-secondary': '#252526',
				surface: '#2D2D30',
				'text-primary': '#D4D4D4',
				'text-secondary': '#858585',
				'accent-teal': '#4EC9B0',
				'accent-orange': '#CE9178',
				'accent-green': '#6A9955',
				error: '#F48771'
			},
			fontFamily: {
				mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
				sans: ['Inter', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: []
};
