import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	if (mode === 'docs') {
		return {
			base: '/word-salad/',
			build: {
				outDir: 'docs',
			},
		};
	}

	return {
		build: {
			lib: {
				entry: 'src/index.ts',
				formats: ['es'],
			},
			rollupOptions: {
				external: ['lit'],
			},
		},
	};
});
