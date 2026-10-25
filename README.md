# gov466.github.io

Personal portfolio of **Govind Raj**, Hardware Quality & Embedded Systems Engineer in Toronto.

Live site: https://gov466.github.io/

## Structure

The site is plain static HTML with no build step. `.nojekyll` tells GitHub Pages to serve the files as they are.

| Path | Purpose |
| --- | --- |
| `index.html` | The portfolio page |
| `case-studies/` | Public case-study pages for work projects |
| `reports/*.enc` | Encrypted full reports, unlocked on the case-study pages with a password |
| `assets/` | Shared CSS and scripts (visitor tracking, report unlocking) |
| `academic/` | Academic project reports and slides |
| `404.html` | Page shown for missing URLs |
| `profile.jpg`, `resume.pdf`, `cert_*` | Headshot, resume and certification documents |
| `tools/encrypt-reports.mjs` | Encrypts the reports in `private/` |
| `private/` | Unencrypted report originals. Git-ignored, never published |

## Editing

Edit `index.html` and push to `master`. GitHub Pages publishes the change within a minute or two.

To preview locally, run `python -m http.server` in this folder and visit http://localhost:8000. (Opening the files directly works for most pages, but the report unlock needs the local server.)

Add `?me=1` to the URL once in your own browser so the visitor tracking ignores your visits.

## Password-protected reports

The full reports contain employer details, so only encrypted copies are published.
To change the password or update a report, put the PDF in `private/` and run:

```powershell
$env:REPORT_PASSWORD = 'new-password-here'; node tools/encrypt-reports.mjs
```

Then commit and push `reports/*.enc`. Anyone with the old password can no longer open the new files.

## Related projects

- [Jira Deduplicator](https://github.com/gov466/jira-deduplicator)
- [Portfolio Analytics](https://github.com/gov466/portfolio-analytics)
- [Job Market Scanner](https://github.com/gov466/job-scanner)
