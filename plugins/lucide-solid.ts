// Pre-compile regex for better performance

/**
 * SourceMap interface for transformation output
 */
interface SourceMap {
  version: number;
  sources: string[];
  names: string[];
  sourceRoot?: string;
  sourcesContent?: string[];
  mappings: string;
  file: string;
}

/**
 * Plugin interface matching Vite/Rollup plugin structure
 */
interface SolidPlugin {
  name: string;
  transform: (code: string, id: string) => TransformResult | null | undefined;
}

/**
 * Result of the transform operation
 */
interface TransformResult {
  code: string;
  map?: SourceMap | null;
}

/**
 * Creates a Vite/Astro plugin that optimizes lucide-astro imports by converting
 * destructured imports to direct imports for better tree-shaking
 *
 * @returns An Astro plugin that transforms lucide-astro imports
 */
export function createLucideSolidImportOptimizer(): SolidPlugin {
  return {
    name: "lucide-solid-optimizer",
    transform(sourceCode: string, filePath: string): TransformResult | null | undefined {
      if (!isValidInput(sourceCode, filePath)) {
        return null;
      }
      try {
        // Quick check if the file contains lucide-astro imports
        if (!sourceCode.includes("lucide-solid")) {
          return null;
        }

        const { transformedCode, hasChanges } = transformLucideImports(sourceCode);

        if (hasChanges) {
          return {
            code: transformedCode,
            map: null, // No source maps in this implementation
          };
        }

        return null;
      } catch (error) {
        handleTransformError(error);
        return null;
      }
    },
  };
}

/**
 * Validates the input parameters for processing
 */
function isValidInput(code: string, id: string): boolean {
  return Boolean(code && id);
}

/**
 * Transforms lucide-astro imports from destructured to individual imports
 */
function transformLucideImports(sourceCode: string): { transformedCode: string; hasChanges: boolean } {
  let hasChanges = false;
  const LUCIDE_IMPORT_PATTERN = /([ \t]*)import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-solid['"]/g;
  const transformedCode = sourceCode.replace(
    LUCIDE_IMPORT_PATTERN,
    (match: string, indentation: string, importNames: string): string => {
      if (!importNames.trim()) {
        return match;
      }
      const semicolonAtEnd = match.endsWith(";");
      const individualImports = convertToIndividualImports(importNames, indentation, semicolonAtEnd);
      if (individualImports) {
        hasChanges = true;
        return individualImports;
      }

      return match;
    }
  );

  return { transformedCode, hasChanges };
}

/**
 * Converts a comma-separated list of imports to individual import statements
 */
function convertToIndividualImports(importNames: string, indentation: string, withSemicolon: boolean): string {
  return importNames
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => {
      const kebabCasePath = convertToKebabCase(name);
//       console.log("before conver to keybab case", name, kebabCasePath);
      const semicolon = withSemicolon ? ";" : "";
      return `${indentation}import ${name} from 'lucide-solid/icons/${kebabCasePath}'${semicolon}`;
    })
    .join("\n");
}

/**
 * Converts a camelCase or PascalCase string to kebab-case
 */
function convertToKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, ""); // Remove leading hyphen if present
}

/**
 * Handles and logs transformation errors
 */
function handleTransformError(error: unknown): void {
  const typedError = error instanceof Error ? error : new Error(String(error));
  console.error("Error in lucide-astro-optimizer plugin:", typedError);
}
