import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // El patrón de traer datos dentro de un useEffect y guardarlos con setState
      // es el estándar en esta app (un hook de datos por recurso). Se deja como
      // aviso, no como error bloqueante.
      'react-hooks/set-state-in-effect': 'warn',
      // Los archivos de contexto/hook exportan el Provider (o el ConfirmDialog)
      // y su hook juntos a propósito. Solo afecta el refresco en caliente en dev.
      'react-refresh/only-export-components': 'warn',
    },
  },
])
