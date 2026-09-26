export interface Detail {
	readonly label: string;
	readonly value: string;
}

/**
 * Fails the build when a label/value pair would render blank.
 * `source` is the file path, so the error names both the file and the label.
 */
export function assertDetails(source: string, details: readonly Detail[]): void {
	details.forEach(({ label, value }, index) => {
		if (label.trim().length === 0) {
			throw new Error(`[${source}] Label at position ${index + 1} is empty or whitespace-only.`);
		}
		if (value.trim().length === 0) {
			throw new Error(`[${source}] Label "${label}" has an empty or whitespace-only value.`);
		}
	});
}
