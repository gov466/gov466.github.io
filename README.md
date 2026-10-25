# gov466.github.io

Personal portfolio of **Govind Raj**, Hardware Quality & Embedded Systems Engineer in Toronto.

Live site: https://gov466.github.io/

## Structure

The site is a single static page with no build step. `.nojekyll` tells GitHub Pages to serve the files as they are.

| Path | Purpose |
| --- | --- |
| `index.html` | The portfolio page (markup, styles and scripts inline) |
| `404.html` | Page shown for missing URLs |
| `profile.jpg` | Headshot used on the page and in link previews |
| `resume.pdf` | Downloadable resume |
| `cert_*.pdf`, `cert_*.png` | Certification documents linked from the page |
| `*_Report*.pdf` | Project reports linked from the project cards |

## Editing

Edit `index.html` and push to `master`. GitHub Pages publishes the change within a minute or two.

To preview locally, open `index.html` in a browser, or run `python -m http.server` in this folder and visit http://localhost:8000.

Add `?me=1` to the URL once in your own browser so the visitor tracking ignores your visits.

## Related projects

- [Jira Deduplicator](https://github.com/gov466/jira-deduplicator)
- [Portfolio Analytics](https://github.com/gov466/portfolio-analytics)
- [Job Market Scanner](https://github.com/gov466/job-scanner)
