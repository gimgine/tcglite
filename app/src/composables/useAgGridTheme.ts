import { ref, onMounted, onBeforeUnmount } from 'vue';
import { themeQuartz, colorSchemeDark, colorSchemeLight } from 'ag-grid-community';

const getTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? themeQuartz.withPart(colorSchemeDark) : themeQuartz.withPart(colorSchemeLight);
};

const agGridTheme = ref(getTheme());

let mediaQuery: MediaQueryList;

export const useAgGridTheme = () => {
  onMounted(() => {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
  });

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', updateTheme);
  });

  return agGridTheme;
};

const updateTheme = () => {
  agGridTheme.value = getTheme();
};
