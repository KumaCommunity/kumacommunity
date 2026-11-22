import {expect, test} from '@playwright/test';
import {contentLicense, resolveContentLicense} from '../src/data/contentLicense';

test('content license defaults preserve the SPDX identifier and official URL', () => {
  for (const value of [undefined, 'CC-BY-SA-4.0']) {
    expect(resolveContentLicense(value)).toEqual({...contentLicense, isDefault: true});
  }
});

test('content license opt-out does not substitute a default license', () => {
  expect(resolveContentLicense(false)).toBeNull();
});

test('article-specific licenses and rights notices replace the default', () => {
  const alternate = {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    notice: 'See the separate illustration credit.',
  };
  expect(resolveContentLicense(alternate)).toEqual({...alternate, isDefault: false});
  expect(resolveContentLicense({notice: 'Used with permission.'}))
    .toEqual({notice: 'Used with permission.', isDefault: false});
});

test('invalid or unsafe licensing metadata fails instead of assigning CC terms', () => {
  for (const value of [
    null, true, 0, '', 'CC-BY-4.0', [], {}, {license: 'CC-BY-SA-4.0'},
    {name: 'CC BY 4.0'}, {url: contentLicense.url}, {notice: ''}, {notice: 42},
    {name: 'Example', url: 'javascript:alert(1)'},
    {name: 'Example', url: 'data:text/html,example'},
    {name: 'Example', url: '/missing-license'},
    {name: 'Example', url: 'not a URL'},
    {name: 'Example', url: 'https://example.org', attribution: 'Misspelled metadata'},
  ]) {
    expect(() => resolveContentLicense(value), JSON.stringify(value)).toThrow('Invalid content_license');
  }
});
