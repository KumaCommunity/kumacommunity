import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {resolveContentLicense} from '@site/src/data/contentLicense';
import styles from './styles.module.css';

type Props = {
  license?: unknown;
};

export default function ContentLicenseNotice({license}: Props): ReactNode {
  const resolved = resolveContentLicense(license);
  if (!resolved) return null;

  return (
    <aside aria-label="Content license" className={styles.notice}>
      {resolved.name && resolved.url && (
        <p>
          {resolved.isDefault
            ? 'Unless otherwise noted, original educational content is licensed under '
            : 'Content license: '}
          <Link href={resolved.url}>{resolved.name}</Link>.
          {resolved.isDefault && <> <Link to="/licensing">Scope and exclusions</Link>.</>}
        </p>
      )}
      {resolved.notice && <p>{resolved.notice}</p>}
    </aside>
  );
}
