/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_GA_MEASUREMENT_ID?: string;
	readonly SHOW_PROOF?: string;
	readonly PROOF_HEADLINE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
