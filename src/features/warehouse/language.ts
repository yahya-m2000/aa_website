import { cookies } from 'next/headers';
import { resolveWarehouseLang, WAREHOUSE_LANG_COOKIE, warehouseCopy } from './i18n';

export async function getWarehouseCopy() {
  const lang = resolveWarehouseLang((await cookies()).get(WAREHOUSE_LANG_COOKIE)?.value);
  return { lang, t: warehouseCopy[lang] };
}
