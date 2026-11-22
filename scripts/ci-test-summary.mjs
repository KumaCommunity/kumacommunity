// Writes a Markdown summary of Playwright JSON reports for the GitHub Actions
// job summary. Usage: node scripts/ci-test-summary.mjs [reportDir]
// Reads <reportDir>/*.json (default: playwright-report). Never fails the job.
import {appendFileSync, existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';

const reportDir = process.argv[2] ?? 'playwright-report';
const target = process.env.GITHUB_STEP_SUMMARY;
const ansi = /\u001b\[[0-9;]*m/g;
// Markdown table cell: escape backslashes first, then pipes, then flatten lines.
const escape = (text) => String(text)
  .replace(/\\/g, '\\\\')
  .replace(/\|/g, '\\|')
  .replace(/\r?\n/g, ' ');

function* specs(suite, titles = []) {
  const path = suite.title ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) yield {spec, path};
  for (const child of suite.suites ?? []) yield* specs(child, path);
}

const lines = ['## Playwright results', ''];
const files = existsSync(reportDir)
  ? readdirSync(reportDir).filter((name) => name.endsWith('.json')).sort()
  : [];

if (files.length === 0) {
  lines.push('No Playwright JSON report was produced. Check the failing step log above.');
} else {
  lines.push('| Suite | Passed | Failed | Flaky | Skipped | Duration |', '| --- | ---: | ---: | ---: | ---: | ---: |');
  const failures = [];
  const flaky = [];
  for (const file of files) {
    const name = file.replace(/\.json$/, '');
    const report = JSON.parse(readFileSync(join(reportDir, file), 'utf8'));
    const rootDir = report.config?.rootDir ?? process.cwd();
    const {expected = 0, unexpected = 0, flaky: flakyCount = 0, skipped = 0, duration = 0} = report.stats ?? {};
    lines.push(`| ${name} | ${expected} | ${unexpected} | ${flakyCount} | ${skipped} | ${(duration / 1000).toFixed(1)}s |`);
    for (const top of report.suites ?? []) {
      for (const {spec, path} of specs(top)) {
        for (const test of spec.tests ?? []) {
          const where = `${relative(process.cwd(), join(rootDir, spec.file))}:${spec.line}`;
          const title = escape([...path.slice(1), spec.title].join(' › '));
          if (test.status === 'unexpected') {
            const error = test.results?.flatMap((result) => result.errors ?? []).find(Boolean);
            // First line plus Expected/Received, which usually explain the failure.
            const errorLines = (error?.message ?? 'No error message').replace(ansi, '').split('\n').map((line) => line.trim()).filter(Boolean);
            const message = [errorLines[0], ...errorLines.filter((line) => /^(Expected|Received)\b/.test(line))].join(' · ');
            failures.push(`| ${name} | \`${where}\` | ${title} | ${escape(message).slice(0, 300)} |`);
          } else if (test.status === 'flaky') {
            flaky.push(`- ${name}: \`${where}\` ${title}`);
          }
        }
      }
    }
  }
  if (failures.length) {
    lines.push('', '### Failed tests', '', '| Suite | Location | Test | Error |', '| --- | --- | --- | --- |', ...failures);
    lines.push('', 'Download the `playwright-report-*` artifact for HTML reports, traces and screenshots. Open a trace with `npx playwright show-trace <trace.zip>`.');
  }
  if (flaky.length) lines.push('', '### Flaky tests (passed on retry)', '', ...flaky);
}

const output = lines.join('\n') + '\n';
if (target) appendFileSync(target, output);
else process.stdout.write(output);
