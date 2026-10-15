import {
  ComponentProps, ComponentType, lazy, LazyExoticComponent, Suspense,
} from 'react';
import { Icon } from '@openedx/paragon';

type IconProps = Omit<ComponentProps<typeof Icon>, 'src'>;

interface CatalogIconProps extends IconProps {
  // Paragon icon name, as the catalog API sends it (e.g. `RemoveRedEye`).
  name: string | null;
}

const ICON_NAME_PATTERN = /^[A-Za-z0-9]+$/;

const NoIcon = () => null;

// One lazy component per icon name, so each icon is downloaded once and shared by every render.
const lazyIcons = new Map<string, LazyExoticComponent<ComponentType>>();

const getLazyIcon = (name: string) => {
  if (!lazyIcons.has(name)) {
    lazyIcons.set(name, lazy(() => (
      ICON_NAME_PATTERN.test(name)
        // `index.js` re-exports every icon, so it stays out of the lazy chunks.
        ? import(/* webpackExclude: /index\.js$/ */ `@openedx/paragon/icons/es5/${name}.js`)
            .catch(() => ({ default: NoIcon }))
        : Promise.resolve({ default: NoIcon })
    )));
  }
  return lazyIcons.get(name)!;
};

/**
 * Renders the Paragon icon the catalog names, downloading only that icon.
 *
 * While the icon loads, and when the name is unknown, it renders an empty icon of the same size, so
 * the layout doesn't shift. When the catalog sends no icon, it renders nothing.
 */
const CatalogIcon = ({ name, ...iconProps }: CatalogIconProps) => {
  if (!name) return null;

  return (
    <Suspense fallback={<Icon src={NoIcon} {...iconProps} />}>
      <Icon src={getLazyIcon(name)} {...iconProps} />
    </Suspense>
  );
};

export default CatalogIcon;
