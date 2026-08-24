import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import unusedImports from 'eslint-plugin-unused-imports'

// NOTE ON ESLINT VERSION: pinned to 9.x on purpose. eslint-config-next depends on
// eslint-plugin-react, whose latest release (7.37.5) declares `eslint: ^3 … ^9.7` and
// throws `contextOrFilename.getFilename is not a function` under ESLint 10. Do not bump
// to 10 until eslint-plugin-react ships ESLint 10 support.

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@next/next/no-img-element': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ── Temporarily warnings, not errors ────────────────────────────────────
      // Both rules fire almost exclusively on the client-side `useEffect` + axios data
      // layer that the RTK Query migration replaces wholesale, and on the untyped
      // responses that zod schemas will type. Fixing them in place means writing the
      // same types twice. Kept visible as warnings so the count can only go down;
      // restore both to "error" once features/*/api.ts owns the fetching.
      //   - 43 × no-explicit-any, 20 × set-state-in-effect as of this commit.
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  // ── Layer boundaries ────────────────────────────────────────────────────────
  // Imports flow one way only:  app → features → entities → shared → core
  // A feature may never import another feature; if two need the same thing it belongs
  // in entities/ or shared/. Cross-feature composition happens in app/.
  // Without this rule the layering silently rots back — which is exactly how domain
  // types ended up living inside Redux slices.
  {
    files: ['features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/app'],
              message: 'features/ must not import from app/. Compose in app/ instead.',
            },
            {
              group: ['@/features/*/*'],
              message:
                'A feature may not import another feature. Move the shared piece to entities/ or shared/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/features/*', '@/store/*'],
              message:
                'entities/ sits below features/. It may only import shared/ and core/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/features/*', '@/entities/*', '@/components/*'],
              message: 'core/ is the bottom layer and may not import upward.',
            },
          ],
        },
      ],
    },
  },

  // Note: keeping `core/http/gateway` and `core/auth/session` out of client bundles is
  // left to the `server-only` package, which fails the build with a precise message. A
  // lint rule here cannot tell a Server Component .tsx from a client one.

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
