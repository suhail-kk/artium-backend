const esbuild = require('esbuild');

esbuild.build({
    entryPoints: [ './index.ts' ], // Entry point to your app
    bundle: true,
    platform: 'node',
    outfile: './dist/bundle.js', // Output file
    target: 'es6',
    sourcemap: true, // Optional: generate a source map
    tsconfig: './tsconfig.json', // Optional: point to your tsconfig
}).catch(() => process.exit(1));
